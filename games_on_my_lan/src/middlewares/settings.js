import fs from "fs/promises";

const settingsData = JSON.parse(
    await fs.readFile("./admin/settings.json", "utf8")
);

export function requireGuestRegister(req, res, next) {
    const guestRegister = settingsData.guest_register;

    if (guestRegister === false) {
        return res
            .status(403)
            .send("Registro de invitados deshabilitado por el host");
    }

    next();
}