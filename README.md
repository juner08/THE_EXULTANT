# The Exultant

**Group 7 — The Exultant**

The Exultant is the official student publication of Holy Cross Academy. This repository contains the static HTML/CSS/JavaScript prototype of the publication's website — a public news portal for reading articles and a separate admin panel for managing content, categories, and users.

## Deployment

The site is live and deployed automatically via **GitHub Pages** (built from the `main` branch, repository root):

**https://juner08.github.io/THE_EXULTANT/**

| Item | Value |
| --- | --- |
| Live site | https://juner08.github.io/THE_EXULTANT/ |
| Repository | https://github.com/juner08/THE_EXULTANT |
| Deployment method | GitHub Pages (legacy build, branch `main`, path `/`) |
| Push to redeploy | `git push origin main` |

## System Overview

A browser-based publication platform built with plain HTML, Bootstrap 5, and vanilla JavaScript. There is no server runtime — all data, sessions, and uploads are handled in the browser, which mirrors the logic of the original PHP/MySQL version (`config/db.php`, `includes/article_media.php`, `includes/video.php`).

**Public pages**

- Home with featured story, latest news, and recent articles
- Section pages: News, Sports, Opinion, Features, Literary, Entertainment, Announcements
- Article reader with image/video support, Archives, Search, and About pages

**Admin panel** (`/admin`)

- Login with role-based access (admin, author)
- Dashboard, article list with filters, add/edit article with image and video upload
- Category and user management, plus site settings

**Data layer**

- `localStorage` persistence with seed data matching `database.deploy.sql` (articles, categories, users, comments)
- Session handling, flash messages, upload validation, and a 2 GB simulated video limit

## Project Structure

```
├── index.html            # Home page
├── news.html             # Section pages
├── sports.html
├── opinion.html
├── features.html
├── literary.html
├── entertainment.html
├── announcements.html    # Announcements section
├── archives.html         # Article archive
├── article.html          # Article reader
├── search.html           # Search
├── about.html            # About the publication
├── admin/                # Admin panel pages
└── assets/
    ├── css/style.css     # Site styling
    ├── js/core.js        # Data layer, auth, shared helpers
    ├── js/public-pages.js
    ├── js/admin-pages.js
    ├── img/              # Emblem and image assets
    └── uploads/          # Article images and videos
```

## Team

**Group 7 — The Exultant**
