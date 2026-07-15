import express from "express";
import authService from "../services/authService.js";

const router = express.Router();


router.post("/login", async (req, res) => {

    const { username, password } = req.body;


    const user = await authService.login(
        username,
        password
    );


    if (!user) {
        return res.status(401).send("Usuario o contraseña incorrectos");
    }


    req.session.user = {
        id: user.id
    };


    res.redirect("/profile");

});


export default router;