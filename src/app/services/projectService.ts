import { Mongoose } from 'mongoose';
import { DEFAULT_STATUS } from '../constants/defaultStatus';
const Project = require('../model/project');
import * as Board from '../model/board';
import * as Status from '../model/status';

export const initProject = async (
  body: any,
  ownerId: string | undefined,
  dbConnection: Mongoose,
) => {
  const projectModel = Project.getModel(dbConnection);
  const boardModel = Board.getModel(dbConnection);
  const statusModel = Status.getModel(dbConnection);

  if (!body.name) throw new Error('name for project must be provided');
  if (!ownerId) throw new Error('ownerId is undefined');

  try {
    // init statuses;
    const statuses = await statusModel.create(DEFAULT_STATUS);
    // initl board
    const board = new boardModel({ title: body.name });
    // init proejct
    const proejct = await projectModel.create({ ...body, boardId: board._id, ownerId });

    // binding refs
    board.taskStatus = statuses.map((doc) => doc._id);
    await board.save();

    statuses.forEach(async (statusDoc) => {
      statusDoc.board = board.id;
      await statusDoc.save();
    });
    return proejct;
  } catch (error: any) {
    throw new Error(error);
  }
};
