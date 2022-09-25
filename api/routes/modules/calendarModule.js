const { readFile } = require('fs');

/**
 * Return the json calendar
 * @param {*} calendarName 
 */
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

/**
 * Check if the event is already in the calendar
 * @param {*} calendar 
 * @param {*} event
 * @returns 
 */
function checkSameEvent(calendar, event) {
    calendar.forEach(event1 => {
        if (event1.summary === event.summary && event1.start === event.start && event1.end === event.end && event1.location === event.location) {
            return true;
        }
    });
    return false;
}

/**
 * Add events from one calendar to another
 * @param {*} calendar 
 * @param {*} resCalendar 
 * @returns 
 */
function addCalendar(calendar, resCalendar) {
    calendar.forEach((event) => {
        if (!checkSameEvent(resCalendar, event)) {
            resCalendar.push(event);
        }
    });
    return resCalendar;
}

/**
 * Format the date from a string
 * @param {*} strDate 
 * @returns Date
 */
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

/**
 * Sort the calendar by date
 * @param {*} calendar 
 * @returns calendar
 */
function sortCalendar(calendar) {
    calendar.sort((a, b) => {
        let dateA = dateFormat(a.start);
        let dateB = dateFormat(b.start);
        return dateA - dateB;
    });
    return calendar;
}

/**
 * Change the date format in the calendar
 * @param {*} calendar 
 * @returns calendar
 */
function changeDateCalendar(calendar) {
    calendar.forEach(event => {
        event.start = dateFormat(event.start);
        event.end = dateFormat(event.end);
    });
    return calendar;
}

/**
 * Return the timetable of the user (working only for L3 info students)
 * @param {*} students 
 * @param {*} user 
 * @returns calendar
 */
async function getTimeTable(students, username) {
    return new Promise((resolve, reject) => {
        let user = students[username];
        if (user.ALTERNANCE === 'ALTERNANCE') {
            getCalendar('ALTERNANCE').then((calendar) => {
                calendar = sortCalendar(calendar);
                calendar = changeDateCalendar(calendar);
                resolve(calendar);
            }).catch((err) => {
                reject(err);
            });
        } else if (user.ALTERNANCE === 'RECHERCHE') {
            getCalendar('RECHERCHE').then((calendar) => {
                getCalendar('OPTION').then((optionCalendar) => {
                    calendar = addCalendar(optionCalendar, calendar);
                    calendar = sortCalendar(calendar);
                    calendar = changeDateCalendar(calendar);
                    resolve(calendar);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        } else {
            getCalendar(user.GROUPE).then((calendar) => {
                getCalendar(user.OPTION).then((optionCalendar) => {
                    calendar = addCalendar(optionCalendar, calendar);
                    calendar = sortCalendar(calendar);
                    calendar = changeDateCalendar(calendar);
                    resolve(calendar);
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
 * Add week days to the calendar if there are not already in
 * @param {*} calendar 
 * @returns calendar
 */
function addWeekDays(calendar) {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    /* add days to calendar if not in */
    weekDays.forEach(day => {
        if (calendar[day] === undefined) {
            calendar[day] = [];
        }
    });
    return calendar;
}

/**
 * Sort the calendar by week days
 * @param {*} calendar 
 * @returns calendar
 */
function sortCalendarByDays(calendar) {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let sortedCalendar = {};
    weekDays.forEach(day => {
        sortedCalendar[day] = calendar[day];
    });
    return sortedCalendar;
}

/**
 * Translate the week days in french
 * @param {*} calendar 
 * @returns calendar
 */
function weekDaysToFrench(calendar) {
    const frenchWeekDays = {
        "Monday": "Lundi",
        "Tuesday": "Mardi",
        "Wednesday": "Mercredi",
        "Thursday": "Jeudi",
        "Friday": "Vendredi",
        "Saturday": "Samedi",
        "Sunday": "Dimanche"
    }
    let resCalendar = {};
    for (const [key, value] of Object.entries(calendar)) {
        resCalendar[frenchWeekDays[key]] = value;
    }
    return resCalendar;
}

/**
 * Return the calendar of the user on the week
 * @param {*} students 
 * @param {*} user 
 * @param {*} date 
 * @returns calendar
 */
async function getWeekTimetable(students, user, date) {
    date.setHours(6);
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
            resCalendar = addWeekDays(resCalendar);
            resCalendar = sortCalendarByDays(resCalendar);
            resCalendar = weekDaysToFrench(resCalendar);
            resolve(resCalendar);
        }).catch((err) => {
            reject(err);
        });
    });
}

async function generateOneDay(students, user, date, res) {
    let previousMonday = new Date(date);
    previousMonday.setDate(date.getDate() - date.getDay() + 1);
    getWeekTimetable(students, user, previousMonday).then((calendar) => {
        let day = date.getDay();
        let dayName = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        let dayEvents = calendar[dayName[day]];
        if (dayEvents === undefined || dayEvents.length === 0) {
            res.send({ error: "Aucun cours ce jour là" });
        } else {
            let resCalendar = {};
            resCalendar[dayName[day]] = dayEvents;
            res.render('schedule-view/scheduleOneDay', { calendar: resCalendar });
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ error: 'Internal server error' });
    });
}

async function getNextClass(students, user, date, res) {
    getTimeTable(students, user).then((calendar) => {
        let nextClass = null;
        calendar.forEach(event => {
            let eventDate = new Date(event.start);
            if (eventDate > date) {
                if (nextClass === null) {
                    nextClass = event;
                } else if (eventDate < new Date(nextClass.start)) {
                    nextClass = event;
                }
            }
        });
        if (nextClass === null) {
            res.send({ error: "Aucun cours ce jour là" });
        } else {
            res.status(200).send(nextClass);
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ error: 'Internal server error' });
    });
}

async function generateNextClass(students, user, date, res) {
    getTimeTable(students, user).then((calendar) => {
        let nextClass = null;
        calendar.forEach(event => {
            let eventDate = new Date(event.start);
            if (eventDate > date) {
                if (nextClass === null) {
                    nextClass = event;
                } else if (eventDate < new Date(nextClass.start)) {
                    nextClass = event;
                }
            }
        });
        if (nextClass === null) {
            res.send({ error: "Aucun cours ce jour là" });
        } else {
            let resCalendar = {};
            resCalendar["Prochain cours"] = [nextClass];
            res.render('schedule-view/scheduleOneClass', { calendar: resCalendar });
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ error: 'Internal server error' });
    });
}

async function generateSchedule(students, user, date, res, arrows) {
    getWeekTimetable(students, user, date).then((resCalendar) => {
        let startDate = date;
        let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6);
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
                    res.render('schedule-view/schedule', { calendar: resCalendar, start: start, end: end, nom: nom, prenom: prenom, arrows: arrows });
                } else {
                    res.status(404).send({ error: 'User not found' });
                }
            }
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send({ error: 'Internal server error' });
    });
}

module.exports = {
    getTimeTable: getTimeTable,
    getWeekTimetable: getWeekTimetable,
    generateSchedule: generateSchedule,
    generateOneDay: generateOneDay,
    generateNextClass: generateNextClass,
    getNextClass: getNextClass
};
