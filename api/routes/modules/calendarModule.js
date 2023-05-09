const { readFileSync } = require('fs');
const { getStudents, checkUser } = require('../utils/utils.js');

const getCalendar = async (calendarName, monday = false) => {
    const calendarURLs = './src/calendar/calendarURLs.json';
    const calendars = readFileSync(calendarURLs, 'utf8');
    if (!calendars) {
        return { error: 'Internal server error', code: 500 };
    }
    const calendarURLsJson = JSON.parse(calendars);
    if (!calendarURLsJson.hasOwnProperty(calendarName)) {
        return { error: 'Calendar not found', code: 404 };
    }
    let file;
    if (monday) file = './src/calendar/monday/' + calendarURLsJson[calendarName].jsonFileName.replace(".json", "_monday.json");
    else file = './src/calendar/json/' + calendarURLsJson[calendarName].jsonFileName;

    const calendar = readFileSync(file, 'utf8');
    if (!calendar) {
        return { error: 'Internal server error', code: 500 };
    }
    return JSON.parse(calendar);
};

const checkSameEvent = (calendar, event) => {
    calendar.forEach(event1 => {
        if (event1.start === event.start && event1.end === event.end) {
            return true;
        }
    });
    return false;
};

const addCalendar = (calendar, resCalendar) => {
    calendar.forEach((event) => {
        if (!checkSameEvent(resCalendar, event)) {
            resCalendar.push(event);
        }
    });
    return resCalendar;
};

const dateFormat = (strDate) => {
    const date = strDate.split('T')[0];
    const time = strDate.split('T')[1];
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    const seconds = time.substring(4, 6);
    const newDate = new Date(Date.UTC(year, month - 1, day, hour, minute, seconds));
    return newDate;
};

const sortCalendarByDate = (calendar) => {
    calendar.sort((a, b) => {
        let dateA = dateFormat(a.start);
        let dateB = dateFormat(b.start);
        return dateA - dateB;
    });
    return calendar;
};

const changeDateCalendar = (calendar) => {
    calendar.forEach(event => {
        event.start = dateFormat(event.start);
        event.end = dateFormat(event.end);
    });
    return calendar;
};

const deleteSameEvents = (calendar) => {
    const processedEvents = new Set();
    for (let i = 0; i < calendar.length; i++) {
        const event = calendar[i];
        if (processedEvents.has(event.start + event.end)) {
            calendar.splice(i, 1);
            i--;
        } else {
            processedEvents.add(event.start + event.end);
        }
    }
    return calendar;
};

const getApprenticeTimetable = async (username, monday = false) => {
    const students = await getStudents();
    if (students.error) {
        return { error: students.error, code: students.code };
    }
    if (!students.hasOwnProperty(username)) {
        return { error: 'User not found', code: 404 };
    }
    const user = students[username];
    if (!user.ALTERNANCE) {
        return { error: 'User not found', code: 404 };
    }
    if (!user.ALTERNANCE === 'ALTERNANCE') {
        return { error: 'User not found', code: 404 };
    }
    const calendar = await getCalendar('ALTERNANCE', monday);
    if (calendar.error) {
        return { error: calendar.error, code: calendar.code };
    }
    const sortedCalendar = sortCalendarByDate(calendar);
    const changedDateCalendar = changeDateCalendar(sortedCalendar);
    return changedDateCalendar;
};

const getTimetableByGroup = async (username, monday = false) => {
    const students = await getStudents();
    if (students.error) {
        return { error: students.error, code: students.code };
    }
    if (!students.hasOwnProperty(username)) {
        return { error: 'User not found', code: 404 };
    }
    const user = students[username];
    if (!user.GROUPE) {
        return { error: 'User not found', code: 404 };
    }
    const calendar = await getCalendar(user.GROUPE, monday);
    if (calendar.error) {
        return { error: calendar.error, code: calendar.code };
    }
    if (user.OPTION !== undefined && user.OPTION !== "") {
        const optionCalendar = await getCalendar(user.OPTION, monday);
        if (optionCalendar.error) {
            return { error: optionCalendar.error, code: optionCalendar.code };
        }
        const addedCalendar = addCalendar(optionCalendar, calendar);
        const sortedCalendar = sortCalendarByDate(addedCalendar);
        const changedDateCalendar = changeDateCalendar(sortedCalendar);
        const deletedSameEvents = deleteSameEvents(changedDateCalendar);
        return deletedSameEvents;
    } else {
        const sortedCalendar = sortCalendarByDate(calendar);
        const changedDateCalendar = changeDateCalendar(sortedCalendar);
        return changedDateCalendar;
    }
};

const getTimetable = async (username, monday = false) => {
    const students = await getStudents();
    if (students.error) {
        return { error: students.error, code: students.code };
    }
    if (!students.hasOwnProperty(username)) {
        return { error: 'User not found', code: 404 };
    }
    const user = students[username];
    if (user.ALTERNANCE === 'ALTERNANCE') {
        const calendar = await getApprenticeTimetable(username, monday);
        if (calendar.length === 0) {
            return await getApprenticeTimetable(username, true);
        }
        return calendar;
    } else {
        const calendar = await getTimetableByGroup(username, monday);
        if (calendar.length === 0) {
            return await getTimetableByGroup(username, true);
        }
        return calendar;
    }
};

const addWeekDays = (calendar) => {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    weekDays.forEach(day => {
        if (calendar[day] === undefined) {
            calendar[day] = [];
        }
    });
    return calendar;
};

