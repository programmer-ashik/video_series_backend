import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
export { registerUser };
