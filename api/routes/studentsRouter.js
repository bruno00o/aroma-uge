const express = require('express');
const { readFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

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

async function getCalendar(calendarName) {
    let calendarURLs = './src/calendar/calendarURLs.json';
    return new Promise((resolve, reject) => {
        readFile(calendarURLs, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let calendarURLs = JSON.parse(data);
                if (calendarURLs.hasOwnProperty(calendarName)) {
                    let file = './src/calendar/' + calendarURLs[calendarName].jsonFileName;
                    readFile(file, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            let calendar = JSON.parse(data);
                            resolve(calendar);
                        }
                    });
                } else {
                    reject('Calendar not found');
                }
            }
        });
    });
}

async function checkSameEvent(calendar, event2) {
    return new Promise((resolve, reject) => {
        calendar.forEach(event1 => {
            if (event1.summary === event2.summary && event1.start === event2.start && event1.end === event2.end && event1.location === event2.location) {
                resolve(true);
            }
        });
        resolve(false);
    });
}

async function addCalendar(calendar, resCalendar) {
    return new Promise((resolve, reject) => {
        calendar.forEach((event) => {
            checkSameEvent(resCalendar, event).then((sameEvent) => {
                if (!sameEvent) {
                    resCalendar.push(event);
                }
            }).catch((err) => {
                reject(err);
            });
        });
        resolve(resCalendar);
    });
}

function dateFormat(strDate) {
    let date = strDate.split('T')[0];
    let time = strDate.split('T')[1];
    let year = date.substring(0, 4);
    let month = date.substring(4, 6);
    let day = date.substring(6, 8);
    let hour = time.substring(0, 2);
    let minute = time.substring(2, 4);
    let seconds = time.substring(4, 6);
    let newDate = new Date(year, month - 1, day, hour, minute, seconds);
    return newDate;
}

async function sortCalendar(calendar) {
    return new Promise((resolve, reject) => {
        calendar.sort((a, b) => {
            let dateA = dateFormat(a.start);
            let dateB = dateFormat(b.start);
            return dateA - dateB;
        });
        resolve(calendar);
    });
}

async function changeDateCalendar(calendar) {
    return new Promise((resolve, reject) => {
        calendar.forEach(event => {
            event.start = dateFormat(event.start);
            event.end = dateFormat(event.end);
        });
        resolve(calendar);
    });
}

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
            if (students.hasOwnProperty(user)) {
                let resCalendar = [];
                if (students[user].ALTERNANCE != false) {
                    if (students[user].ALTERNANCE === 'ALTERNANCE') {
                        getCalendar('ALTERNANCE').then((calendar) => {
                            resCalendar = calendar;
                            sortCalendar(resCalendar).then((sortedCalendar) => {
                                changeDateCalendar(sortedCalendar).then((calendar) => {
                                    res.status(200).send(JSON.stringify(calendar));
                                });
                            }).catch((err) => {
                                res.status(500).send({ error: 'Internal server error' });
                            });
                        }).catch((err) => {
                            res.status(500).send({ error: 'Internal server error' });
                        });
                    } else if (students[user].ALTERNANCE === 'RECHERCHE') {
                        getCalendar('RECHERCHE').then((calendar) => {
                            resCalendar = calendar;
                            getCalendar(students[user].OPTION).then((calendar) => {
                                addCalendar(calendar, resCalendar).then((calendar) => {
                                    sortCalendar(calendar).then((sortedCalendar) => {
                                        changeDateCalendar(sortedCalendar).then((calendar) => {
                                            res.status(200).send(JSON.stringify(calendar));
                                        });
                                    }).catch((err) => {
                                        res.status(500).send({ error: 'Internal server error' });
                                    });
                                }).catch((err) => {
                                    res.status(500).send({ error: 'Internal server error' });
                                });
                            }).catch((err) => {
                                res.status(500).send({ error: 'Internal server error' });
                            });
                        }).catch((err) => {
                            res.status(500).send({ error: 'Internal server error' });
                        });
                    } else {
                        res.status(500).send({ error: 'Internal server error' });
                    }
                } else {
                    getCalendar(students[user].GROUPE).then((calendar) => {
                        resCalendar = calendar;
                        getCalendar(students[user].OPTION).then((calendar) => {
                            resCalendar = calendar;
                            getCalendar(students[user].OPTION).then((calendar) => {
                                addCalendar(calendar, resCalendar).then((calendar) => {
                                    sortCalendar(calendar).then((sortedCalendar) => {
                                        changeDateCalendar(sortedCalendar).then((calendar) => {
                                            res.status(200).send(JSON.stringify(calendar));
                                        });
                                    }).catch((err) => {
                                        res.status(500).send({ error: 'Internal server error' });
                                    });
                                }).catch((err) => {
                                    res.status(500).send({ error: 'Internal server error' });
                                });
                            }).catch((err) => {
                                res.status(500).send({ error: 'Internal server error' });
                            });
                        }).catch((err) => {
                            res.status(500).send({ error: 'Internal server error' });
                        });
                    }).catch((err) => {
                        res.status(500).send({ error: 'Internal server error' });
                    });
                }
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});


module.exports = router;