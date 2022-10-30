const express = require('express');
const { readFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

/**
 * @swagger
 * /calendar/apprenticeship:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie le calendrier de l'apprentissage des L3 info
 *     tags:
 *        - Apprentissage
 *     responses:
 *        200:
 *          description: Calendrier envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/', authenticateToken, (req, res) => {
    let fileName = './src/calendar/apprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    });
});

/**
 * @swagger
 * /calendar/apprenticeship/next:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'événement suivant du calendrier de l'apprentissage
 *     tags:
 *        - Apprentissage
 *     responses:
 *        200:
 *          description: Jour envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/next/', authenticateToken, (req, res) => {
    let fileName = './src/calendar/apprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let calendar = JSON.parse(data);
            let keys = Object.keys(calendar);
            let actualDate = new Date();
            let i = 0;
            if (actualDate.getHours() >= 18) {
                i = 1;
            }
            let lastDate = new Date(keys[0]);
            let nextDate = new Date(actualDate);
            nextDate.setDate(nextDate.getDate() + i);
            if (nextDate > lastDate) {
                res.send({ error: 'No next date' });
            } else {
                do {
                    let nextDate = new Date(actualDate);
                    nextDate.setDate(nextDate.getDate() + i);
                    let nexDate = nextDate.getDate() > 9 ? nextDate.getDate() : '0' + nextDate.getDate();
                    let nextMonth = nextDate.getMonth() + 1 > 9 ? nextDate.getMonth() + 1 : '0' + (nextDate.getMonth() + 1);
                    let nextYear = nextDate.getFullYear();
                    var nextDateString = nexDate + '/' + nextMonth + '/' + nextYear;
                    i++;
                } while (keys.indexOf(nextDateString) === -1);
                let event = calendar[nextDateString];
                if (calendar[nextDateString] === 'F') {
                    event = 'Férié';
                }
                res.status(200).send({ date: nextDateString, event: event });
            }
        }
    });
});

/**
 * @swagger
 * /calendar/apprenticeship/next/{element}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie le prochain jour en entreprise / en cours / férié
 *     tags:
 *        - Apprentissage
 *     parameters:
 *        - element:
 *          name: element
 *          description: element (Entreprise, Cours, F)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [Entreprise, Cours, F]
 *     responses:
 *        200:
 *          description: Jour envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/next/:element', authenticateToken, (req, res) => {
    let fileName = './src/calendar/apprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let calendar = JSON.parse(data);
            let keys = Object.keys(calendar);
            let actualDate = new Date();
            let i = 1;
            let lastDate = new Date(keys[0]);
            let nextDate = new Date(actualDate);
            nextDate.setDate(nextDate.getDate() + i);
            if (nextDate > lastDate) {
                res.send({ error: 'No next date' });
            } else {
                do {
                    let nextDate = new Date(actualDate);
                    nextDate.setDate(nextDate.getDate() + i);
                    let nexDate = nextDate.getDate() > 9 ? nextDate.getDate() : '0' + nextDate.getDate();
                    let nextMonth = nextDate.getMonth() + 1 > 9 ? nextDate.getMonth() + 1 : '0' + (nextDate.getMonth() + 1);
                    let nextYear = nextDate.getFullYear();
                    var nextDateString = nexDate + '/' + nextMonth + '/' + nextYear;
                    i++;
                } while (keys.indexOf(nextDateString) === -1 || calendar[nextDateString] !== req.params.element);
                res.status(200).send({ date: nextDateString, event: calendar[nextDateString] });
            }
        }
    });
});

/**
 * @swagger
 * /calendar/apprenticeship/date/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'évènement du jour
 *     tags:
 *        - Apprentissage
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Jour envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/date/:date/', authenticateToken, (req, res) => {
    let params = req.params;
    if (params.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let fileName = './src/calendar/apprenticeship.json';
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let date = params.date;
                let calendar = JSON.parse(data);
                date = date.replaceAll("-", "/");
                if (calendar.hasOwnProperty(date)) {
                    res.status(200).send({ date: date, event: calendar[date] });
                } else {
                    res.status(404).send({ error: 'Not found' });
                }
            }
        });
    } else {
        res.status(400).send({ error: 'Bad request' });
    }
});

/**
 * @swagger
 * /calendar/apprenticeship/count/{element}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Compte le nombre de jours en entreprise / en cours / fériés
 *     tags:
 *        - Apprentissage
 *     parameters:
 *        - element:
 *          name: element
 *          description: element (Entreprise, Cours, F)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [Entreprise, Cours, F]
 *     responses:
 *        200:
 *          description: Jour envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/count/:elem/', authenticateToken, (req, res) => {
    let params = req.params;
    if (params.elem == 'Cours' || params.elem == 'Entreprise' || params.elem == 'F') {
        let fileName = './src/calendar/apprenticeship.json';
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let calendar = JSON.parse(data);
                let count = 0;
                for (let key in calendar) {
                    if (calendar[key].includes(params.elem)) {
                        count++;
                    }
                }
                res.status(200).send({ count: count });
            }
        });
    } else {
        res.status(400).send({ error: 'Bad request' });
    }
});

module.exports = router;