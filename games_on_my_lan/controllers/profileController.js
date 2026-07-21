import profileService from '../services/profileService.js';

async function getProfile(req, res) {
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
}

export default {
    getProfile
};