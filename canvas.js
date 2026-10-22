const canvas = document.getElementById('scrapbook-canvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

canvas.width = 600;
canvas.height = 380;

const toggleButtons = document.querySelectorAll('.tool-tabs button');
const backgroundContainer = document.getElementById('background-container');
const stickerContainer = document.getElementById('sticker-container');
const textContainer = document.getElementById('text-container');
const toolsContainer = document.getElementById('tools-container');
const brushSizeInput = document.getElementById('brush-size');
const brushColorInput = document.getElementById('brush-color');
const uploadButton = document.getElementById('upload-image');
const imageInput = document.getElementById('image-input');
const textInput = document.getElementById('text-input');
const fontSelect = document.getElementById('font-select');
const textSizeInput = document.getElementById('text-size');
const textColorInput = document.getElementById('text-color');

let isDrawing = false;
let currentTool = null;
let backgroundImage = null;
let stickers = [];
let brushStrokes = [];
let texts = [];
let lastX = 0, lastY = 0;
let scale = 1;
let uploadedImage = null;
let imageX = 50, imageY = 50, imageWidth = 300, imageHeight = 0;

let undoStack = [];
let redoStack = [];

let isDraggingImage = false;
let isDraggingStickers = false;
let currentSticker = null;
let offsetX = 0, offsetY = 0;
let isDraggingText = false;
let currentText = null;
let textOffsetX = 0, textOffsetY = 0;

function downscaleImage(sourceImg, targetWidth, targetHeight) {
    let currentWidth = sourceImg.width;
    let currentHeight = sourceImg.height;

    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = currentWidth;
    currentCanvas.height = currentHeight;
    let currentCtx = currentCanvas.getContext('2d');
    currentCtx.imageSmoothingEnabled = true;
    currentCtx.imageSmoothingQuality = 'high';
    currentCtx.drawImage(sourceImg, 0, 0);

    while (currentWidth / 2 > targetWidth && currentHeight / 2 > targetHeight) {
        const nextWidth  = Math.max(targetWidth, Math.floor(currentWidth / 2));
        const nextHeight = Math.max(targetHeight, Math.floor(currentHeight / 2));

        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = nextWidth;
        nextCanvas.height = nextHeight;

        const nextCtx = nextCanvas.getContext('2d');
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

        currentCanvas = nextCanvas;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

    return finalCanvas;
}

document.getElementById('zoom-in').addEventListener('click', () => {
    scale = Math.min(scale + 0.1, 3);
    canvas.style.transform = `scale(${scale})`;
});

document.getElementById('zoom-out').addEventListener('click', () => {
    scale = Math.max(scale - 0.1, 0.3);
    canvas.style.transform = `scale(${scale})`;
});

document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (canvas.requestFullscreen) canvas.requestFullscreen();
});

uploadButton.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const displayWidth = 300;
            const displayHeight = (img.height / img.width) * displayWidth;

            const renderWidth  = displayWidth * 2;
            const renderHeight = Math.round(displayHeight * 2);

            const processed = downscaleImage(img, renderWidth, renderHeight);

            const finalImg = new Image();
            finalImg.onload = function () {
                uploadedImage = finalImg;
                imageWidth  = displayWidth;
                imageHeight = displayHeight;
                saveState();
                redrawCanvas();
            };
            finalImg.src = processed.toDataURL('image/png');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

document.addEventListener('DOMContentLoaded', () => {
    hideAllOptions();
    toggleButtons.forEach(button => {
        button.addEventListener('click', handleToggleClick);
    });
});

const toolPanel = document.querySelector('.tool-panel');

function hideAllOptions() {
    backgroundContainer.style.display = 'none';
    stickerContainer.style.display = 'none';
    textContainer.style.display = 'none';
    toolsContainer.style.display = 'none';
    toolPanel.classList.remove('has-open-panel');
}

function handleToggleClick(e) {
    const button = e.target.closest('button');
    if (!button) return;

    const buttonId = button.id;

    if (isContainerVisible(buttonId)) {
        hideAllOptions();
        currentTool = null;
    } else {
        hideAllOptions();
        switch (buttonId) {
            case 'toggle-background':
                backgroundContainer.style.display = 'grid';
                currentTool = null;
                break;
            case 'toggle-stickers':
                stickerContainer.style.display = 'grid';
                currentTool = null;
                break;
            case 'text-toggle-btn':
                textContainer.style.display = 'block';
                currentTool = null;
                break;
            case 'toggle-brush-tool':
                toolsContainer.style.display = 'block';
                currentTool = 'brush';
                break;
            default:
                currentTool = null;
        }
        toolPanel.classList.add('has-open-panel');
    }
}

