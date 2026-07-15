export default function requireAuth(req, res, next){

    if(!req.session.user){
        return res.status(401).send("Debes iniciar sesión");
    }

    next();
}