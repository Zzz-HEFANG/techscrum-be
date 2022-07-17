import { Request, Response, NextFunction } from 'express';
const project = require('../../../model/project');
const status = require('http-status');
import { validationResult } from 'express-validator';
import { replaceId } from '../../../services/replace/replace';
const mongoose = require('mongoose');

exports.store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const shortcutId = new mongoose.Types.ObjectId();
  const { id } = req.params;
  const { webAddress, shortcutName } = req.body;
  const updatedProject = await project.getModel(req.dbConnection).findByIdAndUpdate(
    { _id: id },
    {
      $push: {
        shortcut: [{ _id: shortcutId, shortcutLink: webAddress, name: shortcutName }],
      },
    }, 
    { new: true },
  );

  const shortCut = updatedProject.shortcut.filter((data:any)=>{
    return data._id.toString() === shortcutId.toString();
  });

  if (shortCut) {
    res.status(status.OK).send(replaceId(shortCut[0]));
  } else {
    res.sendStatus(status.CONFLICT);
  }
};

exports.update = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {

    const { projectId, shortcutId } = req.params;
    const { webAddress, shortcutName } = req.body;
    const updateShortcutFlag = await project.getModel(req.dbConnection).updateOne(
      { _id: projectId, 'shortcut._id': shortcutId },
      {
        $set: { 'shortcut.$.shortcutLink': webAddress, 'shortcut.$.name': shortcutName },
      },
    );
    if (updateShortcutFlag) {
      res.status(status.OK).send();
    } else {
      res.status(status.CONFLICT).send();
    }
  } catch (e) {
    next(e);
  }
};

exports.destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {
    const { projectId, shortcutId } = req.params;
    const updatedProject = await project.getModel(req.dbConnection).updateOne(
      { _id: projectId },

      { $pull: { shortcut: { _id: shortcutId } } },
    );
    if (updatedProject) {
      res.status(status.OK).send();
    } else {
      res.status(status.NOT_ACCEPTABLE).send();
    }
  } catch (e) {
    next(e);
  }
};
