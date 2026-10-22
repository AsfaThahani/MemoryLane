<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: index.html');
    exit;
}

function scan_images($folder, $allowed = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg' , 'jfif']) {
    $dir = __DIR__ . '/' . $folder;
    if (!is_dir($dir)) return [];

    $files = array_diff(scandir($dir), ['.', '..']);
    $result = [];

    foreach ($files as $file) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, $allowed)) {
            $result[] = $file;
        }
    }

    natcasesort($result);
    return array_values($result);
}

$backgrounds = scan_images('background');
$stickers    = scan_images('sticker');

function find_icon($base) {
    $extensions = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif'];
    foreach ($extensions as $ext) {
        $file = __DIR__ . '/icons/' . $base . '.' . $ext;
        if (file_exists($file)) {
            return 'icons/' . $base . '.' . $ext;
        }
    }
    return null;
}

$icons = [
    'background' => find_icon('background'),
    'sticker'    => find_icon('sticker'),
    'text'       => find_icon('text'),
    'brush'      => find_icon('brush'),
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Lane | Canvas</title>
    <link rel="icon" href="logo.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alata&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="canvas.css">
    <link rel="stylesheet" href="toggle.css">
</head>
<body>

    <header class="site-header">
        <a href="index.html" class="brand">
            <img src="logo.png" alt="Memory Lane Logo" class="brand-logo">
            <h2 class="logo">Memory Lane</h2>
        </a>

        <div class="canvas-actions">
            <button class="icon-btn" id="undo-btn" title="Undo">
                <ion-icon name="arrow-undo"></ion-icon>
            </button>
            <button class="icon-btn" id="redo-btn" title="Redo">
                <ion-icon name="arrow-redo"></ion-icon>
            </button>
            <button class="btn btn-ghost" id="zoom-out" title="Zoom Out">−</button>
            <button class="btn btn-ghost" id="zoom-in" title="Zoom In">+</button>
            <button class="btn btn-ghost" id="fullscreen-btn" title="Maximize">Maximize</button>
            <button class="btn btn-ghost" id="clear-canvas" title="Clear Canvas">Clear</button>
            <button class="btn btn-ghost" id="upload-image" title="Upload Image">Upload</button>
            <input type="file" id="image-input" accept="image/*" hidden>

            <span class="header-divider"></span>

            <button id="save-btn" class="btn btn-primary" title="Save Page to Server">Save Page</button>
            <button id="savedev-btn" class="btn btn-ghost" title="Save to Device">Download</button>
            <button id="share-btn" class="btn btn-ghost" title="Share">Share</button>

            <span class="header-divider"></span>

            <button class="toggle-container" aria-label="Switch theme">
                <span class="toggle-sky"></span>

                <span class="toggle-cloud toggle-cloud-1"></span>
                <span class="toggle-cloud toggle-cloud-2"></span>
                <span class="toggle-cloud toggle-cloud-3"></span>

                <span class="toggle-star toggle-star-1"></span>
                <span class="toggle-star toggle-star-2"></span>
                <span class="toggle-star toggle-star-3"></span>
                <span class="toggle-star toggle-star-4"></span>

                <span class="toggle-circle">
                    <span class="toggle-sun"></span>
                    <span class="toggle-moon"></span>
                </span>
            </button>

            <button class="icon-btn btn-logout" id="logout-trigger" title="Log Out" aria-label="Log Out">
                <ion-icon name="log-out-outline"></ion-icon>
            </button>
        </div>
    </header>

    <main class="canvas-layout">

        <aside class="tool-panel">
            <div class="tool-tabs">
                <button id="toggle-background">
                    <?php if ($icons['background']): ?>
                        <img src="<?= htmlspecialchars($icons['background']) ?>" alt="" class="tab-icon">
                    <?php else: ?>
                        <span class="tab-emoji">🎨</span>
                    <?php endif; ?>
                    Backgrounds
                </button>

                <button id="toggle-stickers">
                    <?php if ($icons['sticker']): ?>
                        <img src="<?= htmlspecialchars($icons['sticker']) ?>" alt="" class="tab-icon">
                    <?php else: ?>
                        <span class="tab-emoji">✨</span>
                    <?php endif; ?>
                    Stickers
                </button>

                <button id="text-toggle-btn">
                    <?php if ($icons['text']): ?>
                        <img src="<?= htmlspecialchars($icons['text']) ?>" alt="" class="tab-icon">
                    <?php else: ?>
                        <span class="tab-emoji">✏️</span>
                    <?php endif; ?>
                    Text
                </button>

                <button id="toggle-brush-tool">
                    <?php if ($icons['brush']): ?>
                        <img src="<?= htmlspecialchars($icons['brush']) ?>" alt="" class="tab-icon">
                    <?php else: ?>
                        <span class="tab-emoji">🖌️</span>
                    <?php endif; ?>
                    Brush
                </button>
            </div>

            <div id="background-container" class="options-panel">
    <?php if (empty($backgrounds)): ?>
        <p style="font-size:12px;color:var(--text-muted);">No backgrounds found in <code>background/</code></p>
    <?php else: ?>
        <?php foreach ($backgrounds as $file): ?>
            <?php $url = 'background/' . rawurlencode($file); ?>
            <img
                src="<?= htmlspecialchars($url) ?>"
                class="background-preview"
                data-background="<?= htmlspecialchars($url) ?>"
                alt="<?= htmlspecialchars(pathinfo($file, PATHINFO_FILENAME)) ?>"
                loading="lazy"
                decoding="async">
        <?php endforeach; ?>
    <?php endif; ?>
</div>

            <div id="sticker-container" class="options-panel">
    <?php if (empty($stickers)): ?>
        <p style="font-size:12px;color:var(--text-muted);">No stickers found in <code>sticker/</code></p>
    <?php else: ?>
        <?php foreach ($stickers as $file): ?>
            <?php $url = 'sticker/' . rawurlencode($file); ?>
            <img
                src="<?= htmlspecialchars($url) ?>"
                class="sticker"
                data-sticker="<?= htmlspecialchars($url) ?>"
                alt="<?= htmlspecialchars(pathinfo($file, PATHINFO_FILENAME)) ?>"
                loading="lazy"
                decoding="async">
        <?php endforeach; ?>
    <?php endif; ?>
</div>

            <div id="text-container" class="options-panel" style="display: none;">
                <label for="font-select">Font</label>
                <select id="font-select" class="styled-select">
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Afacad Flux Black">Afacad Flux Black</option>
                    <option value="Beauty Mountains Personal Use">Beauty Mountains Cursive</option>
                </select>

                <label for="text-size">
                    Size: <span id="text-size-label">20</span>
                </label>
                <input type="range" id="text-size" min="10" max="100" value="20">

                <label>Color</label>
                <div class="color-picker" id="text-color-picker">
                    <button type="button" class="swatch" data-color="#000000" style="background:#000000" aria-label="Black"></button>
                    <button type="button" class="swatch" data-color="#ffffff" style="background:#ffffff" aria-label="White"></button>
                    <button type="button" class="swatch" data-color="#7d2989" style="background:#7d2989" aria-label="Purple"></button>
                    <button type="button" class="swatch" data-color="#faa77c" style="background:#faa77c" aria-label="Peach"></button>
                    <button type="button" class="swatch" data-color="#e74c3c" style="background:#e74c3c" aria-label="Red"></button>
                    <button type="button" class="swatch" data-color="#f1c40f" style="background:#f1c40f" aria-label="Yellow"></button>
                    <button type="button" class="swatch" data-color="#2ecc71" style="background:#2ecc71" aria-label="Green"></button>
                    <button type="button" class="swatch" data-color="#3498db" style="background:#3498db" aria-label="Blue"></button>
                    <button type="button" class="swatch" data-color="#9b59b6" style="background:#9b59b6" aria-label="Violet"></button>
                    <button type="button" class="swatch" data-color="#e67e22" style="background:#e67e22" aria-label="Orange"></button>
                    <label class="swatch custom" title="Custom color" aria-label="Custom color">
                        <span class="custom-plus">+</span>
                        <input type="color" id="text-color" value="#000000">
                    </label>
                </div>

                <label for="text-input">Text</label>
                <textarea id="text-input" placeholder="Type your text here..." rows="3"></textarea>

                <div class="text-preview-box">
                    <span id="text-preview">Preview</span>
                </div>

                <button id="add-text-btn">Add Text</button>
            </div>

            <div id="tools-container" class="options-panel" style="display: none;">
                <label for="brush-size">
                    Brush Size: <span id="brush-size-label">5</span>
                    <span id="brush-preview"></span>
                </label>
                <input type="range" id="brush-size" min="1" max="10" value="5">

                <label>Brush Color</label>
                <div class="color-picker" id="brush-color-picker">
                    <button type="button" class="swatch" data-color="#000000" style="background:#000000" aria-label="Black"></button>
                    <button type="button" class="swatch" data-color="#ffffff" style="background:#ffffff" aria-label="White"></button>
                    <button type="button" class="swatch" data-color="#7d2989" style="background:#7d2989" aria-label="Purple"></button>
                    <button type="button" class="swatch" data-color="#faa77c" style="background:#faa77c" aria-label="Peach"></button>
                    <button type="button" class="swatch" data-color="#e74c3c" style="background:#e74c3c" aria-label="Red"></button>
                    <button type="button" class="swatch" data-color="#f1c40f" style="background:#f1c40f" aria-label="Yellow"></button>
                    <button type="button" class="swatch" data-color="#2ecc71" style="background:#2ecc71" aria-label="Green"></button>
                    <button type="button" class="swatch" data-color="#3498db" style="background:#3498db" aria-label="Blue"></button>
                    <button type="button" class="swatch" data-color="#9b59b6" style="background:#9b59b6" aria-label="Violet"></button>
                    <button type="button" class="swatch" data-color="#e67e22" style="background:#e67e22" aria-label="Orange"></button>
                    <label class="swatch custom" title="Custom color" aria-label="Custom color">
                        <span class="custom-plus">+</span>
                        <input type="color" id="brush-color" value="#000000">
                    </label>
                </div>
            </div>
        </aside>

        <section class="canvas-stage">
            <div class="canvas-scroll-outer">
                <div class="canvas-scroll">
                    <canvas id="scrapbook-canvas" width="600" height="380"></canvas>
                </div>
            </div>
        </section>

        <aside class="saved-pages-container">
            <h3>Saved Pages</h3>
            <div class="saved-pages-scroll-outer">
                <div id="saved-pages-list" class="saved-pages-list"></div>
            </div>
        </aside>
    </main>

    <div id="toast-container"></div>

    <div class="logout-modal-backdrop" id="logout-modal" style="display: none;">
        <div class="logout-modal">
            <div class="logout-modal-icon">
                <ion-icon name="log-out-outline"></ion-icon>
            </div>
            <h3>Log out?</h3>
            <p>You'll need to log in again to access your scrapbook.</p>
            <div class="logout-modal-actions">
                <button class="btn btn-ghost" id="logout-cancel">Cancel</button>
                <button class="btn btn-danger" id="logout-confirm">Yes, Log Out</button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
    <script src="canvas.js"></script>
    <script src="toggle.js"></script>
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
</body>
</html>