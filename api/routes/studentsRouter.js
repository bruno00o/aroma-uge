require('dotenv').config();
const express = require('express');
const { readFile } = require('fs');
const puppeteer = require('puppeteer');
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
    newDate.setHours(newDate.getHours() + 2);
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

async function getTimeTable(students, user) {
    return new Promise((resolve, reject) => {
        let resCalendar = [];
        if (students[user].ALTERNANCE != false) {
            if (students[user].ALTERNANCE === 'ALTERNANCE') {
                getCalendar('ALTERNANCE').then((calendar) => {
                    resCalendar = calendar;
                    sortCalendar(resCalendar).then((sortedCalendar) => {
                        changeDateCalendar(sortedCalendar).then((calendar) => {
                            resolve(calendar);
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            } else if (students[user].ALTERNANCE === 'RECHERCHE') {
                getCalendar('RECHERCHE').then((calendar) => {
                    resCalendar = calendar;
                    getCalendar(students[user].OPTION).then((calendar) => {
                        addCalendar(calendar, resCalendar).then((calendar) => {
                            sortCalendar(calendar).then((sortedCalendar) => {
                                changeDateCalendar(sortedCalendar).then((calendar) => {
                                    resolve(calendar);
                                });
                            }).catch((err) => {
                                reject(err);
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            } else {
                reject();
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
                                    resolve(calendar);
                                });
                            }).catch((err) => {
                                reject(err);
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        }
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
            getTimeTable(students, user).then((calendar) => {
                res.status(200).send(JSON.stringify(calendar));
            }).catch((err) => {
                res.status(500).send({ error: 'Internal server error' });
            });
        }
    });
});

async function getWeekTimetable(students, user, date) {
    return new Promise((resolve, reject) => {
        getTimeTable(students, user).then((calendar) => {
            let resCalendar = {};
            calendar.forEach(event => {
                let eventDate = new Date(event.start);
                let nextWeekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6);
                const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                if (eventDate >= date && eventDate <= nextWeekDate) {
                    if (resCalendar[weekday[eventDate.getDay()]] === undefined) {
                        resCalendar[weekday[eventDate.getDay()]] = [];
                    }
                    resCalendar[weekday[eventDate.getDay()]].push(event);
                }
            });
            resolve(resCalendar);
        }).catch((err) => {
            reject(err);
        });
    });
}


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
 * /students/genschedule/{date}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie l'emploi du temps de l'étudiant pour la semaine de la date donnée sous forme de page html
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
                    getWeekTimetable(students, user, dateObj).then((calendar) => {
                        const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                        /* add days to calendar if not in */
                        weekDays.forEach(day => {
                            if (calendar[day] === undefined) {
                                calendar[day] = [];
                            }
                        });
                        const frenchWeekDays = {
                            "Monday": "Lundi",
                            "Tuesday": "Mardi",
                            "Wednesday": "Mercredi",
                            "Thursday": "Jeudi",
                            "Friday": "Vendredi",
                            "Saturday": "Samedi",
                            "Sunday": "Dimanche"
                        }
                        /* change days to french in calendar */
                        let resCalendar = {};
                        for (const [key, value] of Object.entries(calendar)) {
                            resCalendar[frenchWeekDays[key]] = value;
                        }
                        let startDate = dateObj;
                        let endDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 6);
                        /* format dates to dd/mm/yyyy */
                        let startDay = startDate.getDate().toString().length === 1 ? "0" + startDate.getDate() : startDate.getDate();
                        let startMonth = (startDate.getMonth() + 1).toString().length === 1 ? "0" + (startDate.getMonth() + 1) : (startDate.getMonth() + 1);
                        let startYear = startDate.getFullYear();
                        let endDay = endDate.getDate().toString().length === 1 ? "0" + endDate.getDate() : endDate.getDate();
                        let endMonth = (endDate.getMonth() + 1).toString().length === 1 ? "0" + (endDate.getMonth() + 1) : (endDate.getMonth() + 1);
                        let endYear = endDate.getFullYear();
                        let start = startDay + "/" + startMonth + "/" + startYear;
                        let end = endDay + "/" + endMonth + "/" + endYear;
                        let fileName = './src/students/students.json';
                        readFile(fileName, (err, data) => {
                            if (err) {
                                res.status(500).send({ error: 'Internal server error' });
                            } else {
                                let students = JSON.parse(data);
                                if (students.hasOwnProperty(user)) {
                                    let groups = students[user];
                                    let nom = groups["NOM"];
                                    let prenom = groups["PRENOM"];
                                    res.render('schedule-view/schedule', { calendar: resCalendar, start: start, end: end, nom: nom, prenom: prenom });
                                } else {
                                    res.status(404).send({ error: 'User not found' });
                                }
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
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