const sortCalendarByDateByDays = (calendar) => {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let sortedCalendar = {};
    weekDays.forEach(day => {
        sortedCalendar[day] = calendar[day];
    });
    return sortedCalendar;
};

const weekDaysToFrench = (calendar) => {
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
};

const addPastDays = async (calendar, username, date) => {
    const pastCalendar = await getTimetable(username, true);
    if (pastCalendar.error) {
        return { error: pastCalendar.error, code: pastCalendar.code };
    }
    let maxDate = new Date(date);
    maxDate.setDate(maxDate.getDate() + 6);
    if (new Date() < maxDate) {
        maxDate = new Date(new Date().setHours(4, 0, 0, 0));
    }
    pastCalendar.forEach(event => {
        if (new Date(event.start) < maxDate && new Date(event.start) >= date) {
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            let eventDate = new Date(event.start);
            if (calendar[weekday[eventDate.getDay()]] === undefined) {
                calendar[weekday[eventDate.getDay()]] = [];
            }
            calendar[weekday[eventDate.getDay()]].push(event);
        }
    });
    return calendar;
};

const removeDuplicates = (calendar) => {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    weekDays.forEach(day => {
        if (calendar[day] !== undefined) {
            calendar[day].forEach(event => {
                let hash = event.start + event.end + event.title;
                calendar[day].forEach(event1 => {
                    let hash1 = event1.start + event1.end + event1.title;
                    if (hash === hash1 && event !== event1) {
                        calendar[day].splice(calendar[day].indexOf(event1), 1);
                    }
                });
            });
        }
    });
    return calendar;
};

const getWeekTimetable = async (user, date) => {
    date.setHours(4, 0, 0, 0); // no class before 8am
    if (date.getDay() !== 1) {
        return { error: "La date doit être un lundi", code: 400 };
    }
    if (!await checkUser(user)) {
        return { error: "Utilisateur inconnu", code: 404 };
    }
    const calendar = await getTimetable(user);
    if (calendar.error) {
        return calendar;
    }
    let resCalendar = {};
    const nextWeekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6);
    calendar.forEach(event => {
        let eventDate = new Date(event.start);
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (eventDate >= date && eventDate <= nextWeekDate) {
            if (resCalendar[weekday[eventDate.getDay()]] === undefined) {
                resCalendar[weekday[eventDate.getDay()]] = [];
            }
            resCalendar[weekday[eventDate.getDay()]].push(event);
        }
    });
    if (new Date().getDay() !== 1) {
        resCalendar = await addPastDays(resCalendar, user, date);
    }
    resCalendar = addWeekDays(resCalendar);
    resCalendar = removeDuplicates(resCalendar);
    resCalendar = sortCalendarByDateByDays(resCalendar);
    resCalendar = weekDaysToFrench(resCalendar);
    return resCalendar;
};

const getActualDay = async (user) => {
    let date = new Date();
    let prevMonday = new Date();
    prevMonday.setDate(date.getDate() - date.getDay() + 1);
    const weekTimetable = await getWeekTimetable(user, prevMonday);
    let day = date.getDay();
    let dayName = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    let dayEvents = weekTimetable[dayName[day]];
    if (dayEvents === undefined || dayEvents.length === 0) {
        return null;
    }
    let resCalendar = {};
    resCalendar[dayName[day]] = dayEvents;
    return resCalendar;
};

const getEndOfDay = async (user) => {
    const actualDay = await getActualDay(user);
    if (actualDay === null) {
        return new Date(new Date().setHours(18, 0, 0, 0));
    }
    let maxEnd = actualDay[Object.keys(actualDay)[0]][0].end;
    actualDay[Object.keys(actualDay)[0]].forEach(event => {
        if (event.end > maxEnd) {
            maxEnd = event.end;
        }
    });
    return maxEnd;
};

const getNextClass = async (user) => {
    const calendar = await getTimetable(user);
    if (calendar.error) {
        return calendar;
    }
    const date = new Date();
    let nextClass = null;
    calendar.forEach(event => {
        let start = new Date(event.start);
        let end = new Date(event.end);
        if (start <= date && end >= date) {
            let totalDuration = end - start;
            if (nextClass === null && totalDuration / 2 < end - date) {
                nextClass = event;
            }
        } else if (start > date) {
            if (nextClass === null) {
                nextClass = event;
            }
        }
    });

    if (nextClass === null) {
        return { error: "Aucun cours ce jour là", code: 404 };
    }
    return nextClass;
};

const generateSchedule = async (user, date, res, arrows) => {
    const resCalendar = await getWeekTimetable(user, date);
    if (resCalendar.error) {
        res.status(500).send({ error: 'Internal server error' });
    }
    let startDate = new Date(date);
    let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6);
    startDate = startDate.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    endDate = endDate.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const students = await getStudents();
    if (students.error) {
        res.status(500).send({ error: 'Internal server error' });
    }
    if (students.hasOwnProperty(user)) {
        const groups = students[user];
        const nom = groups["NOM"];
        const prenom = groups["PRENOM"];
        res.render('schedule-view/schedule', { calendar: resCalendar, start: startDate, end: endDate, nom: nom, prenom: prenom, arrows: arrows });
    }
    else {
        res.status(404).send({ error: 'User not found' });
    }
};

module.exports = {
    getTimetable: getTimetable,
    getWeekTimetable: getWeekTimetable,
    generateSchedule: generateSchedule,
    getNextClass: getNextClass,
    getActualDay: getActualDay,
    getEndOfDay: getEndOfDay
};
