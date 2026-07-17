import express from "express";
import profileService from "../services/profileService.js";


const router = express.Router();


router.get("/profile", async (req,res)=>{


    if(!req.session.user){
        return res.status(401).json({
            error:"No autenticado"
        });
    }


    const user = await profileService.getProfile(
        req.session.user.id
    );


    if(!user){
        return res.status(404).json({
            error:"Usuario no encontrado"
        });
    }


    res.json(user);

});


export default router;