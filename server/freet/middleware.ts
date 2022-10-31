import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import CircleCollection from '../circle/collection';

/**
 * Checks if a freet with freetId is req.params exists
 */
const isFreetExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const freet = validFormat ? await FreetCollection.findOne(req.params.freetId) : '';
  if (!freet) {
    console.log("thinks the freet doesn't exist");
    res.status(404).json({
      error: `Freet with freet ID ${req.params.freetId} does not exist.`
    });
    return;
  }

  next();
};

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidFreetContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: 'Freet content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Freet content must be no more than 140 characters.'
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the freet whose freetId is in req.params
 */
const isValidFreetModifier = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.params.freetId);
  const userId = freet.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' freets.'
    });
    return;
  }

  next();
};

/**
 * Check that a user can view the freet.
 */
 const isValidFreetViewer = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.params.freetId);
  const authorId = freet.authorId._id.toString();
  const circle = freet.circle ? (await CircleCollection.findOneById(freet.circle._id)) : undefined
  const circleMembers = circle ? circle.members : []
  const circleMemberIds = new Set(circleMembers.map(member => member._id.toString()));
  const circleOwner = circle ? circle.creatorId._id : undefined;
  if ((freet.private && req.session.userId !== authorId) || 
      (freet.circle && ((!circleMemberIds.has(req.session.userId)) && circleOwner.toString() !== req.session.userId))) {
    res.status(403).json({
      error: "You do not have access to view this freet."
    });
    return;
  }
  next();
};

export {
  isValidFreetContent,
  isFreetExists,
  isValidFreetModifier,
  isValidFreetViewer
};
