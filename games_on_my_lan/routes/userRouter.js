import express from "express";
import userController from "../controllers/userController.js";
import {requireGuestRegister} from "../middlewares/settings.js";
import { registerLimiter } from "../middlewares/rateLimit.js";
import { requireLogin, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/register",
    requireGuestRegister,
    userController.showRegister);

router.post("/register",
    requireGuestRegister,
    registerLimiter,
    userController.register);

router.get("/profile", userController.getSelfUser);

router.get("/profile/:userId", userController.getUserById);

router.get("/users", userController.getAllUsers);

router.post("/users/:userId/role",
    requireLogin,
    requireRole("owner"),
    userController.changeRole);

export default router;