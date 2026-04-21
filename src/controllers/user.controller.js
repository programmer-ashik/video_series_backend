import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// we transfar can make this function on utils file
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // as id user is instance of User replace
    user.refreshToken = refreshToken;
    // when save refreshToken isPasswordCorrect() methods autoamtic tregraed. to stop this call
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Somethis went sent while generating AccessToken and RefeshToken"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //  take data from client
  // validation format-not empty
  // check if user already exists:username, email
  // check have file or not
  // upload image cloudinary,avatar
  // create user object as per valid user data
  // remove pass and refresh token filed from response
  // check for user creation
  //  return response
  const { username, fullName, email, password } = req.body;
  // read abot [].some methods
  if ([username, fullName, email].some((field) => field.trim() == "")) {
    throw new ApiError(400, "All Field is Require");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or userName");
  }
  // req.files comes from middleware use in route
  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file require");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // check coverImage have in req.files
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // is avatar is uploading in clodinary successfull check whare
  if (!avatar) {
    throw new ApiError(400, "Avatar file require");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // which field we are not want to send in response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something Send Wrong While registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // get email and loainText_pass from client
  // validate email and password
  // give a accesstoken and refreshToken
  // send accesstoken as cookie
  // rend response
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or password is require");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(400, "User dose not exist");
  }
  // use is instance on User
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "password is invalid");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  // set on cokkies and return user data
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loginUser,
          accessToken,
          refreshToken,
        },
        "User Loged In Successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  console.log("request User:", req.user._id);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Logout Success-fully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // find refreshtoken from cookies
  // verifi refreshtoken by jwt
  const incommingRefreshToken =
    req.cookie.refreshAccessToken || req.header.refreshAccessToken;
  if (!incommingRefreshToken) {
    throw new ApiError(400, "Unauthorize requiest");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken, "for check user.controller 168 line");
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Imvalid requiest");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token didnot match with database");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("accessToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError("");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.user;
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new ApiError(401, "You are not valid user");
    }
    // check password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(402, "Your Password is wrong");
    }
    user.password = newPassword;
    //when only on propeties are chnages then use validateBeforeSave: false
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Your Password is Changes Successful"));
  } catch (error) {
    throw new ApiError(400, "You are not valid user");
  }
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Get Current User successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName & email)) {
    throw new ApiError(400, "required fullname and email");
  }
  const user = await User.findByIdAndUpdate(
    req.body?._id,
    {
      $set: { fullName, email },
    },
    { new: true } //new:true use for when update complate then give response
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Upate Successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  // avatar localpath comes from middleware using on route
  // you can got avatarLocalPath in req.file (not use req.fiels is a single file uploading)
  // check local path and if not throw error
  // upload avatar in clodinary use cloudinary function come form util
  // check have avatar?.url have or not
  // return response it successfully updated
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(
      400,
      "AvaterLocalpath not Found check avatar upload in local file successfully"
    );
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Avater not uploaded in Cludinary successfully");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar upload successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "cover image not found");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);
  if (!coverImage?.url) {
    throw new ApiError(
      400,
      "Error occurd while coverImage uploading in cloudinary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage chnage successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (username.trim() == "") {
    throw new ApiError(400, "Username is require");
  }
  const channel = await User.aggregate([
    // at first match the user by username using $match stage
    // use $lookup stage to subscribe and subdcribers collection
    {
      $match: { username: username.toLowerCase() },
    },
    {
      // $lookup stage use for join two collection in mongodb
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribToChannel",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        subscribToChannelCount: { $size: "$subscribToChannel" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribToChannelCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  console.log(channel);
  if (!channel || channel.length === 0) {
    throw new ApiError(404, "Channel not found with this username");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel Profile"));
});
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.Objectid(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipelines: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipelines: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetch successfully"
      )
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
