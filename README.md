# MemoryLane | Interactive Digital Scrapbook & Canvas Web Application

[![PHP](https://img.shields.io/badge/PHP-7.4%20%7C%208.x-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B%20%7C%20Canvas%20API-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![HTML5](https://img.shields.io/badge/HTML5-Modern%20Markup-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive%20Styling-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

**MemoryLane** is an interactive, creative web application designed for digital journaling, scrapbooking, and memory preservation. Users can design customized visual canvas pages combining decorative stickers, custom background textures, freehand drawing brushes, and typography, with automated cloud/local persistence backed by a relational MySQL database.

---

## Core Features

- **Interactive Canvas Editor:** Rich HTML5 Canvas environment supporting freehand sketching, customizable brush sizes, and dynamic color palettes.
- **Custom Image Uploads & Stickers:** Upload personal photos and decorate canvas pages with decorative stickers, pins, and custom background textures.
- **User Authentication & Session Security:** Secure multi-user login and registration system with BCrypt password hashing (`password_hash` / `password_verify`).
- **Canvas Persistence & Snapshots:** Export and save custom canvas layouts directly to the MySQL database with automated user-page associations.
- **Saved Memory Gallery:** Load, view, and continue editing past scrapbook entries tied to authenticated user accounts.
- **Celebratory Visual Feedback:** Integrated confetti particle animations (`canvas-confetti`) celebrating newly created memory milestones.

---

## Screenshots

### Landing & Exploration Page
![Landing Page](ss/Landing.png)

### Interactive Canvas & Journaling Workspace
![Canvas Workspace](ss/Canvas.png)

---

## Tech Stack

- **Backend:** PHP (Native Session Authentication, Prepared MySQLi Statements)
- **Database:** MySQL / MariaDB (Relational User & Canvas Page Schema)
- **Frontend:** HTML5 Canvas API, Vanilla JavaScript (ES6+), CSS3 Flexbox/Grid
- **External Libraries:** Google Fonts (Alata, Inter), Canvas Confetti, Ionicons

---

## Database Architecture

The application database is structured around two relational tables defined in `schema.sql`:

* **`users`:** Stores registered user accounts with encrypted credentials (`id`, `username`, `email`, `password`, `created_at`).
* **`canvas_pages`:** Stores user-created scrapbook artwork and snapshot image references with cascade delete constraints (`id`, `user_id`, `title`, `image_path`, `created_at`).

---

## Getting Started

### Prerequisites

* [XAMPP](https://www.apachefriends.org/) (Apache + MySQL/MariaDB) or any local LAMP/WAMP/MAMP stack with PHP 7.4+ or 8.x
* Modern web browser (Chrome, Edge, Firefox, Safari)

---

### Step 1: Place the Project in `htdocs`

Ensure this folder is located in your XAMPP web root:
```text
C:\xampp\htdocs\MemoryLane
```

Or clone directly into `htdocs`:
```bash
cd C:\xampp\htdocs
git clone https://github.com/AsfaThahani/MemoryLane.git
```

---

### Step 2: Database Setup

1. Start **Apache** and **MySQL** from your XAMPP Control Panel.
2. Open **phpMyAdmin** in your browser (`http://localhost/phpmyadmin`).
3. Click the **Import** tab.
4. Select `schema.sql` from the `MemoryLane` root folder and click **Import** (or create a database named `memorylane` and run the script).
5. The `schema.sql` automatically provisions:
   ```sql
   CREATE DATABASE IF NOT EXISTS memorylane;
   USE memorylane;
   -- Creates `users` and `canvas_pages` tables
   ```

---

### Step 3: Database Connection Configuration

If your local MySQL credentials differ from the standard XAMPP defaults, update `db.php`:

```php
$server_name   = "127.0.0.1";
$username      = "root";
$password      = "";          // Your MySQL root password (default is empty in XAMPP)
$database_name  = "memorylane";
$port          = 3306;        // Standard MySQL port (or 3307 if configured)
```

---

### Step 4: Run the Application

Open your browser and navigate to:
```text
http://localhost/MemoryLane
```

Sign up for a new account, log in, and start creating your memory canvas!

---

## License

Copyright © 2026 Asfa Thahani. All Rights Reserved.

This project is proprietary and confidential. Published strictly for personal portfolio demonstration, evaluation, and code review. Unauthorized commercial use, reproduction, modification, or redistribution is strictly prohibited. See [LICENSE](LICENSE) for full legal terms.
