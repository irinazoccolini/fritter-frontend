import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import ReportCollection from '../report/collection';

/**
 * Checks if a report with freetId and userId doesn't exist yet.
 */
const isFreetReportNotExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const report = validFormat ? await ReportCollection.findOneByFreetAndReporter(req.session.userId, req.params.freetId) : '';
  if (report) {
    res.status(409).json({
      error: `You've already reported this freet.`
    });
    return;
  }
  next();
};

/**
 * Checks if a report with replyId and userId doesn't exist yet.
 */
const isReplyReportNotExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.replyId);
  const report = validFormat ? await ReportCollection.findOneByReplyAndReporter(req.session.userId, req.params.replyId) : '';
  if (report) {
    res.status(409).json({
      error: `You've already reported this reply.`
    });
    return;
  }
  next();
};


export {
  isFreetReportNotExists,
  isReplyReportNotExists
};

  