import profileService from "../services/profileService.js";
import gamesService from "../services/gamesService.js";


async function getProfile(req, res) {

    if (!req.session.user) {
        return res.redirect("/login");
    }


    const user = await profileService.getProfile(
        req.session.user.id
    );


    if (!user) {
        return res.status(404).send(
            "Usuario no encontrado"
        );
    }
    
    gamesService.getGamesByAuthorId(req.session.user.id).then(games => {
        res.render("profile", {
            title: "Perfil",
            user,
            games
        });
    });

}


export default {
    getProfile
};