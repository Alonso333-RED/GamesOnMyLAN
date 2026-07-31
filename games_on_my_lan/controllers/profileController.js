import profileService from "../services/profileService.js";


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


    res.render("profile", {
        title: "Perfil",
        user
    });

}


export default {
    getProfile
};