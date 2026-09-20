import express from "express";
import authController from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();
router.get("/login", authController.showLogin);
router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);
export default router;