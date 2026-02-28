# 🎓 Rasoi Mastery: The Full-Stack Study Roadmap

This roadmap is designed to take you from a high-level user to a deep-level maintainer of the **Rasoi** platform. Follow these steps in order to fully grasp the architecture, security, and flow of the application.

---

## 🛤️ Phase 1: The Foundations (Prerequisites)
Before diving into the code, ensure you are comfortable with these:
- **React (High Beginner/Intermediate)**: JSX, `useState`, `useEffect`, and Component Props.
- **Node.js & Express**: How a basic server listens for requests and sends JSON.
- **MongoDB & Mongoose**: Basic CRUD operations and Schema definitions.
- **Modern CSS**: Tailwind utility classes (e.g., `flex`, `grid`, `bg-primary`).

---

## 📂 Phase 2: Understanding the Architecture
Start by exploring the folder structure. Look at these key areas:

### 1. The Server (`/server`)
This is the "Brain" of the app. It holds your data logic and security rules.
- **`index.js`**: The entry point. Study how middleware like `cors`, `helmet`, and `rateLimit` are registered.
- **`/models`**: Study the "Blueprints" of your data (Mongoose Schemas).
- **`/routes`**: Study how the URL endpoints (like `/api/auth/login`) are mapped to JavaScript logic.
- **`/middleware/auth.js`**: Critical file. Understand how the `protect` function checks for a valid JWT token before allowing access.

### 2. The Client (`/src`)
This is the "Face" of the app.
- **`App.jsx`**: The navigation backbone. Study how `react-router-dom` handles page switching.
- **`/contexts/AuthContext.jsx`**: Learn how the "Global User State" is shared across the whole app.
- **`lib/api.js`**: The bridge. Every time the frontend needs data, it calls a function here.

---

## 🔐 Phase 3: The Core Flows (Step-by-Step)
To understand how things connect, trace these three critical flows:

### 1. The Authentication Flow
1. Open `server/routes/auth.js` and look at the `signup` route.
2. See how **Zod** validates the data, **bcrypt** hashes the password, and **JWT** creates a "Session Token".
3. Then, see how `src/lib/api.js` stores that token in `localStorage`.

### 2. The "What's Cooking" Flow
1. Look at `server/routes/menu.js` → `router.get("/")`.
2. Look at `src/pages/Dashboard.jsx`. Find the `fetchMenu` function.
3. Observe how the frontend loops over the menu object to create the cards.

### 3. The Atomic Voting Flow (Advanced)
1. Look at `server/routes/menu.js` → `router.post("/polls/:id/vote")`.
2. Study the `findOneAndUpdate` method using `$inc` and `$addToSet`. This is a classic "Industry Standard" way to handle high-concurrency database updates.

---

## 🛡️ Phase 4: Production & Scaling Mastery
This is the "Expert" tier of your codebase. Study these to understand why the app is "Production Ready":
- **Input Validation**: Why we use `zod` instead of simple `if` statements (prevents malformed data from crashing the DB).
- **Security Headers**: Read up on what `helmet` does (it sets 15+ HTTP headers to lock down your browser security).
- **Rate Limiting**: Experiment with calling an API 100 times in 1 minute; see how the server blocks the 101st attempt to protect itself.
- **Concurrency**: Research **"MongoDB Connection Pooling"** (which we set in `server/db.js`) to understand how to handle 400+ users without slowing down.

---

## 🛠️ Recommended Reading Order
1. **Model** (`server/models/User.js`) - *The Shape.*
2. **Route** (`server/routes/auth.js`) - *The Logic.*
3. **API Bridge** (`src/lib/api.js`) - *The Connection.*
4. **Context** (`src/contexts/AuthContext.jsx`) - *The State.*
5. **Page** (`src/pages/Dashboard.jsx`) - *The UI.*

---

## 💡 Pro Tip for Studying
When looking at a complex component like `MHMCPage.jsx`, don't try to read all 600 lines at once. 
1. **First**: Look at the `useState` variables at the top to see what data it tracks.
2. **Second**: Look at the `useEffect` to see what happens when the page loads.
3. **Third**: Look at the `return` statement to see the visual layout.