function isContainerVisible(buttonId) {
    switch (buttonId) {
        case 'toggle-background': return backgroundContainer.style.display === 'grid';
        case 'toggle-stickers':   return stickerContainer.style.display === 'grid';
        case 'text-toggle-btn':   return textContainer.style.display === 'block';
        case 'toggle-brush-tool': return toolsContainer.style.display === 'block';
        default: return false;
    }
}

const brushColorPicker = document.getElementById('brush-color-picker');
const brushPreview = document.getElementById('brush-preview');

function updateBrushPreview() {
    const size = brushSizeInput.value;
    document.getElementById('brush-size-label').textContent = size;

    if (brushPreview) {
        brushPreview.style.width  = Math.max(6, parseInt(size) * 2) + 'px';
        brushPreview.style.height = Math.max(6, parseInt(size) * 2) + 'px';
        brushPreview.style.background = brushColorInput.value;
    }
}

brushSizeInput.addEventListener('input', updateBrushPreview);

if (brushColorPicker) {
    brushColorPicker.querySelectorAll('.swatch[data-color]').forEach(swatch => {
        swatch.addEventListener('click', () => {
            brushColorInput.value = swatch.dataset.color;

            brushColorPicker.querySelectorAll('.swatch')
                .forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            updateBrushPreview();
        });
    });

    brushColorInput.addEventListener('input', () => {
        brushColorPicker.querySelectorAll('.swatch')
            .forEach(s => s.classList.remove('active'));
        brushColorPicker.querySelector('.swatch.custom')?.classList.add('active');
        updateBrushPreview();
    });

    brushColorPicker.querySelector('.swatch[data-color="#000000"]')?.classList.add('active');
}

updateBrushPreview();

const textColorPicker = document.getElementById('text-color-picker');
const textPreview = document.getElementById('text-preview');

function updateTextPreview() {
    const size = textSizeInput.value;
    document.getElementById('text-size-label').textContent = size;

    if (textPreview) {
        textPreview.style.fontSize = size + 'px';
        textPreview.style.color = textColorInput.value;
        textPreview.style.fontFamily = fontSelect.value;

        const typed = textInput.value.trim();
        textPreview.textContent = typed || 'Preview';
    }
}

textSizeInput.addEventListener('input', updateTextPreview);
fontSelect.addEventListener('change', updateTextPreview);
textInput.addEventListener('input', updateTextPreview);

if (textColorPicker) {
    textColorPicker.querySelectorAll('.swatch[data-color]').forEach(swatch => {
        swatch.addEventListener('click', () => {
            textColorInput.value = swatch.dataset.color;

            textColorPicker.querySelectorAll('.swatch')
                .forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            updateTextPreview();
        });
    });

    textColorInput.addEventListener('input', () => {
        textColorPicker.querySelectorAll('.swatch')
            .forEach(s => s.classList.remove('active'));
        textColorPicker.querySelector('.swatch.custom')?.classList.add('active');
        updateTextPreview();
    });

    textColorPicker.querySelector('.swatch[data-color="#000000"]')?.classList.add('active');
}

updateTextPreview();

document.querySelectorAll('.background-preview').forEach(bg => {
    bg.addEventListener('click', () => {
        const src = bg.getAttribute('data-background');
        setBackgroundOnCanvas(src);
    });
});

function setBackgroundOnCanvas(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        backgroundImage = img;
        saveState();
        redrawCanvas();
    };
}

document.querySelectorAll('.sticker').forEach(sticker => {
    sticker.addEventListener('click', () => {
        const src = sticker.getAttribute('data-sticker');
        addStickerToCanvas(src);
    });
});

function addStickerToCanvas(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        stickers.push({
            img: img,
            x: 50,
            y: 50,
            width: 100,
            height: (100 / img.width) * img.height
        });
        saveState();
        redrawCanvas();
    };
}

document.getElementById('add-text-btn').addEventListener('click', addTextToCanvas);

function addTextToCanvas() {
    const text = textInput.value.trim();
    if (!text) { alert('Please enter some text!'); return; }

    texts.push({
        text: text,
        x: 50,
        y: 100,
        font: fontSelect.value,
        fontSize: textSizeInput.value,
        textColor: textColorInput.value
    });

    textInput.value = '';
    updateTextPreview();
    saveState();
    redrawCanvas();
}

function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function getStickerAtPosition(x, y) {
    for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) return s;
    }
    return null;
}

