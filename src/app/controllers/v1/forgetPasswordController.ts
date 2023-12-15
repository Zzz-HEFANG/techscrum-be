import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import { isUserActive } from '../../services/emailCheckService';
import * as User from '../../model/user';
import { forgetPassword } from '../../utils/emailSender';
import jwt from 'jsonwebtoken';
import config from '../../config/app';
declare module 'express-serve-static-core' {
  interface Request {
    email?: string;
  }
}

//Emil Register
export const forgetPasswordApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const { email } = req.body;

  try {
    const existUser: boolean = await isUserActive(email, req.dbConnection);
    if (!existUser) return res.status(status.NOT_FOUND).send();
    const user = await User.getModel(req.dbConnection).findOne({ email, active: true });

    const token = jwt.sign({ email }, config.forgotSecret, {
      expiresIn: '30m',
    });

    await forgetPassword(email, user?.name, token, req.headers.origin ?? '');

    return res.send(user);
  } catch (e) {
    next(e);
  }
};

export const getUserEmail = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  return res.status(status.OK).send({ email: req.email });
};

export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const email = req.email;
  const { password } = req.body;
  try {
    const user = await User.getModel(req.dbConnection).findOne({ email });
    user.password = password;
    user.active = true;
    await user.save();
    if (user) return res.send(user);
    res.status(status.NOT_FOUND).send();
  } catch (e) {
    next(e);
  }
};
