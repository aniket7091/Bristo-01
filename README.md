# ☕ Bristo Café — Full-Stack Café Management Platform

> **Where every cup tells a story.**  
> A modern, full-stack web application for managing a café — from the customer-facing menu and ordering experience to the owner's admin dashboard with real-time order tracking, blog management, and image uploads.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Seed the Database](#seed-the-database)
  - [Run the Server](#run-the-server)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Authentication](#-authentication)
- [Image Uploads](#-image-uploads)
- [Scripts](#-scripts)
- [License](#-license)

---

## ✨ Features

### Customer-Facing
- **Dynamic Menu** — Browse menu items by category with search, filter, and sort capabilities
- **Table Ordering** — Place orders directly from the table with a cart-based ordering flow
- **Blog & Articles** — Read café stories, brewing tips, and culture articles
- **Contact Form** — Send messages directly to the café team
- **About Page** — Learn the café's story and values
- **Responsive Design** — Beautiful UI across desktop, tablet, and mobile

### Owner / Admin
- **Secure Authentication** — JWT-based login & signup for café owners
- **Admin Dashboard** — Full control panel for managing the café
- **Menu Management** — Create, edit, and delete menu items with image uploads
- **Order Tracking** — View current and completed orders in real time
- **Blog Management** — Publish, edit, and delete blog articles
- **Image Uploads** — Seamless image hosting via ImageKit integration

---

## 🛠 Tech Stack

| Layer       | Technology                                                    |
|-------------|---------------------------------------------------------------|
| **Runtime** | [Node.js](https://nodejs.org/)                                |
| **Server**  | [Express.js](https://expressjs.com/) v4                       |
| **Database**| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) v8 |
| **Auth**    | [JSON Web Tokens](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Uploads** | [ImageKit](https://imagekit.io/) + [Multer](https://github.com/expressjs/multer) |
| **Frontend**| Vanilla HTML, CSS, JavaScript                                 |
| **Fonts**   | [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Manrope](https://fonts.google.com/specimen/Manrope) via Google Fonts |

---

## 📁 Project Structure

```
bristo/
├── config/
│   └── db.js                  # MongoDB connection setup
├── controllers/
│   ├── authController.js      # Owner signup, login & profile
│   ├── blogController.js      # Blog CRUD operations
│   ├── contactController.js   # Contact form submissions
│   ├── menuController.js      # Menu item CRUD operations
│   ├── orderController.js     # Order creation & management
│   └── uploadController.js    # ImageKit upload handler
├── data/
│   ├── sampleMenu.js          # Sample menu seed data
│   └── seed.js                # Database seeder script
├── middleware/
│   ├── authMiddleware.js      # JWT authentication guard
│   └── errorHandler.js        # Global error & 404 handlers
├── models/
│   ├── BlogPost.js            # Blog post schema
│   ├── ContactMessage.js      # Contact message schema
│   ├── MenuItem.js            # Menu item schema
│   ├── Order.js               # Order schema
│   └── Owner.js               # Owner schema (with password hashing)
├── public/
│   ├── css/
│   │   └── styles.css         # Global stylesheet
│   ├── images/                # Static image assets
│   ├── js/
│   │   ├── admin.js           # Admin dashboard logic
│   │   ├── api.js             # Shared API helper
│   │   ├── auth.js            # Auth page logic
│   │   ├── blog-admin.js      # Blog management panel
│   │   ├── contact.js         # Contact form handler
│   │   ├── main.js            # Homepage interactions
│   │   ├── menu.js            # Menu page logic
│   │   └── theme-animations.js# Theme & animation utilities
│   ├── about.html             # About page
│   ├── admin.html             # Owner admin dashboard
│   ├── blog.html              # Blog listing page
│   ├── contact.html           # Contact page
│   ├── index.html             # Homepage / landing page
│   ├── menu.html              # Customer menu & ordering page
│   ├── owner-login.html       # Owner login page
│   └── owner-signup.html      # Owner signup page
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── blogRoutes.js          # /api/blog/*
│   ├── contactRoutes.js       # /api/contact/*
│   ├── menuRoutes.js          # /api/menu/*
│   ├── orderRoutes.js         # /api/orders/*
│   └── uploadRoutes.js        # /api/upload/*
├── services/
│   └── imagekitService.js     # ImageKit SDK configuration
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
└── server.js                  # Application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **ImageKit Account** *(optional)* — for image uploads — [Sign up](https://imagekit.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bristo.git
cd bristo

# Install dependencies
npm install
```

### Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable                | Description                          | Default                                      |
|-------------------------|--------------------------------------|----------------------------------------------|
| `PORT`                  | Server port                          | `5000`                                       |
| `MONGODB_URI`           | MongoDB connection string            | `mongodb://127.0.0.1:27017/bristo-cafe`      |
| `JWT_SECRET`            | Secret key for signing JWTs          | *(required — use a strong random string)*    |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public API key              | *(required for image uploads)*               |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private API key             | *(required for image uploads)*               |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint                | `https://ik.imagekit.io/your_imagekit_id`    |

### Seed the Database

Populate the menu with sample items:

```bash
npm run seed
```

### Run the Server

```bash
# Development (with auto-restart via nodemon)
npm run dev

# Production
npm start
```

The app will be available at **`http://localhost:5000`**.

---

## 📡 API Reference

All API endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Health Check

| Method | Endpoint       | Description             |
|--------|----------------|-------------------------|
| `GET`  | `/api/health`  | API status check        |

### Authentication — `/api/auth`

| Method | Endpoint          | Auth | Description               |
|--------|-------------------|------|---------------------------|
| `POST` | `/api/auth/signup` | ✗   | Register a new owner      |
| `POST` | `/api/auth/login`  | ✗   | Login & receive JWT token |
| `GET`  | `/api/auth/me`     | ✓   | Get current owner profile |

### Menu — `/api/menu`

| Method   | Endpoint          | Auth | Description             |
|----------|-------------------|------|-------------------------|
| `GET`    | `/api/menu`       | ✗    | List all menu items     |
| `GET`    | `/api/menu/:id`   | ✗    | Get a single menu item  |
| `POST`   | `/api/menu`       | ✓    | Create a new menu item  |
| `PUT`    | `/api/menu/:id`   | ✓    | Update a menu item      |
| `DELETE` | `/api/menu/:id`   | ✓    | Delete a menu item      |

### Orders — `/api/orders`

| Method  | Endpoint                    | Auth | Description                |
|---------|-----------------------------|------|----------------------------|
| `POST`  | `/api/orders`               | ✗    | Place a new order          |
| `GET`   | `/api/orders`               | ✓    | List all orders            |
| `PATCH` | `/api/orders/:id/complete`  | ✓    | Mark order as completed    |

### Blog — `/api/blog`

| Method   | Endpoint          | Auth | Description             |
|----------|-------------------|------|-------------------------|
| `GET`    | `/api/blog`       | ✗    | List all blog posts     |
| `GET`    | `/api/blog/:id`   | ✗    | Get a single blog post  |
| `POST`   | `/api/blog`       | ✓    | Create a new blog post  |
| `PUT`    | `/api/blog/:id`   | ✓    | Update a blog post      |
| `DELETE` | `/api/blog/:id`   | ✓    | Delete a blog post      |

### Contact — `/api/contact`

| Method | Endpoint        | Auth | Description              |
|--------|-----------------|------|--------------------------|
| `POST` | `/api/contact`  | ✗    | Submit a contact message |

### Upload — `/api/upload`

| Method | Endpoint       | Auth | Description                            |
|--------|----------------|------|----------------------------------------|
| `POST` | `/api/upload`  | ✓    | Upload an image to ImageKit            |

---

## 🖥 Frontend Pages

| Route            | Page                 | Description                              |
|------------------|----------------------|------------------------------------------|
| `/`              | Homepage             | Hero section, menu preview, stats        |
| `/menu`          | Menu & Ordering      | Browse menu, add to cart, place orders   |
| `/about`         | About                | Café story and values                    |
| `/blog`          | Blog                 | Articles on coffee culture & more        |
| `/contact`       | Contact              | Contact form and location info           |
| `/owner-login`   | Owner Login          | Secure login for café owners             |
| `/owner-signup`  | Owner Signup         | Register as a café owner                 |
| `/admin`         | Admin Dashboard      | Menu, order, and blog management panel   |

## ☁️ Deployment (Free DevOps Architecture via GitHub Student Pack)

Bristo uses a decoupled architecture to deploy a full Dockerized environment for **free** using DigitalOcean (via the GitHub Student Developer Pack).

1. **Frontend (Netlify)**: The `public/` directory is deployed to Netlify as a static site.
2. **Backend (DigitalOcean)**: The Node.js Express server and MongoDB database run on a **DigitalOcean Droplet VPS** using Docker and `docker-compose`.

### CI/CD Pipeline (GitHub Actions)
A fully automated CI/CD pipeline is configured in `.github/workflows/deploy.yml`. 
Every push to the `main` branch will:
1. Lint the code.
2. Build the Docker image and push it to the GitHub Container Registry.
3. Automatically SSH into the DigitalOcean VPS and deploy the new image.

### 🚀 DigitalOcean Setup Guide (The "Cheat Sheet")
If you have a `.edu` email, follow these steps to get your free VPS:

1. **Get Free Credits**: Go to the [GitHub Student Developer Pack](https://education.github.com/pack) and sign up with your `.edu` email. Once approved, claim your free DigitalOcean credits ($200 for 1 year).
2. **Create a Droplet**: Log into DigitalOcean and click **Create Droplet**.
   - **Region**: Choose the one closest to you.
   - **Image**: Go to the "Marketplace" tab and search for **Docker**. Select the pre-built Docker image on Ubuntu.
   - **Size**: Choose the Basic Regular SSD ($4 or $6/month, which is covered by your free credits).
   - **Authentication**: Choose **SSH Key**. Generate an SSH key on your local machine (`ssh-keygen`), upload the public key to DigitalOcean, and save the *private key* securely (you will need it for GitHub!).
3. **Configure GitHub Secrets**: Go to your GitHub Repo > Settings > Secrets and variables > Actions, and add:
   - `VPS_HOST`: Your Droplet's Public IPv4 Address.
   - `VPS_USERNAME`: `root`
   - `VPS_SSH_KEY`: The Private SSH key you generated in Step 2.
   - Add your `.env` variables (`MONGODB_URI`, `JWT_SECRET`, etc.).
4. **No Firewall Config Needed!**: Because we used the Docker marketplace image, ports 80 and 443 are already open!

### Frontend Deployment (Netlify)
A `netlify.toml` file is included in the repository. It automatically publishes the `public/` directory and sets up an API proxy to route all `/api/*` requests to your DigitalOcean VPS backend.
1. Connect your repository to Netlify.
2. Update the `YOUR_VPS_IP_OR_DOMAIN` in the `netlify.toml` file to point to your live Droplet IP (e.g. `http://104.236.x.x`).
3. Deploy!

---

## 📸 Screenshots

*(Add screenshots of your live deployment here!)*

| Customer Menu | Order Confirmation |
|:---:|:---:|
| ![Menu Placeholder](public/images/menu-placeholder.jpg) | ![Order Placeholder](public/images/order-placeholder.jpg) |

| Owner Dashboard | Blog Management |
|:---:|:---:|
| ![Dashboard Placeholder](public/images/dashboard-placeholder.jpg) | ![Blog Placeholder](public/images/blog-placeholder.jpg) |

---

## 🔐 Authentication

Bristo uses **JWT (JSON Web Token)** authentication for owner-protected routes:

1. **Register** — `POST /api/auth/signup` with `name`, `email`, and `password`
2. **Login** — `POST /api/auth/login` with `email` and `password` → returns a JWT
3. **Access protected routes** — Include the token in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

Passwords are hashed with **bcryptjs** (10 salt rounds) before storage. Tokens are verified via middleware on all protected endpoints.

---

## 🖼 Image Uploads

Menu item and blog post images are uploaded and hosted through **[ImageKit](https://imagekit.io/)**:

1. Images are sent as multipart form data via **Multer** (in-memory storage)
2. The server uploads the buffer to ImageKit using their SDK
3. The returned `url` and `fileId` are stored in the database

> **Note:** Image upload functionality requires valid ImageKit credentials in your `.env` file.

---

## 📜 Scripts

| Command          | Description                                |
|------------------|--------------------------------------------|
| `npm start`      | Start the production server                |
| `npm run dev`    | Start with **nodemon** (auto-restart)      |
| `npm run seed`   | Seed the database with sample menu items   |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and ☕ by the Bristo team
</p>
