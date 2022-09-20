require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const { readFileSync, writeFileSync, readFile } = require('fs');

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
 * /shareSchedule/{boolean}:
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

router.get('/:user/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});
router.get('/:user/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});
router.get('/:user/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});


router.get('/:user', (req, res) => {
    const user = req.params.user;
    const users = JSON.parse(readFileSync('./src/users/users.json', 'utf-8'));
    const students = JSON.parse(readFileSync('./src/students/students.json', 'utf-8'));
    if (users[user] && users[user]["shareSchedule"]) {
        let date = new Date();
        let previousMonday = new Date(date);
        previousMonday.setDate(date.getDate() - date.getDay() + 1);

        getWeekTimetable(students, user, previousMonday).then((calendar) => {
            const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            /* add days to calendar if not in */
            weekDays.forEach(day => {
                if (calendar[day] === undefined) {
                    calendar[day] = [];
                }
            });
            /* sort by day */
            let sortedCalendar = {};
            weekDays.forEach(day => {
                sortedCalendar[day] = calendar[day];
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
            for (const [key, value] of Object.entries(sortedCalendar)) {
                resCalendar[frenchWeekDays[key]] = value;
            }
            let startDate = previousMonday;
            let endDate = new Date(previousMonday.getFullYear(), previousMonday.getMonth(), previousMonday.getDate() + 6);
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
                    console.log(err);
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
        res.status(404).send({ error: 'Not found' });
    }
});

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
                getWeekTimetable(students, user, dateObj).then((calendar) => {
                    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    /* add days to calendar if not in */
                    weekDays.forEach(day => {
                        if (calendar[day] === undefined) {
                            calendar[day] = [];
                        }
                    });
                    /* sort by day */
                    let sortedCalendar = {};
                    weekDays.forEach(day => {
                        sortedCalendar[day] = calendar[day];
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
                    for (const [key, value] of Object.entries(sortedCalendar)) {
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
        } else {
            res.status(400).send({ error: 'Bad request' });
            return;
        }
    } else {
        res.status(404).send({ error: 'Not found' });
    }
});

module.exports = router;