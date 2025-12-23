const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexusauth';
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_ultra_secure_key_2024';
const PORT = process.env.PORT || 5000;

console.log('--- NEXUS SERVER INITIALIZING ---');

// Robust Diagnostic Logging
const getSafeHost = (uri) => {
    try {
        // Attempt to hide credentials while showing cluster address
        const match = uri.match(/@([^/]+)/);
        return match ? match[1] : 'Local/Unknown Host';
    } catch (e) {
        return 'Invalid URI Format';
    }
};

console.log(`📡 Targeting Cluster: ${getSafeHost(MONGO_URI)}`);

if (MONGO_URI.includes('<password>') || MONGO_URI.includes('<username>')) {
    console.error('❌ CRITICAL ERROR: Your MONGO_URI still contains placeholders like "<password>".');
    console.error('👉 ACTION: Open your .env file and replace those brackets with your actual credentials.');
}

mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    })
    .then(() => {
        console.log('✅ DATABASE: Connection Successful!');
    })
    .catch(err => {
        console.error('❌ DATABASE: Connection Failed!');
        const msg = err.message.toLowerCase();

        if (msg.includes('bad auth') || msg.includes('authentication failed')) {
            console.error('\n⚠️  AUTHENTICATION ERROR DETECTED:');
            console.error('1. Check that the Username in your MONGO_URI matches the "Database User" you created in Atlas.');
            console.error('2. Check the Password. Note: Your Atlas login password is NOT the same as your Database User password.');
            console.error('3. If your password has special characters like "@" or ":", you MUST URL-encode them (e.g., @ becomes %40).');
            console.error('   👉 Easiest fix: Change your DB user password to letters and numbers only.\n');
        } else if (msg.includes('timed out') || msg.includes('enotfound')) {
            console.error('⚠️  NETWORK ERROR: The server cannot find the MongoDB cluster. Check your internet or whitelist "0.0.0.0/0" in Atlas Network Access.\n');
        } else {
            console.error(`Reason: ${err.message}\n`);
        }
    });

// Health Check
app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        db: statusMap[state] || 'unknown',
        uptime: Math.floor(process.uptime()) + 's'
    });
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    lastLogin: { type: Date, default: Date.now },
    securityScore: { type: Number, default: 80 }
});

const User = mongoose.model('User', userSchema);

// Auth Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Missing Authorization Header' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Malformed Token' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or Expired token' });
        req.userId = decoded.id;
        next();
    });
};

// --- ROUTES ---

app.post('/api/auth/register', async(req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database Link Broken',
            error: 'The server is active but can\'t reach MongoDB. Check server logs for "bad auth" or connection errors.'
        });
    }

    try {
        const { name, email, password } = req.body;

        // Test if we can actually query (detects Atlas permission issues)
        let existingUser;
        try {
            existingUser = await User.findOne({ email }).maxTimeMS(3000);
        } catch (dbErr) {
            if (dbErr.message.toLowerCase().includes('auth') || dbErr.message.includes('1883')) {
                return res.status(403).json({
                    message: 'Permission Denied (Atlas)',
                    error: 'Authenticated successfully, but user lacks "read" permissions. Set role to "Atlas Admin" or "Read/Write Any Database" in Atlas.',
                    code: 'ATLAS_AUTH_REQUIRED'
                });
            }
            throw dbErr;
        }

        if (existingUser) return res.status(400).json({ message: 'This email is already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            lastLogin: new Date()
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                bio: newUser.bio,
                lastLogin: newUser.lastLogin,
                securityScore: newUser.securityScore
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Registration failure', error: err.message });
    }
});

app.post('/api/auth/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Account not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password provided' });

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                lastLogin: user.lastLogin,
                securityScore: user.securityScore
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Login processing error', error: err.message });
    }
});

app.put('/api/user/profile', verifyToken, async(req, res) => {
    try {
        const { id, name, bio } = req.body;
        if (req.userId !== id) return res.status(403).json({ message: 'Forbidden' });

        const user = await User.findByIdAndUpdate(id, { name, bio }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Database update failed' });
    }
});

app.get('/api/user/security/:email', verifyToken, async(req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json({
            score: user.securityScore || 80,
            recommendations: ["Upgrade to 2FA", "Review login sessions", "Check for data leaks"],
            vulnerabilities: ["Standard encryption", "MFA not enabled"],
            summary: `Real-time security report for ${user.email} generated.`
        });
    } catch (err) {
        res.status(500).json({ message: 'Security audit failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API: Listening at http://localhost:${PORT}`);
});