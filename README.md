# NovaChain Studio — Web3 Portfolio Website

A professional Web3 portfolio website built with **Node.js**, **Express**, **EJS**, **HTMX-style partial updates**, editable JSON datasets, Motion-powered UI animation, and a generated **`blackhole.glb`** background.

This project is intentionally designed as a **privacy-friendly Web3 portfolio**: it does **not** include wallet connection, MetaMask popups, wallet analytics, token balance checks, or user NFT fetching.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Run on Network / Internet IP](#run-on-network--internet-ip)
- [NPM Scripts](#npm-scripts)
- [Content Datasets](#content-datasets)
- [3D Black Hole Model](#3d-black-hole-model)
- [Animation System](#animation-system)
- [Advanced State Layer](#advanced-state-layer)
- [Backend Routes](#backend-routes)
- [Contact Form Storage](#contact-form-storage)
- [Security and Privacy](#security-and-privacy)
- [SEO Files](#seo-files)
- [Deployment Notes](#deployment-notes)
- [Future Upgrade Ideas](#future-upgrade-ideas)

---

## Overview

This website is a cinematic Web3 portfolio for developers, studios, NFT teams, DAO contributors, DeFi builders, and blockchain product designers.

It includes:

- A generated **visible GLB black hole model**
- Scroll-driven black hole animation
- Cursor-reactive visual effects
- Project case-study modals
- HTMX-style dynamic partial loading
- Editable portfolio datasets
- Contact lead capture
- Motion/quality controls
- Command palette
- Advanced runtime state panel
- Privacy-first Web3 positioning

---

## Core Features

### Portfolio Sections

- Hero section
- About section
- Featured projects
- Services
- Pricing packages
- Build process
- Trust and security checklist
- Skills
- Smart contract showcase
- Testimonials
- FAQ
- Contact form

### Interaction Features

- Project category filters
- Project case-study modal
- Floating orbit navigation
- Command palette
- Keyboard shortcuts
- Copy email button
- Toast notifications
- Motion pause/resume
- Animation quality selector
- Advanced state panel

### Visual Features

- Generated `blackhole.glb` background
- Scroll frame-by-frame animation
- Accretion disk effects
- Photon ring effects
- Cursor glow
- Gravity ripple click effect
- Card tilt effects
- Motion-powered entrance animations
- Responsive dark neon interface

---

## Tech Stack

### Backend

- Node.js
- Express
- EJS
- Helmet
- JSON file datasets

### Frontend

- HTML
- CSS
- EJS templates
- HTMX-style attributes
- Local `mini-htmx.js`
- Canvas/WebGL-style black hole renderer
- Motion browser animation package

### Animation Packages

Installed:

```json
{
  "motion": "^12.40.0",
  "framer-motion": "^12.40.0"
}
```

Notes:

- `motion` is used in the current non-React frontend.
- `framer-motion` is installed for future React/Next.js migration.

---

## Project Structure

```txt
.
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .env.example
│
├── data/
│   ├── profile.json
│   ├── projects.json
│   ├── services.json
│   ├── skills.json
│   ├── contracts.json
│   ├── testimonials.json
│   ├── faqs.json
│   ├── pricing.json
│   ├── process.json
│   ├── trust.json
│   ├── site-meta.json
│   └── contact-submissions.json
│
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── mini-htmx.js
│   │   ├── state.js
│   │   ├── main.js
│   │   └── three-background.js
│   ├── models/
│   │   └── blackhole.glb
│   ├── vendor/
│   │   └── motion.js
│   ├── assets/
│   │   └── og-image.svg
│   ├── robots.txt
│   └── sitemap.xml
│
├── scripts/
│   ├── generate_glb.py
│   └── copy_motion.js
│
└── views/
    ├── index.ejs
    └── partials/
        ├── projects.ejs
        ├── project-detail.ejs
        ├── services.ejs
        ├── pricing.ejs
        ├── process.ejs
        ├── trust.ejs
        ├── skills.ejs
        ├── contracts.ejs
        ├── testimonials.ejs
        ├── faqs.ejs
        └── contact-form.ejs
```

---

## Quick Start

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open locally:

```txt
http://localhost:3000
```

---

## Run on Network / Internet IP

The Express server listens on:

```txt
0.0.0.0
```

This allows access from another device or IP if the port is reachable.

Run:

```bash
npm start
```

Or explicitly:

```bash
npm run start:host
```

Open from another device:

```txt
http://YOUR_SERVER_IP:3000
```

Example:

```txt
http://172.168.189.20:3000
```

If using a VPS or cloud server, allow port `3000`:

```bash
sudo ufw allow 3000
```

For production, use Nginx, Caddy, Apache, or a platform proxy to expose HTTPS on port `443` and forward traffic to Node on port `3000`.

---

## NPM Scripts

```json
{
  "start": "node server.js",
  "dev": "node server.js",
  "start:host": "HOST=0.0.0.0 PORT=3000 node server.js",
  "generate:model": "python3 scripts/generate_glb.py",
  "copy:motion": "node scripts/copy_motion.js",
  "postinstall": "node scripts/copy_motion.js"
}
```

### Common Commands

Run website:

```bash
npm start
```

Run with explicit network host:

```bash
npm run start:host
```

Regenerate the black hole GLB:

```bash
npm run generate:model
```

Copy Motion browser build:

```bash
npm run copy:motion
```

---

## Content Datasets

Most website content is editable through JSON files in the `data/` folder.

| File | Purpose |
|---|---|
| `profile.json` | Brand name, title, bio, social links, stats |
| `projects.json` | Portfolio projects and case-study data |
| `services.json` | Service cards |
| `skills.json` | Skill groups and tags |
| `contracts.json` | Manual smart contract showcase |
| `testimonials.json` | Client testimonials |
| `faqs.json` | FAQ section |
| `pricing.json` | Service package pricing |
| `process.json` | Build process timeline |
| `trust.json` | Privacy/security checklist |
| `site-meta.json` | Version, theme, wallet setting, animation metadata |
| `contact-submissions.json` | Saved contact form submissions |

---

## 3D Black Hole Model

The website uses:

```txt
public/models/blackhole.glb
```

This file is generated by:

```txt
scripts/generate_glb.py
```

Regenerate it with:

```bash
npm run generate:model
```

The generated GLB contains:

- Event horizon mesh
- Accretion rings
- Photon ring data
- Relativistic jet geometry
- Particle metadata
- Background star metadata
- Animation data for the custom renderer

The background renderer reads this file from:

```txt
public/js/three-background.js
```

---

## Animation System

The website includes multiple animation layers.

### Black Hole Renderer

File:

```txt
public/js/three-background.js
```

Features:

- Scroll-driven 720-frame animation timeline
- Accretion disk particles
- Micro dust
- Photon ring
- Lensing effects
- Background stars
- Relativistic jets
- Cursor parallax
- Quality-based particle reduction

### UI Motion Layer

File:

```txt
public/js/main.js
```

Uses:

```txt
public/vendor/motion.js
```

Features:

- Card entrance animations
- Section title animations
- Stats count-up
- Hover and tap microinteractions
- Gravity ripple click effect
- Hero entrance animation
- `inView` animations
- HTMX-inserted content animation

### CSS Motion Layer

File:

```txt
public/css/styles.css
```

Features:

- Cursor glow
- Card tilt
- Black hole mini-card
- Preloader animation
- Progress bar
- Orbit navigation
- Modal transitions

---

## Advanced State Layer

File:

```txt
public/js/state.js
```

Global object:

```js
window.AppState
```

Available methods:

```js
window.AppState.get()
window.AppState.get("quality")
window.AppState.set({ quality: "ultra" })
window.AppState.subscribe((state, patch) => {})
window.AppState.toggleMotion()
window.AppState.cycleQuality()
```

Tracked state:

```txt
motion
quality
activeSection
commandOpen
modalOpen
modelStatus
modelFile
frame
scrollProgress
walletFeatures
theme
```

Persistent state stored in `localStorage`:

```txt
motion
quality
theme
```

UI controls:

- `Pause Motion`
- `Quality: Low / Medium / High / Ultra`
- `State` panel

The black hole renderer reads this state to control animation and particle quality.

---

## Backend Routes

### Main Page

```txt
GET /
```

### HTMX / HTML Partial Routes

```txt
GET /partials/projects
GET /partials/project/:slug
GET /partials/skills
GET /partials/services
GET /partials/pricing
GET /partials/process
GET /partials/trust
GET /partials/contracts
GET /partials/testimonials
GET /partials/faqs
GET /partials/contact
```

### JSON API Routes

```txt
GET /api/projects
GET /api/skills
GET /api/services
GET /api/pricing
GET /api/process
GET /api/trust
GET /api/contracts
GET /api/testimonials
GET /api/faqs
POST /api/contact
```

---

## Contact Form Storage

Contact submissions are saved to:

```txt
data/contact-submissions.json
```

Saved fields include:

```txt
name
email
company
deadline
projectType
budget
style
pages
message
status
priority
createdAt
```

The form includes:

- Required name
- Required email
- Required message
- Email validation
- Message length validation
- Honeypot spam field
- HTMX-style no-refresh submit

---

## Security and Privacy

This project is intentionally privacy-friendly.

It does **not** include:

- Wallet connect
- MetaMask connection
- Wallet analyzer
- Token balance display
- User NFT fetching
- Transaction history
- ENS lookup
- Alchemy wallet calls
- Moralis wallet calls
- Covalent wallet calls
- Private key handling

Security-related features included:

- Helmet middleware
- Contact validation
- Honeypot spam field
- No exposed API keys
- Local editable datasets
- No wallet tracking
- No blockchain identity tracking

---

## SEO Files

Included:

```txt
public/robots.txt
public/sitemap.xml
public/assets/og-image.svg
```

HTML includes Open Graph and Twitter card metadata:

```html
<meta property="og:image" content="/assets/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
```

Update `robots.txt` and `sitemap.xml` with your real production domain before deployment.

---

## Deployment Notes

Recommended hosting options:

- VPS
- Render
- Railway
- Fly.io
- DigitalOcean
- Hetzner
- AWS / Azure / GCP

Environment variables:

```txt
PORT=3000
HOST=0.0.0.0
```

### Production Recommendation

Use a reverse proxy:

```txt
Internet HTTPS traffic → Nginx/Caddy → Node.js app on port 3000
```

Example Nginx idea:

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Future Upgrade Ideas

Recommended next improvements:

- Admin dashboard for editing JSON content
- SQLite or PostgreSQL storage for contact leads
- Email notification integration
- Rate limiting with `express-rate-limit`
- Dockerfile and Docker Compose setup
- Render/Railway deployment files
- Blog/articles section
- Downloadable portfolio PDF
- More advanced black hole shader
- Theme switcher
- Sitemap generator
- Password-protected admin panel

---

## License

This project is currently provided as a custom portfolio starter. Add your preferred license before publishing publicly.

---

## GitHub Deployment Setup

This repository includes a professional `.github` deployment setup.

### GitHub Actions Workflows

```txt
.github/workflows/ci.yml
.github/workflows/deploy-render.yml
.github/workflows/deploy-vps.yml
.github/workflows/docker-ghcr.yml
```

### 1. CI Validation

Workflow:

```txt
.github/workflows/ci.yml
```

Runs on push and pull request.

It checks:

- `npm ci`
- JavaScript syntax
- `blackhole.glb` generation
- server startup
- homepage route
- API route
- GLB asset route

### 2. Deploy to Render

Workflow:

```txt
.github/workflows/deploy-render.yml
```

Required GitHub secret:

```txt
RENDER_DEPLOY_HOOK_URL
```

How to use:

1. Create a Render Web Service.
2. Add a Render Deploy Hook.
3. Add the hook URL to GitHub repository secrets as `RENDER_DEPLOY_HOOK_URL`.
4. Push to `main` or run the workflow manually.

Also included:

```txt
render.yaml
```

### 3. Deploy to VPS over SSH

Workflow:

```txt
.github/workflows/deploy-vps.yml
```

Required GitHub secrets:

```txt
VPS_HOST
VPS_USER
VPS_SSH_KEY
```

Optional secrets:

```txt
VPS_PORT
VPS_APP_DIR
```

Recommended VPS setup:

```bash
npm install -g pm2
sudo ufw allow 3000
```

The workflow will:

- SSH into the VPS
- clone/pull the repository
- install production dependencies
- regenerate `blackhole.glb`
- copy the Motion vendor file
- start/restart the app with PM2 if available

### 4. Build and Publish Docker Image

Workflow:

```txt
.github/workflows/docker-ghcr.yml
```

Publishes to GitHub Container Registry:

```txt
ghcr.io/OWNER/REPOSITORY
```

Also included:

```txt
Dockerfile
.dockerignore
```

Build locally:

```bash
docker build -t novachain-studio .
docker run -p 3000:3000 novachain-studio
```

### 5. Dependabot

Config:

```txt
.github/dependabot.yml
```

Checks weekly updates for:

- npm packages
- GitHub Actions

### 6. Issue Templates

```txt
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
```

---

## GitHub Secrets Summary

For Render:

```txt
RENDER_DEPLOY_HOOK_URL
```

For VPS:

```txt
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_PORT      optional
VPS_APP_DIR   optional
```
