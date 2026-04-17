// error handel from nodejs
class ApiError extends Error {
  // only on constructor can call in a single class
  constructor(
    statusCode,
    message = "Somthing went wrong",
    error = [],
    stack = ""
  ) {
    // if we doing extends (Inheritance) we should call super()
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = this.error;
    if (stack) {
      this.stack = stack;
    } else {
      // Error.captureStackTrace(targetObject, constructorOpt);
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
