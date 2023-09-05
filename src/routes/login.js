const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie');
const router = express.Router()

const User = require('../models/user')

router.post('/', userExists, authUser, async (req, res) => {
    const payload = { username: req.body.username, character: req.body.character}
    const options = {
        expiresIn: '14y'
    }
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options)
    try {
        response = await User.updateOne(
            { username: req.body.username },
             { $push: { tokens: token } })

        res.setHeader('Set-Cookie', cookie.serialize('accessToken', token,{
            secure: true,
            path: '/',
            sameSite: 'none',
        }))
        console.log('token added to user')
        res.status(200).send({success: true})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({success: false})
    }
    
})

async function userExists(req, res, next) {
    try {
        const user = await User.findOne({ username: req.body.username }).lean()
        if (!user) {
            console.log('User does not exist')
            res.status(401).send({success: false})
            return
        }
        req.body.character = user.characterName
        req.body.hashedPassword = user.password
        console.log(`User "${req.body.username}" tries to login`)
        next()
    } catch (error) {
        console.log(error.message)
        res.status(500).send({success: false})
    }
}
    
    
async function authUser(req, res, next) {
    try {
        const isMatch = await bcrypt.compare(req.body.password, req.body.hashedPassword)
        if (!isMatch) {
            console.log('User is not authorized, wrong password')
            res.status(401).send({success: false})
            return
        } 
        console.log('User is authorized')
        next()
    } catch (error) {
        console.log(error.message)
        res.status(500).send({success: false})
        return
    }
}

module.exports = router