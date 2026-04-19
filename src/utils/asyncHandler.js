// 1st approcs
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asyncHandler };

/*
// 2nd approch
normal function
const asyncHandler=(fun)=>(req, res, next)=>{
  }
const asyncHandler = (fun) => async (req, res, next) => {
  try {
    await fun(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      sucess: false,
      message: err.message,
    });
  }
};*/
