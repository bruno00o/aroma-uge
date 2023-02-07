const express = require('express');
const { readFileSync } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const { getEndOfDay } = require('./modules/calendarModule.js');

const getCalendar = async () => {
    const file = './src/calendar/apprenticeship.json';
    const calendar = readFileSync(file, 'utf8');
    if (calendar) {
        return JSON.parse(calendar);
    } else {
        return { error: 'Internal server error' };
    }
};

const frDateToDate = (date) => {
    return new Date(date.split("/").reverse().join("-"));
};

const getCalendarDates = (calendar) => {
    const dates = [];
    const calendarDates = Object.keys(calendar);
    for (let i = 0; i < calendarDates.length; i++) {
        dates.push(frDateToDate(calendarDates[i]));
    }
    return dates;
};

const dateToFrDate = (date) => {
    let newDate = new Date(date);
    return newDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * @swagger
 * /apprenticeship/calendar:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie le calendrier de l'apprentissage des L3 info
 *     tags:
 *        - Apprentissage (L3 info)
 *     responses:
 *        200:
 *          description: Calendrier envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/calendar', authenticateToken, async (req, res) => {
    const calendar = await getCalendar();
    if (calendar.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    res.status(200).send(calendar);
});

/**
 * @swagger
 * /apprenticeship/next:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'événement suivant du calendrier de l'apprentissage
 *     tags:
 *        - Apprentissage (L3 info)
 *     responses:
 *        200:
 *          description: Jour envoyé
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/next', authenticateToken, async (req, res) => {
    const calendar = await getCalendar();
    if (calendar.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    const user = req.user.user;
    const endOfDay = await getEndOfDay(user);
    const date = new Date();
    const calendarDates = getCalendarDates(calendar);
    let i = 0;
    if (date > endOfDay) {
        i = 1;
    }
    const lastDate = calendarDates[calendarDates.length - 1];
    let nextDate = new Date(date).setDate(date.getDate() + i);
    if (nextDate > lastDate) {
        res.status(500).send({ error: 'No next date' });
        return;
    }
    do {
        nextDate = new Date(date).setDate(date.getDate() + i);
        nextDateString = dateToFrDate(nextDate);
        i++;
    } while (calendar[nextDateString] === undefined);
    const event = calendar[nextDateString];
    if (calendar[nextDate] === 'F') {
        event = 'Férié';
    }
    res.status(200).send({ date: nextDateString, event: event });
});

/**
 * @swagger
 * /apprenticeship/next/{element}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie le prochain jour en entreprise / en cours / férié
 *     tags:
 *        - Apprentissage (L3 info)
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
router.get('/next/:element', authenticateToken, async (req, res) => {
    const calendar = await getCalendar();
    if (calendar.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    const date = new Date();
    const calendarDates = getCalendarDates(calendar);
    let i = 1;
    const lastDate = calendarDates[calendarDates.length - 1];
    let nextDate = new Date(date).setDate(date.getDate() + i);
    if (nextDate > lastDate) {
        res.status(500).send({ error: 'No next date' });
        return;
    }
    do {
        nextDate = new Date(date).setDate(date.getDate() + i);
        nextDateString = dateToFrDate(nextDate);
        i++;
    } while (calendar[nextDateString] !== req.params.element);
    const event = calendar[nextDateString];
    if (calendar[nextDate] === 'F') {
        event = 'Férié';
    }
    res.status(200).send({ date: nextDateString, event: event });
});

/**
 * @swagger
 * /apprenticeship/date/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'évènement du jour
 *     tags:
 *        - Apprentissage (L3 info)
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
router.get('/date/:date', authenticateToken, async (req, res) => {
    const calendar = await getCalendar();
    if (calendar.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    let date = req.params.date;
    if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        date = date.replaceAll('-', '/');
        if (calendar.hasOwnProperty(date)) {
            res.status(200).send({ date: date, event: calendar[date] });
            return;
        }
        res.status(404).send({ error: 'Not found' });
        return;
    }
    res.status(400).send({ error: 'Bad request' });
});

/**
 * @swagger
 * /apprenticeship/count/{element}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Compte le nombre de jours en entreprise / en cours / fériés
 *     tags:
 *        - Apprentissage (L3 info)
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
router.get('/count/:element', authenticateToken, async (req, res) => {
    const calendar = await getCalendar();
    if (calendar.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    let count = 0;
    for (let key in calendar) {
        if (calendar[key].includes(req.params.element)) {
            count++;
        }
    }
    res.status(200).send({ count: count });
});

module.exports = router;