This project, NexusAuth MERN, is a modern, full-stack web application designed to handle secure user registration, login, and profile management. It follows the MERN architecture, which is the industry standard for building robust JavaScript-based applications.
🛠 The Tech Stack (Languages & Tools)
Frontend (The Visuals):
TypeScript / React 19: Used for building the user interface. TypeScript provides "type safety," which prevents common coding bugs.
Tailwind CSS: A utility-first CSS framework used for the sleek, minimalist styling and responsive design.
React Router: Handles navigation between the Login, Register, and Dashboard pages without reloading the browser.
Backend (The Logic):
Node.js: The runtime environment that allows JavaScript to run on the server.
Express: A web framework for Node.js that handles the API routes (like /api/auth/login).
Database (The Storage):
MongoDB (via Mongoose): A NoSQL database that stores user information as JSON-like documents. Mongoose is the library used to talk to the database from the code.
Security (The Shield):
JSON Web Tokens (JWT): Used for "stateless" authentication. Once you log in, the server gives you a "digital pass" (token) to access protected data.
Bcrypt.js: A library that hashes passwords. Even if a hacker stole the database, they wouldn't see your actual password—only a complex, irreversible string of characters.
⚙️ How It Works (The Lifecycle)
1. Registration & Hashing
When you create an account, the frontend sends your password to the backend. The backend uses Bcrypt to "scramble" (hash) your password before saving it to MongoDB. We never store plain-text passwords.
2. Authentication & JWT
When you log in:
The server compares your input with the hashed password in the database.
If they match, the server generates a JWT token containing your User ID.
The frontend receives this token and stores it in localStorage.
3. Authorization (Accessing Data)
When you visit the Dashboard or Profile:
The frontend pulls the token from localStorage and puts it in the Authorization header of the request.
The server's verifyToken middleware checks if the token is valid.
If valid, it allows you to see your private data; if not, it sends a 401 Unauthorized error and kicks you back to the login page.
4. Frontend State Management
The App.tsx file acts as the "brain." It tracks the authState (Is the user logged in? Who are they?). When you update your profile, it syncs the changes to the database and immediately updates the UI so the app feels fast and responsive.
🌟 Key Features
Minimalist Dashboard: Focused on account metadata and status.
Real-time Health Check: The app constantly pings the server to show if the database is online.
Responsive Design: Works perfectly on mobile, tablet, and desktop.
Secure Profile Updates: Users can update their bio and name safely using their JWT.
