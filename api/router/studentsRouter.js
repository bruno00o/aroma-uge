const express = require('express');
const crypto = require('crypto');
const { readFile } = require('fs');
const basicAuth = require('express-basic-auth');
const router = express.Router();

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
                return cb(null, basicAuth.safeCompare(passHash, users[username]));
            } else {
                return cb(null, false);
            }
        }
    });
}

router.get('/groups/', (req, res) => {
    let fileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let user = req.auth.user;
            if (students.hasOwnProperty(user)) {
                let groups = students[user];
                res.status(200).send(JSON.stringify(groups));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

router.get('/classes/', (req, res) => {
    let fileName = './src/students/classes.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            res.status(200).send(JSON.stringify(classes));
        }
    });
});

router.get('/timetable/', (req, res) => {
    let user = req.auth.user;
    let fileClasses = './src/students/classes.json';
    let fileStudents = './src/students/students.json';
    readFile(fileStudents, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            if (students.hasOwnProperty(user)) {
                let student = students[user];
                console.log(student);
                let followedClasses = new Array();
                let studentKeys = Object.keys(student);
                for (let i = 0; i < studentKeys.length; i++) {
                    followedClasses.push(studentKeys[i].toLowerCase().replaceAll(' ', '_') + '_' + student[studentKeys[i]]);
                }
                readFile(fileClasses, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let classes = JSON.parse(data);
                        let timetable = new Array();
                        let classesKeys = Object.keys(classes);
                        for (let i = 0; i < classesKeys.length; i++) {
                            let className = classesKeys[i]
                            if (followedClasses.includes(className)) {
                                timetable.push(className);
                            }
                        }
                        res.status(200).send(JSON.stringify(timetable));
                    }
                });
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

module.exports = router;