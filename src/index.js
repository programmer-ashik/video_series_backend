import dotenv from "dotenv";
import { DB_NAME } from "./constant.js";
import connectDb from "./db/db.js";
import express from "express";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on Port: ${process.env.PORT}`);
    });
    app.on("error", () => {
      console.log("Error:", { error });
    });
  })
  .catch((error) => {
    console.log("Mongodb connection Faild");
  });















  
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
