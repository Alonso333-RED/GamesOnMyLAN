import express from "express";
import registerController from "../controllers/registerController.js";
import {requireGuestRegister} from "../middlewares/settings.js";

const router = express.Router();

router.get("/register",
    requireGuestRegister,
    registerController.showRegister);

router.post("/register",
    requireGuestRegister,
    registerController.register);

export default router;