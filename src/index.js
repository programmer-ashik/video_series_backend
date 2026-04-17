import dotenv from "dotenv";
import { DB_NAME } from "./constant.js";
import connectDb from "./db/db.js";
import express from "express";
const app = express();
dotenv.config({
  path: "./env",
});
connectDb();

/*
// efe
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("error:", { error });
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is runing on port: ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error:", { error });
    throw error;
  }
})();
*/