function getTextAtPosition(x, y) {
    for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        ctx.font = `${t.fontSize}px ${t.font}`;
        const width = ctx.measureText(t.text).width;
        const fs = parseInt(t.fontSize);
        if (x >= t.x && x <= t.x + width && y >= t.y - fs && y <= t.y) return t;
    }
    return null;
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePosition(e);

    if (currentTool === 'brush' && toolsContainer.style.display === 'block') {
        saveState();
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
        ctx.beginPath();
        ctx.lineTo(lastX, lastY);
        ctx.strokeStyle = brushColorInput.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        brushStrokes.push({
            color: brushColorInput.value,
            size: brushSizeInput.value,
            path: [{ x: lastX, y: lastY }]
        });
        return;
    }

    const t = getTextAtPosition(pos.x, pos.y);
    if (t) {
        saveState();
        isDraggingText = true;
        currentText = t;
        textOffsetX = pos.x - t.x;
        textOffsetY = pos.y - t.y;
        return;
    }

    const s = getStickerAtPosition(pos.x, pos.y);
    if (s) {
        saveState();
        isDraggingStickers = true;
        currentSticker = s;
        offsetX = pos.x - s.x;
        offsetY = pos.y - s.y;
        return;
    }

    if (uploadedImage) {
        const right = imageX + imageWidth;
        const bottom = imageY + imageHeight;
        if (pos.x >= imageX && pos.x <= right && pos.y >= imageY && pos.y <= bottom) {
            isDraggingImage = true;
            canvas.style.cursor = 'move';
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePosition(e);

    if (isDrawing && currentTool === 'brush') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        const stroke = brushStrokes[brushStrokes.length - 1];
        if (stroke) stroke.path.push({ x: pos.x, y: pos.y });
        return;
    }

    if (isDraggingText && currentText) {
        currentText.x = pos.x - textOffsetX;
        currentText.y = pos.y - textOffsetY;
        redrawCanvas();
        return;
    }

    if (isDraggingStickers && currentSticker) {
        currentSticker.x = pos.x - offsetX;
        currentSticker.y = pos.y - offsetY;
        redrawCanvas();
        return;
    }

    if (isDraggingImage && uploadedImage) {
        imageX = pos.x - imageWidth / 2;
        imageY = pos.y - imageHeight / 2;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
    }
    isDraggingImage = false;
    isDraggingStickers = false;
    isDraggingText = false;
    canvas.style.cursor = currentTool === 'brush' ? 'crosshair' : 'default';
});

canvas.addEventListener('mouseleave', () => {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
    }
    isDraggingImage = false;
    isDraggingStickers = false;
    isDraggingText = false;
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    if (uploadedImage) {
        ctx.drawImage(uploadedImage, imageX, imageY, imageWidth, imageHeight);
    }

    stickers.forEach(s => {
        ctx.drawImage(s.img, s.x, s.y, s.width, s.height);
    });

    brushStrokes.forEach(stroke => {
        if (stroke.path.length < 1) return;
        ctx.beginPath();
        stroke.path.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    });

    texts.forEach(t => {
        ctx.font = `${t.fontSize}px ${t.font}`;
        ctx.fillStyle = t.textColor;
        ctx.fillText(t.text, t.x, t.y);
    });
}

function saveState() {
    const state = getCurrentState();
    if (undoStack.length === 0 || !areStatesEqual(state, undoStack[undoStack.length - 1])) {
        undoStack.push(state);
        redoStack = [];
    }
}

function getCurrentState() {
    return {
        stickers: stickers.map(s => ({ ...s })),
        brushStrokes: brushStrokes.map(s => ({ ...s, path: [...s.path] })),
        backgroundImage: backgroundImage,
        uploadedImage: uploadedImage,
        texts: texts.map(t => ({ ...t })),
        imageX, imageY, imageWidth, imageHeight
    };
}

function areStatesEqual(a, b) {
    if (!a || !b) return false;
    return a.stickers.length === b.stickers.length &&
           a.brushStrokes.length === b.brushStrokes.length &&
           a.texts.length === b.texts.length &&
           a.backgroundImage === b.backgroundImage &&
           a.uploadedImage === b.uploadedImage;
}

document.getElementById('undo-btn').addEventListener('click', () => {
    if (undoStack.length === 0) return;
    redoStack.push(getCurrentState());
    restoreState(undoStack.pop());
});

document.getElementById('redo-btn').addEventListener('click', () => {
    if (redoStack.length === 0) return;
    undoStack.push(getCurrentState());
    restoreState(redoStack.pop());
});

function restoreState(state) {
    stickers = state.stickers.map(s => ({ ...s }));
    brushStrokes = state.brushStrokes.map(s => ({ ...s, path: [...s.path] }));
    backgroundImage = state.backgroundImage;
    uploadedImage = state.uploadedImage;
    texts = state.texts.map(t => ({ ...t }));
    imageX = state.imageX;
    imageY = state.imageY;
    imageWidth = state.imageWidth;
    imageHeight = state.imageHeight;
    redrawCanvas();
}

