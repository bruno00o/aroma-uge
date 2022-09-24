require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const { readFileSync, writeFileSync, readFile } = require('fs');
const generateSchedule = require('./modules/calendarModule').generateSchedule;

/**
 * @swagger
 * /shareSchedule:
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
router.get('/', authenticateToken, (req, res) => {
    const username = req.user.user;
    const users = JSON.parse(readFileSync('./src/users/users.json', 'utf-8'));
    if (users[username]) {
        if (users[username]["shareSchedule"] === true) {
            res.status(200).send({
                sharing: true,
                url: users[username]["shareScheduleURL"]
            });
        } else {
            res.status(200).send({ sharing: false });
        }
    } else {
        res.status(500).send({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /shareschedule/{boolean}:
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
router.post('/:bool', authenticateToken, (req, res) => {
    if (req.params.bool !== 'true' && req.params.bool !== 'false') {
        res.status(400).send({ error: 'Invalid boolean value' });
        return;
    }
    const bool = req.params.bool === 'true' ? true : false;
    const user = req.user.user;
    const users = JSON.parse(readFileSync('./src/users/users.json', 'utf-8'));
    if (users[user]) {
        if (users[user]["shareSchedule"] === bool) {
            let url = users[user]["shareScheduleURL"];
            res.status(200).send({
                message: 'Sharing schedule is already ' + bool,
                shareSchedule: bool,
                shareScheduleURL: url
            });
            return;
        } else {
            users[user]["shareSchedule"] = bool;
            let url = bool ? process.env.URL_API + 'shareSchedule/' + user : '';
            users[user]["shareScheduleURL"] = url;
            writeFileSync('./src/users/users.json', JSON.stringify(users));
            res.status(200).send({
                message: 'Sharing schedule changed',
                shareSchedule: bool,
                shareScheduleURL: url
            });
        }
    } else {
        res.send('Error');
    }
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

router.get('/:user/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});
router.get('/:user/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/:user/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});

/**
 * @swagger
 * /shareschedule/{user}:
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
    const students = JSON.parse(readFileSync('./src/students/students.json', 'utf-8'));
    if (users[user] && users[user]["shareSchedule"]) {
        let date = new Date();
        let previousMonday = new Date(date);
        previousMonday.setDate(date.getDate() - date.getDay() + 1);
        if (date.getDay() === 0 || date.getDay() === 6) {
            let nextMonday = new Date(date);
            nextMonday.setDate(date.getDate() + 8 - date.getDay());
            previousMonday = nextMonday;
        }
        generateSchedule(students, user, previousMonday, res);
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

/**
 * @swagger
 * /shareschedule/{user}/{date}:
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
    const students = JSON.parse(readFileSync('./src/students/students.json', 'utf-8'));
    if (users[user] && users[user]["shareSchedule"]) {
        let date = req.params.date;
        if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
            let dateArray = date.split('-');
            let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
            if (dateObj.getDay() === 1) {
                generateSchedule(students, user, dateObj, res);
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