const express = require('express');
const crypto = require('crypto');
const { readFile } = require('fs');
const basicAuth = require('express-basic-auth');
const router = express.Router();

/* router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("WWW-Authenticate", 'Basic realm="Authorization Required"');
    next();
});

app.options('/*', (_, res) => {
    res.sendStatus(200);
});
 */
router.use(basicAuth({
    authorizer: checkPassword,
    authorizeAsync: true
}));

function checkPassword(username, password, cb) {
    let fileName = './src/users/users.json';
    let passHash = crypto.createHash('md5').update(password).digest('hex');
    readFile(fileName, (err, data) => {
        if (err) {
            console.log(err);
            return cb(null, false);
        } else {
            let users = JSON.parse(data);
            if (users.hasOwnProperty(username)) {
                return cb(null, basicAuth.safeCompare(passHash, users[username]["password"]));
            } else {
                return cb(null, false);
            }
        }
    });
}

router.get('/', (req, res) => {
    let fileName = './src/calendar/apprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    });
});

router.get('/next/', (req, res) => {
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

router.get('/date/:date/', (req, res) => {
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

router.get('/count/:elem/', (req, res) => {
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