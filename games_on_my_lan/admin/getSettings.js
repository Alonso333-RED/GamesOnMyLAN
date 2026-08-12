import fs from "fs/promises";

const settingsData = JSON.parse(
    await fs.readFile(
        "./admin/settings.json",
        "utf8"
    )
);

export default settingsData;