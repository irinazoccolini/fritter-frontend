import type {Request, Response} from 'express';
import express from 'express';
import FreetCollection from '../freet/collection';
import UserCollection from './collection';
import FollowCollection from '../follow/collection';
import * as userValidator from '../user/middleware';
import * as followValidator from '../follow/middleware';
import * as util from './util';
import * as followUtil from '../follow/util';
import ReplyCollection from '../reply/collection';
import CircleCollection from '../circle/collection';

const router = express.Router();

/**
 * Get the signed in user
 * TODO: may need better route and documentation
 * (so students don't accidentally delete this when copying over)
 *
 * @name GET /api/users/session
 *
 * @return - currently logged in user, or null if not logged in
 */
router.get(
  '/session',
  [],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUserId(req.session.userId);
    res.status(200).json({
      message: 'Your session info was found successfully.',
      user: user ? util.constructUserResponse(user) : null
    });
  }
);

/**
 * Sign in user.
 *
 * @name POST /api/users/session
 *
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @return {UserResponse} - An object with user's details
 * @throws {403} - If user is already signed in
 * @throws {400} - If username or password is  not in the correct format,
 *                 or missing in the req
 * @throws {401} - If the user login credentials are invalid
 *
 */
router.post(
  '/session',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isValidPassword,
    userValidator.isAccountExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsernameAndPassword(
      req.body.username, req.body.password
    );
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: 'You have logged in successfully',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Sign out a user
 *
 * @name DELETE /api/users/session
 *
 * @return - None
 * @throws {403} - If user is not logged in
 *
 */
router.delete(
  '/session',
  [
    userValidator.isUserLoggedIn
  ],
  (req: Request, res: Response) => {
    req.session.userId = undefined;
    res.status(200).json({
      message: 'You have been logged out successfully.'
    });
  }
);

/**
 * Create a user account.
 *
 * @name POST /api/users
 *
 * @param {string} username - username of user
 * @param {string} password - user's password
 * @return {UserResponse} - The created user
 * @throws {403} - If there is a user already logged in
 * @throws {409} - If username is already taken
 * @throws {400} - If password or username is not in correct format
 *
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.addOne(req.body.username, req.body.password);
    await CircleCollection.addMutuals(user._id.toString());
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: `Your account was created successfully. You have been logged in as ${user.username}`,
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Update a user's profile.
 *
 * @name PATCH /api/users
 *
 * @param {string} username - The user's new username
 * @param {string} password - The user's new password
 * @return {UserResponse} - The updated user
 * @throws {403} - If user is not logged in
 * @throws {409} - If username already taken
 * @throws {400} - If username or password are not of the correct format
 */
router.patch(
  '/',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidUsername,
    userValidator.isUsernameNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const user = await UserCollection.updateOne(userId, req.body);
    res.status(200).json({
      message: 'Your profile was updated successfully.',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Delete a user.
 *
 * @name DELETE /api/users
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 */
router.delete(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await UserCollection.deleteOne(userId);
    await FreetCollection.deleteManyByAuthorId(userId);
    await ReplyCollection.deleteManyByAuthor(userId);
    const circles = await CircleCollection.findManyByCreatorId(userId);
    for (const circle of circles){
      await ReplyCollection.privateManyByCircle(circle._id);
      await FreetCollection.privateManyByCircle(circle._id);
    }
    await CircleCollection.deleteManyByUser(userId);
    req.session.userId = undefined;
    res.status(200).json({
      message: 'Your account has been deleted successfully.'
    });
  }
);

/**
 * Follow a user.
 * 
 * @name POST /api/users/:username/followers
 * 
 * @return {Follow} - the newly created follow
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the given user id doesn't exist
 */
 router.post(
  '/:username?/followers',
  [
    userValidator.isUserLoggedIn,
    userValidator.isUsernameInParamsExists,
    followValidator.isFollowNotExists,
    followValidator.isFollowable
  ],
  async (req: Request, res: Response) => {
    const currentUser = await UserCollection.findOneByUserId(req.session.userId as string);
    const userToFollow = await UserCollection.findOneByUsername(req.params.username as string);
    const follow = await FollowCollection.addFollow(req.session.userId, userToFollow._id.toString());
    const followInverse = await FollowCollection.findOneByFollowerAndFollowee(userToFollow._id.toString(), req.session.userId);
    if (followInverse){
      await CircleCollection.addMemberToMutuals(userToFollow._id, currentUser._id);
      await CircleCollection.addMemberToMutuals(currentUser._id, userToFollow._id);
    }
    res.status(200).json({
      message: "Your follow has been added successfully.",
      follow: followUtil.constructFollowResponse(follow)
    });
  }
);

/**
 * Unfollow a user
 * 
 * @name DELETE /api/users/:username/followers
 * 
 * @return {string} - a sucess message
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the given user id doesn't exist
 */
router.delete(
  '/:username?/followers',
  [
    userValidator.isUserLoggedIn,
    userValidator.isUsernameInParamsExists,
    followValidator.isFollowExists
  ],
  async(req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.username as string);
    await FollowCollection.deleteFollow(req.session.userId, user._id.toString());
    res.status(200).json({
      message: "Your follow was deleted successfully."
    });
  }
);

/**
 * Get all of a user's followers
 * 
 * @name GET /api/users/:username/followers
 * 
 * @return {Follow[]} - an array of the followers
 * @throws {403} - if the user is not logged in
 */
router.get(
  '/:username?/followers',
  [
    userValidator.isUserLoggedIn,
    userValidator.isUsernameInParamsExists,
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.username as string);
    const followers = await FollowCollection.findByFollowee(user._id.toString());
    const followersResponse = followers.map(follower => followUtil.constructFollowResponse(follower))
    res.status(200).json({
      message: `Followers for user ${req.params.username} returned successfully.`,
      followers: followersResponse
    });
  }
);

/**
 * Get all the users that a user is following
 * 
 * @name GET /api/users/:username/following
 * 
 * @return {Follow[]} - an array of who the user follows
 * @throws {403} - if the user is not logged in
 */
router.get(
  '/:username?/following',
  [
    userValidator.isUserLoggedIn,
    userValidator.isUsernameInParamsExists,
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUsername(req.params.username as string);
    const following = await FollowCollection.findByFollower(user._id.toString());
    const followingResponse = following.map(follow => followUtil.constructFollowResponse(follow))
    res.status(200).json({
      message: `The users that user ${req.params.username} is following returned successfully.`,
      following: followingResponse
    });
  }
);

export {router as userRouter};