document.getElementById('clear-canvas').addEventListener('click', () => {
    if (!confirm('Clear the entire canvas?')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stickers = [];
    brushStrokes = [];
    backgroundImage = null;
    uploadedImage = null;
    texts = [];
    undoStack = [];
    redoStack = [];
    redrawCanvas();
});

document.getElementById('savedev-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'scrapbook.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

document.getElementById('save-btn').addEventListener('click', () => {
    const canvasData = canvas.toDataURL('image/png');
    const pageTitle = prompt('Enter a title for this page:');
    if (!pageTitle) { alert('Title is required to save the page.'); return; }

    fetch('save_canvas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pageTitle, data: canvasData })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) loadSavedPages();
    })
    .catch(err => {
        console.error(err);
        alert('Save failed. Check console.');
    });
});

document.getElementById('share-btn').addEventListener('click', () => {
    if (navigator.share) {
        canvas.toBlob(blob => {
            const file = new File([blob], 'scrapbook.png', { type: 'image/png' });
            navigator.share({
                files: [file],
                title: 'Scrapbook',
                text: 'Check out my scrapbook!'
            }).catch(() => {});
        });
    } else {
        alert('Sharing is not supported on this browser.');
    }
});

let savedPages = [];

function loadSavedPages() {
    fetch('load_canvas.php')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.pages) {
                savedPages = data.pages;
                displaySavedPages();
            }
        })
        .catch(err => console.error('Error loading pages:', err));
}

function displaySavedPages() {
    const list = document.getElementById('saved-pages-list');
    list.innerHTML = '';

    if (savedPages.length === 0) {
        list.innerHTML = '<p style="font-size:12px;color:var(--text-muted);text-align:center;">No saved pages yet.</p>';
        return;
    }

    savedPages.forEach((page, i) => {
        const item = document.createElement('div');
        item.classList.add('saved-page-item');
        item.innerHTML = `
            <img src="${page.image_path}" alt="Page ${i + 1}">
            <p>${page.title || 'Page ' + (i + 1)}</p>
        `;
        item.addEventListener('click', () => loadPage(page.id));
        list.appendChild(item);
    });
}

function loadPage(pageId) {
    const page = savedPages.find(p => p.id === pageId);
    if (!page) return;

    const img = new Image();
    img.src = page.image_path;
    img.onload = () => {
        uploadedImage = img;
        imageX = 0;
        imageY = 0;
        imageWidth = canvas.width;
        imageHeight = canvas.height;
        stickers = [];
        brushStrokes = [];
        texts = [];
        backgroundImage = null;
        undoStack = [];
        redoStack = [];
        redrawCanvas();
    };
}

document.addEventListener('DOMContentLoaded', loadSavedPages);

(function showWelcome() {
    const params = new URLSearchParams(window.location.search);
    const welcomeName = params.get('welcome');
    if (!welcomeName) return;

    const name = decodeURIComponent(welcomeName);

    const toast = document.createElement('div');
    toast.className = 'welcome-toast';
    toast.innerHTML = `
        <span class="welcome-toast-icon">🎉</span>
        <div class="welcome-toast-text">
            <strong>Welcome, ${name}!</strong>
            <span>Start creating your first memory page.</span>
        </div>
    `;

    const container = document.getElementById('toast-container');
    if (container) container.appendChild(toast);

    if (typeof confetti === 'function') {
        const colors = ['#7d2989', '#9c34a8', '#faa77c', '#ff8a4c', '#fdd835', '#2ecc71', '#3498db'];

        confetti({
            particleCount: 80,
            spread: 90,
            startVelocity: 45,
            origin: { y: 0.35 },
            colors: colors
        });

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 70,
                origin: { x: 0, y: 0.6 },
                colors: colors
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 70,
                origin: { x: 1, y: 0.6 },
                colors: colors
            });
        }, 200);
    }

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    }, 5000);

    history.replaceState({}, '', window.location.pathname);
})();

(function preloadToolImages() {
    const imageUrls = new Set();

    document.querySelectorAll('.background-preview').forEach(el => {
        const url = el.getAttribute('data-background');
        if (url) imageUrls.add(url);
    });

    document.querySelectorAll('.sticker').forEach(el => {
        const url = el.getAttribute('data-sticker');
        if (url) imageUrls.add(url);
    });

    const cache = document.createElement('div');
    cache.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;';
    document.body.appendChild(cache);

    imageUrls.forEach(url => {
        const img = new Image();
        img.decoding = 'sync';
        img.src = url;
        cache.appendChild(img);

        if (img.decode) {
            img.decode().catch(() => {});
        }
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('logout-trigger');
    const modal = document.getElementById('logout-modal');
    const cancel = document.getElementById('logout-cancel');
    const confirmBtn = document.getElementById('logout-confirm');

    if (!trigger || !modal) return;

    function openModal() {
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    trigger.addEventListener('click', openModal);

    cancel.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    confirmBtn.addEventListener('click', () => {
        window.location.href = 'logout.php';
    });
});