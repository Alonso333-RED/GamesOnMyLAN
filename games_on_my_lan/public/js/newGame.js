const thumbnailInput = document.getElementById("thumbnail");
const thumbnailPreview = document.getElementById("thumbnailPreview");


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