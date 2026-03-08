const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
// REPLACE THIS with your actual Minecraft Server IP and Plugin Port (Default 8091)
// You can also set this in Hostinger's Environment Variables
const MINECRAFT_SERVER_URL = process.env.MINECRAFT_API_URL || 'http://127.0.0.1:8091'; 

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
        console.error('Proxy Error:', err);
        res.status(503).send('Minecraft Server Unreachable: ' + err.message);
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
});