import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetCollection from './collection';
import ReplyCollection from '../reply/collection';
import LikeCollection from '../like/collection';
import ReportCollection from '../report/collection';
import CircleCollection from '../circle/collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as likeValidator from "../like/middleware";
import * as reportValidator from "../report/middleware";
import * as circleValidator from "../circle/middleware";
import * as replyValidator from "../reply/middleware";
import * as util from './util';
import * as replyUtil from '../reply/util';
import * as likeUtil from '../like/util';
import * as reportUtil from '../report/util';
import UserCollection from '../user/collection';
import { Types } from 'mongoose';
import FollowCollection from '../follow/collection';


const router = express.Router();

/**
 * Get all the freets visible to the current user
 *
 * @name GET /api/freets
 *
 * @return {FreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?author=username
 *
 * @return {FreetResponse[]} - An array of freets created by user with username, author
 * @throws {400} - If author is not given
 * @throws {404} - If no user has given author
 *
 */
 router.get(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }
    const userCircles = await CircleCollection.findManyByMember(req.session.userId);
    const userCreatedCircles = (await CircleCollection.findManyByCreatorId(req.session.userId)).map(circle=> circle._id);
    const userCirclesIds = userCircles.map(circle => circle._id);
    const allCircles = userCirclesIds.concat(userCreatedCircles)
    const allFreets = await FreetCollection.findAllViewableFreets(allCircles);
    const response = allFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    // return everything if the user is looking for their own freets
    const author = await UserCollection.findOneByUsername(req.query.author as string);
    if (author._id.toString() === req.session.userId) {
      const authorFreets = await FreetCollection.findAllByUsername(req.query.author as string);
      const response = authorFreets.map(util.constructFreetResponse);
      res.status(200).json(response);
    }
    else {
      const authorCircles = await CircleCollection.findManyByCreatorId(author._id);
      const overlappingCircleIds: Types.ObjectId[] = []
      for (const circle of authorCircles) {
        const circleMembersIds = new Set(circle.members.map(member => member._id.toString()));
        if (circleMembersIds.has(req.session.userId)) {
          overlappingCircleIds.push(circle._id)
        }
      }
      const visibleFreets = await FreetCollection.findVisibleFreetsByAuthor(overlappingCircleIds, author._id);
      console.log(visibleFreets)
      const response = visibleFreets.map(util.constructFreetResponse);
      res.status(200).json(response);
    }
  }
);

/**
 * Get the following feed freets of the current user.
 * 
 * @name GET /api/freets/followingFeed
 * @throws {403} if the user is not logged in
 */
 router.get(
  '/followingFeed',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userFollowing = await FollowCollection.findByFollower(req.session.userId);
    const userFollowingIds = userFollowing.map(following => following.followee);
    const userCircles = await CircleCollection.findManyByMember(req.session.userId);
    const userCirclesIds = userCircles.map(circle => circle._id);
    const followingFeedFreets = await FreetCollection.findFollowingFeedFreets(userCirclesIds, userFollowingIds);
    const followFeedResponse = followingFeedFreets.map(freet => util.constructFreetResponse(freet));
    res.status(200).json({
      message: "Your following feed was retrived successfully.",
      followingFeed: followFeedResponse
    })
  }
)

/**
 * Get a freet from its id
 * 
 * @name GET /api/freets/:id
 * 
 * @return {FreetResponse} - the corresponding freet
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the freet doesn't exist
 */
 router.get(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.findOne(req.params.freetId);
    res.status(200).json({
      message: "Freet retrieved successfully",
      freet: util.constructFreetResponse(freet)
    });
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @param {string} anonymous - Whether the freet is posted anonymously
 * @param {string} circleId - The id of the circle that the freet is posted to, if any
 * @return {FreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isValidFreetContent,
    circleValidator.isCircleInBodyExists,
    circleValidator.isCircleInBodyOwner
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freet = await FreetCollection.addOne(userId, req.body.content, req.body.anonymous, req.body.circleId);
    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: util.constructFreetResponse(freet)
    });
  }
);

/**
 * Delete a freet
 * 
 * @name DELETE /api/freets/:id
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid
 */
 router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier
  ],
  async (req: Request, res: Response) => {
    await FreetCollection.deleteOne(req.params.freetId);
    await LikeCollection.deleteManyByFreet(req.params.freetId);
    await ReportCollection.deleteManyByFreet(req.params.freetId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);

/**
 * Modify a freet's content
 *
 * @name PATCH /api/freets/:id
 *
 * @param {string} content - the new content for the freet
 * @return {FreetResponse} - the updated freet
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
 router.patch(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    freetValidator.isValidFreetContent
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.updateOne(req.params.freetId, req.body.content);
    res.status(200).json({
      message: 'Your freet was updated successfully.',
      freet: util.constructFreetResponse(freet)
    });
  }
);

/**
 * Get all replies to a freet
 * 
 * @name GET /api/freets/:id/replies
 * 
 * @return {ReplyResponse[]} - a list of all the replies to the freet
 * @throws {404} - If the freetId is not valid
 * @throws {403} - If the user is not logged in
 */
 router.get(
  "/:freetId?/replies",
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer
  ],
  async (req: Request, res: Response) => {
    const replies = await ReplyCollection.findAllByParentFreet(req.params.freetId);
    const response = replies.map(replyUtil.constructReplyResponse);
    res.status(200).json(response);
  }
)

