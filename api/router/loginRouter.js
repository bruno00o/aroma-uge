const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile } = require('fs');
const router = express.Router();

/**
 * Generate a new access token
 * @param {string} user 
 * @returns {string} token
 */
function generateAccessToken(user) {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}

/**
 * Generate a new refresh token
 * @param {string} user 
 * @returns {string} token
 */
function generateRefreshToken(user) {
    return jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

/**
 * Authenticate an user and send a new access token if the user is valid
 */
router.post('/', (req, res) => {
    let fileName = './src/users/users.json';
    let passHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            if (users.hasOwnProperty(req.body.username) && users[req.body.username]["password"] === passHash) {
                const accessToken = generateAccessToken(req.body.username);
                const refreshToken = generateRefreshToken(req.body.username);
                res.status(200).send({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            } else {
                res.status(401).send({ error: 'Username or password is incorrect' });
            }
        }
    });
});

/**
 * Refresh an access token
 */
router.post('/refresh', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    let fileName = './src/users/users.json';
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401);
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let users = JSON.parse(data);
                if (users.hasOwnProperty(user.user)) {
                    delete user.iat;
                    delete user.exp;
                    const accessToken = generateAccessToken(user.user);
                    res.status(200).send({ accessToken: accessToken });
                } else {
                    res.status(401).send({ error: 'Token is not valid' });
                }
            }
        }
        );
    });
});

module.exports = router;