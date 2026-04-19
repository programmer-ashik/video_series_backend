import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// can make this function on utils file
const generateAccessAndRefreshToken=async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()
    user.refreshToken=refreshToken
    // when save refreshToken isPasswordCorrect autoamtic tregraed. to stop this use
     await user.save({validateBeforeSave:false})
     return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500,'Somethis went sent while generating AccessToken and RefeshToken')
  }
}

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
const loginUser = asyncHandler((req, res) => {
  // get email and loainText_pass from client
  // validate email and password
  // give a accesstoken and refreshToken
  // send accesstoken as cookie
  // rend response
  const { email, username, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "Username or password is require");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if(!user){
    throw new ApiError(400,"User dose not exist")
  }
 const isPasswordValid= await user.isPasswordCorrect(password)
 if(!isPasswordValid){
    throw new ApiError(401,"password is invalid")
  }
  const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)
  const loginUser= await User.findById(user._id).select("-password -refreshToken")
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
      user:loginUser, accessToken, refreshToken
    },"User Loged In Successfully")
  )
});
const logoutUser= asyncHandler((req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{refreshToken:undefined}
    },
    {
      new:true
    }
  )
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken")
  .clearCookie("refreshToken")
  .json(new ApiResponse(200,{},"Message"))
})
export { registerUser, loginUser };
