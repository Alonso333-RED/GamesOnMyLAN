import express from "express";
import userController from "../controllers/userController.js";
import {requireGuestRegister} from "../middlewares/settings.js";

const router = express.Router();

router.get("/register",
    requireGuestRegister,
    userController.showRegister);

router.post("/register",
    requireGuestRegister,
    userController.register);

router.get("/profile", userController.getSelfUser);

router.get("/profile/:userId", userController.getUserById);

router.get("/users", userController.getAllUsers);

export default router;