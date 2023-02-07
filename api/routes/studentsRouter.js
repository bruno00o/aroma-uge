require('dotenv').config();
const express = require('express');
const { readFile } = require('fs');
const puppeteer = require('puppeteer');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const getTimetable = require('./modules/calendarModule').getTimetable;
const getWeekTimetable = require('./modules/calendarModule').getWeekTimetable;
const getNextClass = require('./modules/calendarModule').getNextClass;
const { getStudents } = require('./utils/utils');

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
router.get('/info', authenticateToken, async (req, res) => {
    const username = req.user.user;
    const students = await getStudents();
    if (!students) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    if (!students.hasOwnProperty(username)) {
        res.status(404).send({ error: 'User not found' });
        return;
    }
    res.status(200).send(students[username]);
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
router.get('/timetable', authenticateToken, async (req, res) => {
    const username = req.user.user;
    const students = await getStudents();
    if (!students) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    if (!students.hasOwnProperty(username)) {
        res.status(404).send({ error: 'User not found' });
        return;
    }
    const calendar = await getTimetable(username);
    if (!calendar) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    res.status(200).send(calendar);
});

/**
 * @swagger
 * /students/week-timetable/{date}:
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
router.get('/week-timetable/:date', authenticateToken, async (req, res) => {
    const username = req.user.user;
    const students = await getStudents();
    if (!students) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    if (!students.hasOwnProperty(username)) {
        res.status(404).send({ error: 'User not found' });
        return;
    }
    const date = req.params.date;
    if (!date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        res.status(400).send({ error: 'Bad request' });
        return;
    }
    const dateArray = date.split('-');
    const dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
    if (dateObj.getDay() !== 1) {
        res.status(400).send({ error: 'Date must be a Monday' });
        return;
    }
    const calendar = await getWeekTimetable(username, dateObj);
    if (!calendar) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    res.status(200).send(calendar);
});

/**
 * @swagger
 * /students/next-class:
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
router.get('/next-class', authenticateToken, async (req, res) => {
    const students = await getStudents();
    if (!students) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    const user = req.user.user;
    const nextClass = await getNextClass(user);
    if (nextClass.error) {
        res.status(nextClass.code).send({ error: nextClass.error });
        return;
    }
    res.status(200).send(nextClass);
});

module.exports = router;