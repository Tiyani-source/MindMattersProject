import express from "express";
import {
  addUniversity,
  viewUniversities,
  deleteUniversity,
} from "../controllers/universityController.js";
import authAdmin from "../middleware/authAdmin.js";
import upload from "../middleware/uploadMiddleware.js";

const universityRouter = express.Router();

universityRouter.post("/add", upload.single("image"), addUniversity);

universityRouter.get("/view", viewUniversities);


universityRouter.delete("/delete/:id",deleteUniversity);

export default universityRouter;
