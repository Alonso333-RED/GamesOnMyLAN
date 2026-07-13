import express from "express";
import authService from "../services/authService.js";

const router = express.Router();


router.post("/login", async (req, res) => {

    const { username, password } = req.body;


    const usuario = await authService.login(
        username,
        password
    );


    if (!usuario) {
        return res.status(401).send("Usuario o contraseña incorrectos");
    }


    req.session.usuario = {
        id: usuario.id,
        username: usuario.username
    };


    res.send("Login correcto");

});


export default router;