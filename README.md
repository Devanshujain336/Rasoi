# Rasoi - A Step Towards Ghar Ka Khana

A comprehensive Hostel Mess Management System designed to bridge the gap between students and their daily meals. With a vibrant, energetic, and student-friendly UI, Rasoi aims to bring transparency, engagement, and convenience to the hostel dining experience.

## ✨ Features

- **Daily Menu & Ratings:** View daily meal menus, rate dishes, and provide feedback directly from the dashboard.
- **Menu & Polls Integration:** Participate in polls for upcoming menu items. MHMC (Mess Hostel Management Committee) can approve or reject suggestions natively.
- **Billing & Rebate System:** Automated generation of net bills based on base fees, extras, and approved rebates. Apply and track rebate requests easily.
- **Role-Based Access Control:** Distinct dashboard views, abilities, and management controls for Students, MHMC Members, and Admins.
- **Community Forum & Notifications:** Connect with other hostellers, share updates, and receive real-time notifications about menu changes or poll statuses.
- **Modern UI/UX:** Responsive, engaging design featuring smooth micro-animations, playful typography, soft lighting, and vibrant color gradients.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Application-level Auth via JWT (JSON Web Tokens) & bcryptjs

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- Node.js (v16.14.0 or above recommended)
- MongoDB Database (Local instance or MongoDB Atlas remote connection)

## 🚀 Local Setup & Installation

**1. Clone the repository** (skip if running locally from the physical directory)
```bash
git clone <repository-url>
cd Rasoi
```

**2. Install all standard dependencies**
Both frontend and backend packages are managed natively in the root directory.
```bash
npm install
```

**3. Configure Environment Variables**
Create a new `.env` file in the root directory based on the provided project template:
```bash
cp .env.example .env
```
Ensure your `.env` contains setup fields tailored to your environment:
```env
# Frontend
VITE_API_URL=http://localhost:3001

# Backend 
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/messhub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=3001
CLIENT_URL=http://localhost:5173
```
> **Note:** Fill `MONGO_URI` with your own database connection string. Set `JWT_SECRET` to a robust string value.

## 💻 Running the Application

To run the application locally, start both the Frontend UI and Backend server from separate terminals.

**Starting the Backend Data Server:**
Open a fresh terminal, navigate to the `Rasoi` root, and run:
```bash
npm run server
```

**Starting the Frontend Vite Server:**
Open a *second* terminal, navigate to the `Rasoi` root, and run:
```bash
npm run dev
```

Your system is now online!
- The unified web frontend is active on: `http://localhost:5173`
- The backend Rest-API connects at: `http://localhost:3001`

## 📂 Directory Architecture
- `/src` : Essential core structure. Contains React contexts, API utilities, pages, and modular frontend parts.
- `/server` : Hosts Mongoose models, backend REST controllers, middlewares, routes, and `index.js`.
- `/public` : Holds non-compiled assets.
