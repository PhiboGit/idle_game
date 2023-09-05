require('dotenv').config()
const mongoose = require('mongoose')
const cookie = require('cookie');
const express = require('express')
const jwt = require('jsonwebtoken')

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


app.use('/register', require('./src/routes/register'))
app.use('/login', require('./src/routes/login'))

server.on('upgrade', (req, socket, head) => {
    socket.on('error', onSocketPreError);
    console.log('Connecting to websocket...')

    const token = extractTokenFromRequest(req)

    if (!token) {
        console.log('No token cookie provided')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return
    }
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
    })
});

function extractTokenFromRequest(req) {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        console.log('No token cookie provided');
        return null;
    }

    const cookies = cookie.parse(cookieHeader);
    return cookies.accessToken;
}



// Middleware to handle CORS
// TODO: try to understand CORS!!
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

function onSocketPreError(e) {
    console.log(e);
}
  

// app.get('/users', authToken, (req, res) => {
//     res.send(req.user)
// })


// function authToken(req, res, next) {
//     const cookieHeader = req.headers.cookie;
    
//     if (!cookieHeader) {
//         console.log('No token cookieHeader provided')
//         res.status(401).send('No token cookieHeader provided');
//         return;
//     }
//     const cookies = cookie.parse(cookieHeader);
//     const token = cookies.accessToken;

//     if (!token) {
//         console.log('No token cookie provided')
//         res.status(401).send('No token cookie provided');
//         return;
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
//         if (err) {
//             console.log('Error verifying token')
//             res.status(401).send('Invalid token')
//             return
//         }
//         const user = await User.findOne({ username: payload.username }).lean()
//         console.log(user)
//         if (err || !user || !user.tokens.some(t => t === token)) {
//             console.log('Invalid token')
//             res.status(500).send('Invalid token')
//             return
//         }
//         console.log('Valid token')
//         req.user = user
//         next()
//     })
// }
