import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import User from "../models/user.models";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  // todo
  //  use try catch function
  //  take accesstoken for req.cookies
  // check token have on req.cokkies/ becouse in mobileApp have no cookies section
  // decode token by jwt.verify with token and ACCESS_TOKEN_SECRITE
  // now find user by decodeToken._id accept("-password -refreshToken")
  // check user have in database
  // send use in req.user=user
  //   next()
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "UnAuthorized request");
    }
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "User not found by token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "Invalit Access Token");
  }
});
