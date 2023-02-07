require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { readFileSync, writeFileSync } = require('fs');
const nodemailer = require('nodemailer');
const router = express.Router();
const { getUsers, getStudents, checkUser } = require('./utils/utils');

/**
 * Generate a random string
 * @param {int} length 
 * @returns 
 */
const random = (length = 8) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

/**
 * Load style.css
 */
router.get('/reset/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/src/css/style.css');
});

/**
 * Load favicon.ico
 */
router.get('/reset/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/views/src/img/favicon.ico');
});

const checkPass = (password) => {
    const paternMin = /[a-z]/;
    const paternMaj = /[A-Z]/;
    const paternNum = /[0-9]/;
    const paternLength = /.{8,}/;
    if (paternMin.test(password) && paternMaj.test(password) && paternNum.test(password) && paternLength.test(password)) {
        return true;
    }
    return false;
};

const checkUserEmail = (res, domain) => {
    if (domain !== 'edu.univ-eiffel.fr') {
        res.status(400).send({ error: 'Utilisez une adresse email universitaire' });
        return false;
    }
    return true;
}

const checkUserExists = async (res, username) => {
    const users = await getUsers();
    if (users.hasOwnProperty(username)) {
        res.status(400).send({ error: 'Utilisateur déjà existant' });
        return false;
    }
    return true;
}

const checkPassword = (res, password) => {
    if (!checkPass(password)) {
        res.status(400).send({ error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre' });
        return false;
    }
    return true;
}

const checkUserInDatabase = async (res, username) => {
    const students = await getStudents();
    if (!students.hasOwnProperty(username)) {
        res.status(400).send({ error: 'Vous n\'êtes pas inscrit dans la base de données' });
        return false;
    }
    return true;
}

const check = async (res, params) => {
    const username = params.email.split('@')[0];
    const domain = params.email.split('@')[1];
    if (!checkUserEmail(res, domain)) {
        return false;
    }
    if (!await checkUserExists(res, username)) {
        return false;
    }
    if (!checkPassword(res, params.password)) {
        return false;
    }
    if (!await checkUserInDatabase(res, username)) {
        return false;
    }
    return true;
}

const buildMailOptionsRegister = (token, email, username) => {
    return {
        from: 'Aroma UGE <' + process.env.MAIL_USER + '>',
        to: email,
        subject: 'Validation de votre compte',
        html: "<h1>Bienvenue sur Aroma UGE !</h1><p>Vous avez demandé à créer un compte sur Aroma UGE. Pour valider votre compte, veuillez cliquer sur le lien suivant :<br><br><a href='" + process.env.URL_API + "validate/" + token + "'>Valider mon compte</a></p><p>Votre nom d'utilisateur est " + username + ".</p><p>Si vous n'avez pas demandé à créer un compte, ignorez ce mail.</p><p>Cordialement,<br>L'équipe Aroma UGE</p><p><small>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</small></p><p><small>Si vous rencontrez des problèmes, veuillez contacter l'administrateur du site à l'adresse suivante : " + process.env.MAIL_SUPPORT + "</small></p>"
    }
}

/**
 * @swagger
 * /register:
 *  post:
 *     description: Enregistre un nouvel utilisateur
 *     tags:
 *        - Utilisateurs
 *     responses:
 *        200:
 *          description: Mail sent
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal server error
 *     requestBody:
 *       description: Enregistre un nouvel utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: email universitaire
 *                 example: "prenom.nom@edu.univ-eiffel.fr"
 *                 required: true
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "motdepasse"
 *                 required: true
 */
router.post('/', async (req, res) => {
    const params = req.body;
    if (!await check(res, params)) {
        return;
    }
    const username = params.email.split('@')[0];
    const token = random(40);
    let validating = readFileSync('./src/users/validating.json', 'utf-8');
    if (validating === '') {
        validating = {};
    }
    validating = JSON.parse(validating);
    validating[token] = {
        username: username,
        password: crypto.createHash('sha256').update(params.password).digest('hex'),
    }
    writeFileSync('./src/users/validating.json', JSON.stringify(validating));
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    });
    const mailOptions = buildMailOptionsRegister(token, params.email, username);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send({ success: 'Un email de validation a été envoyé à ' + username + '@edu.univ-eiffel.fr, veuillez le consulter.' });
        }
    });

    setTimeout(() => {
        validating = readFileSync('./src/users/validating.json', 'utf-8');
        if (validating === '') {
            validating = {};
        }
        validating = JSON.parse(validating);
        delete validating[token];
        writeFileSync('./src/users/validating.json', JSON.stringify(validating));
    }, 600000);
});

