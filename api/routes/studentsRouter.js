require('dotenv').config();
const express = require('express');
const { readFile } = require('fs');
const puppeteer = require('puppeteer');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const getTimeTable = require('./modules/calendarModule').getTimeTable;
const getWeekTimetable = require('./modules/calendarModule').getWeekTimetable;
const generateSchedule = require('./modules/calendarModule').generateSchedule;
const generateOneDay = require('./modules/calendarModule').generateOneDay;
const generateNextClass = require('./modules/calendarModule').generateNextClass;
const getNextClass = require('./modules/calendarModule').getNextClass;

/**
 * @swagger
 * /students/info:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie les données de l'utilisateur
 *     tags:
 *        - Étudiant
 *     responses:
 *        200:
 *          description: Données de l'étudiant renvoyées
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/info/', authenticateToken, (req, res) => {
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.user.user;
            if (students.hasOwnProperty(user)) {
                let groups = students[user];
                res.status(200).send(JSON.stringify(groups));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

/**
 * @swagger
 * /students/timetable:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant
 *     tags:
 *        - Étudiant
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/timetable/', authenticateToken, (req, res) => {
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.user.user;
            getTimeTable(students, user).then((calendar) => {
                res.status(200).send(calendar);
            }).catch((err) => {
                res.status(500).send({ error: 'Internal server error' });
            });
        }
    });
});

/**
 * @swagger
 * /students/weektimetable/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour la semaine de la date donnée
 *     tags:
 *        - Étudiant
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/weektimetable/:date', authenticateToken, (req, res) => {
    let date = req.params.date;
    if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let fileName = './src/students/students.json';
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let students = JSON.parse(data);
                let user = req.user.user;
                let dateArray = date.split('-');
                let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
                if (dateObj.getDay() === 1) {
                    getWeekTimetable(students, user, dateObj).then((calendar) => {
                        res.status(200).send(JSON.stringify(calendar));
                    }).catch((err) => {
                        res.status(500).send({ error: 'Internal server error' });
                    });
                } else {
                    res.status(400).send({ error: 'Date must be a Monday' });
                }
            }
        });
    } else {
        res.status(400).send({ error: 'Bad request' });
    }
});

router.get('/genschedule/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});

router.get('/genschedule/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});

router.get('/genschedule/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});

/**
 * @swagger
 * /students/genschedule/today:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour le jour actuel sous forme de page html
 *     tags:
 *        - Étudiant
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
 router.get('/genschedule/today', authenticateToken, (req, res) => {
    let date = new Date();
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.user.user;
            generateOneDay(students, user, date, res);
        }
    });
});

/**
 * @swagger
 * /students/getnextclass:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie le prochain cours de l'étudiant
 *     tags:
 *        - Étudiant
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
 router.get('/getnextclass', authenticateToken, (req, res) => {
    let date = new Date();
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.user.user;
            getNextClass(students, user, date, res);
        }
    });
});

/**
 * @swagger
 * /students/genschedule/nextclass:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour le jour suivant sous forme de page html
 *     tags:
 *        - Étudiant
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
 router.get('/genschedule/nextclass', authenticateToken, (req, res) => {
    let date = new Date();
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.user.user;
            generateNextClass(students, user, date, res);
        }
    });
});


/**
 * @swagger
 * /students/genschedule/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour la semaine de la date donnée sous forme de page html. Attention, les jours passés ne sont pas affichés
 *     tags:
 *        - Étudiant
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/genschedule/:date', authenticateToken, (req, res) => {
    let date = req.params.date;
    if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let fileName = './src/students/students.json';
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let students = JSON.parse(data);
                let user = req.user.user;
                let dateArray = date.split('-');
                let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
                if (dateObj.getDay() === 1) {
                    generateSchedule(students, user, dateObj, res, false);
                } else {
                    res.status(400).send({ error: 'Date must be a Monday' });
                }
            }
        });
    } else {
        res.status(400).send({ error: 'Bad request' });
    }
});

/**
 * @swagger
 * /students/imgschedule/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour la semaine de la date donnée sous forme d'une image png
 *     tags:
 *        - Étudiant
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Emploi du temps de l'étudiant renvoyé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/imgschedule/:date', authenticateToken, (req, res) => {
    let date = req.params.date;
    if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let dateArray = date.split('-');
        let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
        if (dateObj.getDay() === 1) {
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    const headers = request.headers();
                    headers["Authorization"] = req.headers['authorization'];
                    request.continue({ headers });
                });
                await page.setViewport({ width: 1400, height: 1200 });
                await page.goto(process.env.URL_API + 'students/genschedule/' + req.params.date, { waitUntil: 'networkidle2' });
                await page.screenshot({ path: './src/students/timetables/' + req.user.user + '.png', fullPage: true });
                await browser.close();
                res.status(200).sendFile(req.user.user + '.png', { 'root': __dirname + '/../src/students/timetables/' });
            })();
        } else {
            res.status(400).send({ error: 'Date must be a Monday' });
        }
    } else {
        res.status(400).send({ error: 'Bad request' });
    }
});

module.exports = router;