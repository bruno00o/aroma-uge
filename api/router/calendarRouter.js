const { generateKeyPairSync } = require('crypto');
const express = require('express');
const { readFile } = require('fs');
const router = express.Router();

router.get('/apprenticeship', (req, res) => {
    let fileName = './src/calendar/apprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    });
});

router.get('/apprenticeship/next', (req, res) => {
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
                } while (keys.indexOf(nextDateString) === -1);
                res.status(200).send({ date: nextDateString, event: calendar[nextDateString] });
            }
        }
    });
});

router.get('/apprenticeship/date/:date', (req, res) => {
    let params = req.params;
    if (params.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let fileName = './src/calendar/apprenticeship.json';
        readFile(fileName, (err, data) => {
            if (err) {
                res.status(500).send({ error: 'Internal server error' });
            } else {
                let date = params.date;
                date = date.replaceAll("-", "/");
                console.log(date);
                let calendar = JSON.parse(data);
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

module.exports = router;