const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
// TARGET: The Minecraft Server's API URL.
// NOTE: Minehut usually blocks port 8091. You might need a tunnel (e.g. playit.gg) or dedicated IP.
// Ensure you include 'http://' and the port number.
let MINECRAFT_SERVER_URL = process.env.MINECRAFT_API_URL || 'http://drowsytest.minehut.gg:8091'; 

// Ensure protocol is present to prevent proxy errors
if (!MINECRAFT_SERVER_URL.startsWith('http')) {
    MINECRAFT_SERVER_URL = `http://${MINECRAFT_SERVER_URL}`;
}

// --- VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- STATIC ASSETS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API PROXY ---
// Forwards /api requests to the Minecraft Server
app.use('/api', createProxyMiddleware({
    target: MINECRAFT_SERVER_URL,
    changeOrigin: true,
    ws: true, // Enable Websockets for Console
    logLevel: 'debug',
    onError: (err, req, res) => {
        console.error(`[Proxy Error] Could not connect to ${MINECRAFT_SERVER_URL}${req.url}`);
        console.error(`Reason: ${err.code || err.message}`);
        if (err.code === 'ECONNREFUSED') {
             console.error("Hint: Is the Minecraft server running? Is the plugin loaded?");
        }
        res.status(503).send(`Minecraft Server Unreachable (${err.code}): ${err.message}`);
    }
}));

// --- ROUTES ---
app.get('/', (req, res) => {
    res.render('pages/index'); 
});

app.get('/dashboard', (req, res) => {
    res.render('pages/dashboard');
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 DrowsyCraft Web Panel running on port ${PORT}`);
    console.log(`🔗 Proxy Target: ${MINECRAFT_SERVER_URL}`);
    if (MINECRAFT_SERVER_URL.includes('127.0.0.1') || MINECRAFT_SERVER_URL.includes('localhost')) {
        console.log("ℹ️  Running in Local Mode. Ensure Minecraft server is on this machine.");
    } else {
        console.log("ℹ️  Running in Remote Mode. Ensure Port Forwarding is active on the target.");
    }
});