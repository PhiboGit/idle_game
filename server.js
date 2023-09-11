require('dotenv').config()
const mongoose = require('mongoose')
const cookie = require('cookie')
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const {wss} = require('./src/routes/websocket/websocket');
const User = require('./src/models/user')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json())

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use('/register', require('./src/routes/register'))
app.use('/login', require('./src/routes/login'))

server.on('upgrade', (req, socket, head) => {
    socket.on('error', onSocketPreError);
    console.log('Connecting to websocket...')

    const token = extractTokenFromQueryParameters(req);

    if (!token) {
        console.log('No token provided in query parameters');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    // Verify and handle the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
        if (err) {
            console.log('Error verifying token')
            console.log(err.message)
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return
        }
        const user = await User.findOne({ username: payload.username }).lean()
        console.log('User found')
        if (err || !user || !user.tokens.some(t => t === token)) {
            console.log('Invalid token')
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return
        }
        console.log('Valid token')
        const infos = {username: payload.username, characterName: payload.character}
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req, infos);
        });
    });
});

function extractTokenFromQueryParameters(req) {
    console.log('Reading token...')
    const url = new URL(req.url, 'http://localhost:5173');
    const token = url.searchParams.get('accessToken');
    console.log(token)
    return token;
}

function extractTokenFromRequest(req) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        console.log('No token cookie provided');
        return null;
    }

    const cookies = cookie.parse(cookieHeader);
    return cookies.accessToken;
}

function onSocketPreError(e) {
    console.log(e);
}