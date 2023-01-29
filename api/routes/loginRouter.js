const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { readFile } = require('fs');
const router = express.Router();
const accessDurationExp = '1800s';
const refreshDurationExp = '7d';

/**
 * Generate a new access token
 * @param {string} user 
 * @returns {string} token
 */
function generateAccessToken(user) {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessDurationExp });
}

/**
 * Generate a new refresh token
 * @param {string} user 
 * @returns {string} token
 */
function generateRefreshToken(user) {
    return jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshDurationExp });
}

/**
 * @swagger
 * /login:
 *  post:
 *     description: Authentification d'un utilisateur. Entrez ensuite vos access token et refresh token dans les champs correspondants dans Authorize en haut de page.
 *     tags:
 *        - Utilisateurs
 *     responses:
 *        200:
 *          description: Utilisateur connecté
 *        400:
 *          description: Erreur de connexion
 *        500:
 *          description: Internal server error
 *     requestBody:
 *       description: Authentification d'un utilisateur. Entrez ensuite vos access token et refresh token dans les champs correspondants dans Authorize en haut de page.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur
 *                 example: "prenom.nom"
 *                 required: true
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "motdepasse"
 *                 required: true
 */
router.post('/', (req, res) => {
    let fileName = './src/users/users.json';
    let user = req.body.username;
    let passHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
    /* if user contains @ */
    if (user.includes('@')) {
        if (user.split('@')[1] !== 'edu.univ-eiffel.fr') {
            res.status(401).send({ error: 'Utilisateur ou mot de passe incorrect' });
        } else {
            user = user.split('@')[0];
        }
    }
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            if (users.hasOwnProperty(user) && users[user]["password"] === passHash) {
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                res.status(200).send({
                    accessToken: accessToken,
                    accessTokenExpirationDate: new Date(Date.now() + 1800000),
                    refreshToken: refreshToken,
                    refreshTokenExpirationDate: new Date(Date.now() + 604800000),
                    user: user,
                    shareSchedule: users[user]["shareSchedule"],
                    shareScheduleURL: users[user]["shareScheduleURL"]
                });
            } else {
                res.status(401).send({ error: 'Utilisateur ou mot de passe incorrect' });
            }
        }
    });
});

/**
 * @swagger
 * /login/refresh:
 *  post:
 *     security:
 *        - refreshToken: []
 *     description: Renvoie un nouveau token d'accès (access token) à partir d'un token de rafraîchissement (refresh token)
 *     tags:
 *        - Utilisateurs
 *     responses:
 *        200:
 *          description: Token d'accès renvoyé
 *        401:
 *          description: Token de rafraîchissement invalide
 *        500:
 *          description: Internal server error
 */
router.post('/refresh', (req, res) => {
    console.log(req.headers['Authorization']);
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
                    res.status(200).send({ 
                        accessToken: accessToken,
                        accessTokenExpirationDate: new Date(Date.now() + 1800000),
                    });
                } else {
                    res.status(401).send({ error: 'Token is not valid' });
                }
            }
        }
        );
    });
});

module.exports = router;