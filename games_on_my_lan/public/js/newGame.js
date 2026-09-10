document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Vista previa de la miniatura ---------- */
    const thumbnailInput = document.getElementById("thumbnail");
    const thumbnailPreview = document.getElementById("thumbnailPreview");

    if (thumbnailInput && thumbnailPreview) {

        thumbnailInput.addEventListener("change", () => {

            const file = thumbnailInput.files[0];

            if (file) {

                const reader = new FileReader();

                reader.onload = (event) => {
                    thumbnailPreview.src = event.target.result;
                };

                reader.readAsDataURL(file);
            }

        });
    }

    /* ---------- Zona de arrastre para el .zip ---------- */
    const dropZone = document.getElementById("gameFileDrop");
    const gameFileInput = document.getElementById("gameFile");
    const gameFileName = document.getElementById("gameFileName");

    if (dropZone && gameFileInput) {

        const showFileName = () => {
            const file = gameFileInput.files[0];
            if (gameFileName) {
                gameFileName.textContent = file ? `📄 ${file.name}` : "";
            }
        };

        gameFileInput.addEventListener("change", showFileName);

        ["dragenter", "dragover"].forEach((eventName) => {
            dropZone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dropZone.classList.add("dragover");
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            dropZone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dropZone.classList.remove("dragover");
            });
        });

        dropZone.addEventListener("drop", (event) => {

            const file = event.dataTransfer.files[0];

            if (file) {
                gameFileInput.files = event.dataTransfer.files;
                showFileName();
            }

        });
    }

    /* ---------- Contador de caracteres de la descripción ---------- */
    const description = document.getElementById("gameDescription");
    const descCount = document.getElementById("descCount");

    if (description && descCount) {

        const updateCount = () => {
            descCount.textContent = description.value.length;
        };

        updateCount();
        description.addEventListener("input", updateCount);
    }

});
