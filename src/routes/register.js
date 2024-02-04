const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const User = require('../models/user')
const Character = require('../game/models/character')

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const CHARACTER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])*(?=.*[A-Z])*(?=.*[0-9])*(?=.*[!@#$%])*.{8,24}$/;



router.post('/' , regex, hashPassword , insertUser, (req, res)  => {
    res.status(201).send('Your account was created successfully')
})

function regex(req, res, next) {
    if (CHARACTER_REGEX.test(req.body.character) && USER_REGEX.test(req.body.username) && PWD_REGEX.test(req.body.password)) {
        next()
    } else {
        console.log("regex test failed")
        res.status(401).send('Invalid character, username or password')
    }
}


async function hashPassword(req, res, next) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        req.body.password = hashedPassword
        next()
    } catch (error) {
        console.log(error.message)
        res.status(500).send()
    }

}


async function insertUser(req, res, next){
    try {
        const responseUser = await User.create({ 
            characterName: req.body.character, username: req.body.username, password: req.body.password })
        console.log('User created successfully: ', responseUser.username)
        const responseCharacter = await Character.create({ 
            characterName: req.body.character})
        console.log('Character created successfully: ', responseCharacter.characterName)
        next()
    } catch (error) {
        if (error.code === 11000){
            console.log(error.message)
            if (error.message.includes('username')){
                res.status(409).send(`Username already exists`)
            }else if (error.message.includes('characterName')){
                res.status(409).send(`Charcter already exists`)
            }
            
        } else {
            console.log(error.message)
            res.status(401).send()
        }
        
    }
}

module.exports = router