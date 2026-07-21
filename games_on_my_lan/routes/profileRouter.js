import express from "express";
import profileController from "../controllers/profileController.js";

const router = express.Router();

router.get("/profile", profileController.getProfile);

export default router;