import { Request, Response, NextFunction } from "express";
const status = require("http-status");
const { validationResult } = require("express-validator");
const Tenant = require("../../../model/tenant");
//GET ALL
exports.index = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  res.send("Express + TypeScript Server5");
};
//POST
exports.store = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const tenant = new Tenant(req.body);

  try {
    await tenant.save();
    res.status(status.CREATED).send({ tenant });
  } catch (e: any) {
    next(e);
  }
};

//PUT
exports.update = (req: Request, res: Response) => {};

//GET ONE
exports.show = (req: Request, res: Response) => {};

//DELETE
exports.delete = (req: Request, res: Response) => {};