/**
 * Post a reply to a freet
 * 
 * @name POST /api/freets/:id/replies
 * 
 * @param {string} content - the content of the reply
 * @param {boolean} anonymous - whether the reply is anonymous
 * 
 * @return {ReplyResponse} - the newly created reply
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is not valid
 */
router.post(
  "/:freetId?/replies",
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
    replyValidator.isValidReplyContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const freet = await FreetCollection.findOne(req.params.freetId);
    const circle = freet.circle ? await CircleCollection.findOneById(freet.circle._id) : undefined;
    if (circle) {
      const reply = await ReplyCollection.addReplyToFreet(userId, req.params.freetId, req.body.anonymous, req.body.content, circle._id);
      res.status(201).json({
        message: 'Your reply was created successfully.',
        reply: replyUtil.constructReplyResponse(reply)
      });
    } else {
      const reply = await ReplyCollection.addReplyToFreet(userId, req.params.freetId, req.body.anonymous, req.body.content, undefined);

      res.status(201).json({
        message: 'Your reply was created successfully.',
        reply: replyUtil.constructReplyResponse(reply)
      });
    }

  }
)

/**
 * Like a freet
 * 
 * @name POST /api/freets/:id/likes
 * 
 * @return {Like} - the newly created like
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freet doesn't exist
 * @throws {409} - the like already exists
 */
router.post(
  '/:freetId?/likes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
    likeValidator.isFreetLikeNotExists
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const like = await LikeCollection.addFreetLike(userId, req.params.freetId);
    res.status(201).json({
        message: 'Your like was added successfully.',
        like: likeUtil.constructLikeResponse(like)
      });
  }
);

/**
 * Unlike a freet
 * 
 * @name DELETE /api/freets/:id/likes
 * 
 * @return {string} - a success message
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freet doesn't exists or if the user hasn't like the freet previously
 */
router.delete(
  '/:freetId?/likes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
    likeValidator.isFreetLikeExists
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const like = await LikeCollection.deleteFreetLike(userId, req.params.freetId);
    res.status(201).json({
        message: 'Your like was deleted successfully.'
      });
  }
);

/**
 * Get all likes for a freet
 * 
 * @name GET /api/freets/:id/likes
 * 
 * @return {Like[]} - an array of likes for the freet
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the freet doesn't exists
 */
router.get(
  '/:freetId?/likes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
  ],
  async (req: Request, res: Response) => {
    const freetLikes = await LikeCollection.findAllByFreet(req.params.freetId as string);
    const freetLikesResponse = freetLikes.map(like => likeUtil.constructLikeResponse(like));
      res.status(200).json({
      message: `Freet ${req.params.freetId} has ${freetLikes.length} likes.`,
      likes: freetLikesResponse
    });
  }
);

/**
 * Get all reports for a freet
 * 
 * @name GET /api/freets/:id/reports
 * 
 * @return {Report[]} - an array of reports for the freet
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the freet doesn't exists
 */
 router.get(
  '/:freetId?/reports',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
  ],
  async (req: Request, res: Response) => {
    const freetReports = await ReportCollection.findAllByFreet(req.params.freetId as string);
    const freetReportsResponse = freetReports.map(report => reportUtil.constructReportResponse(report));
      res.status(200).json({
      message: `Freet ${req.params.freetId} has ${freetReports.length} reports.`,
      reports: freetReportsResponse
    });
  }
);

/**
 * Report a freet
 * 
 * @name POST /api/freets/:id/reports
 * 
 * @return {Report} - the newly created report
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the freet doesn't exist
 * @throws {409} - if the report already exists
 */
router.post(
  '/:freetId?/reports',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetViewer,
    reportValidator.isFreetReportNotExists
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const report = await ReportCollection.addFreetReport(userId, req.params.freetId);
    const allReports = await ReportCollection.findAllByFreet(req.params.freetId);
    if (allReports.length >= 10){
      await FreetCollection.deleteOne(req.params.freetId);
    }
    res.status(201).json({
        message: 'Your report was added successfully.',
        report: reportUtil.constructReportResponse(report)
      });
  }
);

export {router as freetRouter};