const buildMailOptionsForgot = (token, email) => {
    return {
        from: 'Aroma UGE <' + process.env.MAIL_USER + '>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: "<h1>Vous avez demandé à réinitialiser votre mot de passe.</h1><p>Pour le réinitialiser, veuillez cliquer sur le lien suivant :<br><br><a href='" + process.env.URL_API + "register/reset/" + token + "'>Réinitialiser mon mot de passe</a></p><p>Si vous n'avez pas demandé à réinitialiser votre mot de passe, ignorez ce mail.</p><p>Cordialement,<br>L'équipe Aroma UGE</p><p><small>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</small></p><p><small>Si vous rencontrez des problèmes, veuillez contacter l'administrateur du site à l'adresse suivante : " + process.env.MAIL_SUPPORT + "</small></p>",
    }
}

/**
 * @swagger
 * /register/forgot/{username}:
 *  get:
 *     description: Envoie un mail de réinitialisation de mot de passe
 *     tags:
 *        - Utilisateurs
 *     responses:
 *        200:
 *          description: Mail sent
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal server error
 *     parameters:
 *        - username:
 *          name: username
 *          description: Nom d'utilisateur (prénom.nom)
 *          in: path
 *          required: true
 *          type: string
 */
router.get('/forgot/:username', async (req, res) => {
    const username = req.params.username;
    if (!await checkUserInDatabase(res, username)) {
        return;
    }
    if (!await checkUser(username, res)) {
        res.status(400).send({ error: 'Cet utilisateur n\'existe pas.' });
        return;
    }
    const token = random(40);
    let resetting = readFileSync('./src/users/resetting.json', 'utf-8');
    if (resetting === '') {
        resetting = {};
    }
    resetting = JSON.parse(resetting);
    resetting[token] = username;
    writeFileSync('./src/users/resetting.json', JSON.stringify(resetting));
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    });
    const mailOptions = buildMailOptionsForgot(token, username + '@edu.univ-eiffel.fr');
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send({ success: 'Un email de réinitialisation a été envoyé à ' + username + '@edu.univ-eiffel.fr, veuillez le consulter.' });
        }
    });

    setTimeout(() => {
        resetting = readFileSync('./src/users/resetting.json', 'utf-8');
        if (resetting === '') {
            resetting = {};
        }
        resetting = JSON.parse(resetting);
        delete resetting[token];
        writeFileSync('./src/users/resetting.json', JSON.stringify(resetting));
    }, 600000);
});

router.get('/reset/:token', (req, res) => {
    const token = req.params.token;
    let resetting = readFileSync('./src/users/resetting.json', 'utf-8');
    if (resetting === '') {
        resetting = {};
    }
    resetting = JSON.parse(resetting);
    if (!resetting.hasOwnProperty(token)) {
        res.status(400).sendFile('./views/passwordChangeFailed.html', { root: __dirname });
        return;
    }
    const username = resetting[token];
    if (!checkUser(username)) {
        res.status(400).sendFile('./views/passwordChangeFailed.html', { root: __dirname });
        return;
    }
    res.sendFile('./views/reset.html', { root: __dirname });
});

module.exports = router;
