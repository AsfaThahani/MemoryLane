const stickerContainer = document.getElementById('sticker-container');
const toggleStickersButton = document.getElementById('toggle-stickers');

toggleStickersButton.addEventListener('click', function () {
    if (stickerContainer.style.display === 'none') {
        stickerContainer.style.display = 'block';
    } else {
        stickerContainer.style.display = 'none';
    }
});


stickerContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('sticker')) {
        const sticker = new Image();
        sticker.src = e.target.getAttribute('data-sticker');
        sticker.onload = function () {
            ctx.drawImage(sticker, 50, 50); 
        };
    }
});
