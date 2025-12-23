# NexusAuth MERN Setup Guide

This project is a full MERN (MongoDB, Express, React, Node.js) authentication system.

## 🚀 How to Run the App

### 1. Ensure you are in the project folder
Your terminal should show `AUTHENTICATION-SYSTEM-MERN`. If it doesn't, type:
```powershell
cd "AUTHENTICATION-SYSTEM-MERN"
```

### 2. Verify scripts are available
If you get a "Missing script" error, check what npm sees by running:
```powershell
npm run
```
This will list all available commands. You should see `server`, `backend`, and `dev`.

### 3. Start the Application
You need **two separate terminals** open:

**Terminal 1 (Backend Server):**
```powershell
# Try any of these three:
npm run server
# OR
npm run backend
# OR
npm start
```

**Terminal 2 (Frontend React):**
```powershell
npm run dev
```

## 🛠 Troubleshooting the "Missing script" error
If `npm run server` still fails:
1. Open `package.json` in VS Code.
2. Make sure the `"scripts"` section looks exactly like this:
   ```json
   "scripts": {
     "server": "node server.js",
     "dev": "vite"
   }
   ```
3. **Press Ctrl+S to Save the file.**
4. Try running the command again.

## ⚙️ Requirements
- **Node.js**: Installed (`node -v` should show a version).
- **MongoDB**: Running locally or a valid `MONGO_URI` in `.env`.
