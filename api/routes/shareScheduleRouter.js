require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const { readFileSync, writeFileSync, readFile } = require('fs');
const generateSchedule = require('./modules/calendarModule').generateSchedule;
const { getStudents, getUsers, checkUser } = require('./utils/utils');

/**
 * @swagger
 * /partage-edt:
 *   get:
 *     security:
 *        - accessToken: []
 *     description: Retourne true ou false selon si l'utilisateur a partagé son emploi du temps ou non
 *     tags:
 *        - Partage de calendrier
 *     responses:
 *        200:
 *          description: {sharing: true/false}
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
    const username = req.user.user;
    const users = await getUsers();
    if (!users.hasOwnProperty(username)) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    if (users[username].shareSchedule) {
        res.status(200).send({
            sharing: true,
            url: users[username].shareScheduleURL
        });
        return;
    }
    res.status(200).send({ sharing: false });
});

/**
 * @swagger
 * /partage-edt/{boolean}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Partage le calendrier
 *     tags:
 *        - Partage de calendrier
 *     parameters:
 *        - boolean:
 *          name: boolean
 *          description: boolean (true/false)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [true, false]
 *     responses:
 *        200:
 *          description: Calendrier partagé
 *        400:
 *          description: Erreur de paramètre
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.post('/:bool', authenticateToken, async (req, res) => {
    if (req.params.bool !== 'true' && req.params.bool !== 'false') {
        res.status(400).send({ error: 'Invalid boolean value' });
        return;
    }
    const bool = req.params.bool === 'true' ? true : false;
    const user = req.user.user;
    const users = await getUsers();
    if (!users.hasOwnProperty(user)) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    if (users[user].shareSchedule === bool) {
        let url = users[user].shareScheduleURL;
        res.status(200).send({
            message: 'Sharing schedule is already ' + bool,
            shareSchedule: bool,
            shareScheduleURL: url
        });
        return;
    }
    users[user].shareSchedule = bool;
    let url = bool ? process.env.URL_API + 'partage-edt/' + user : '';
    users[user].shareScheduleURL = url;
    writeFileSync('./src/users/users.json', JSON.stringify(users));
    res.status(200).send({
        message: 'Sharing schedule changed',
        shareSchedule: bool,
        shareScheduleURL: url
    });
});

router.get('/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});
router.get('/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/favicon.ico', (req, res) => {
    res.sendFile('favicon.ico', { 'root': __dirname + '/../views/schedule-view/assets/img/' });
});
router.get('/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});
router.get('/:user/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});
router.get('/:user/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/:user/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/:user/favicon.ico', (req, res) => {
    res.sendFile('favicon.ico', { 'root': __dirname + '/../views/schedule-view/assets/img/' });
});
router.get('/:user/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});

/**
 * @swagger
 * /partage-edt/{user}:
 *  get:
 *     description: Renvoie l'emploi du temps de l'étudiant {user} s'il a partagé son emploi du temps. Attention, les jours passés ne sont pas affichés. Ouvrir le lien dans un nouvel onglet.
 *     tags:
 *        - Partage de calendrier
 *     parameters:
 *        - user:
 *          name: user
 *          description: user (prenom.nom)
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        404:
 *          description: Utilisateur non trouvé ou n'a pas partagé son emploi du temps
 *        500:
 *          description: Internal server error
 */
router.get('/:user', (req, res) => {
    const user = req.params.user;
    const users = JSON.parse(readFileSync('./src/users/users.json', 'utf-8'));
    if (users[user] && users[user]["shareSchedule"]) {
        let date = new Date();
        let previousMonday = new Date(date);
        previousMonday.setDate(date.getDate() - date.getDay() + 1);
        if (date.getDay() === 0) {
            let date = new Date();
            nextMonday = new Date(date);
            nextMonday.setDate(date.getDate() + 1);
            previousMonday = nextMonday;
        } else if (date.getDay() === 6) {
            let date = new Date();
            nextMonday = new Date(date);
            nextMonday.setDate(date.getDate() + 2);
            previousMonday = nextMonday;
        }
        generateSchedule(user, previousMonday, res, true);
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

/**
 * @swagger
 * /partage-edt/{user}/{date}:
 *  get:
 *     description: Renvoie l'emploi du temps de l'étudiant {user} à la date {data} s'il a partagé son emploi du temps. Attention, les jours passés ne sont pas affichés. Ouvrir le lien dans un nouvel onglet.
 *     tags:
 *        - Partage de calendrier
 *     parameters:
 *        - user:
 *          name: user
 *          description: user (prenom.nom)
 *          in: path
 *          required: true
 *          type: string
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        404:
 *          description: Utilisateur non trouvé ou n'a pas partagé son emploi du temps
 *        500:
 *          description: Internal server error
 */
router.get('/:user/:date', (req, res) => {
    const user = req.params.user;
    const users = JSON.parse(readFileSync('./src/users/users.json', 'utf-8'));
    if (users[user] && users[user]["shareSchedule"]) {
        let date = req.params.date;
        if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
            let dateArray = date.split('-');
            let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
            if (dateObj.getDay() === 1) {
                generateSchedule(user, dateObj, res, true);
            } else {
                res.status(400).send({ error: 'Date must be a Monday' });
            }
        } else {
            res.status(400).send({ error: 'Bad request' });
            return;
        }
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

module.exports = router;