import { Mongoose } from 'mongoose';
import { IDailyScrum, IDailyScrumTimeStampModified } from '../types';
import * as User from '../model/user';
import * as DailyScrum from '../model/dailyScrum';
import * as Project from '../model/project';
const {
  removeDuplicateDate,
  convertTimestampToDate,
  removeDuplicateTimestamps,
} = require('../utils/dashboardDataTransformation');

export const findDailyScrums = async (
  findFilter: any,
  populateFilter: any,
  dbConnection: Mongoose,
) => {
  const dailyScrumModel = DailyScrum.getModel(dbConnection);
  const dailyScrums = await dailyScrumModel
    .find(findFilter)
    .populate({ path: 'userId', model: User.getModel(dbConnection) })
    .populate({ path: 'projectId', model: Project.getModel(dbConnection) })
    .populate(populateFilter);
  return dailyScrums;
};

export const findDailyScrumsByProjectAndUser = async (
  projectId: string,
  userId: string,
  dbConnection: Mongoose,
  userConnection: Mongoose,
) => {
  const dailyScrumModel = DailyScrum.getModel(dbConnection);
  const UserModel = User.getModel(userConnection);

  const dailyScrums: IDailyScrum[] = await dailyScrumModel
    .find({ project: projectId, user: userId }, { progresses: 1, title: 1 })
    .populate({ path: 'user', model: UserModel, select: ['name'] })
    .lean(); // use lean() to avoid toJSON method

  // filter the progresses of daily scrums to generate daily progresses
  const dailyScrumsWithFilteredProgresses: IDailyScrumTimeStampModified[] = dailyScrums.map(
    (dailyScrum: IDailyScrum) => {
      return {
        ...dailyScrum,
        progresses: removeDuplicateDate(
          convertTimestampToDate(removeDuplicateTimestamps(dailyScrum.progresses)).reverse(),
        ).reverse(),
      };
    },
  );

  return dailyScrumsWithFilteredProgresses;
};
