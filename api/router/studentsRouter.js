const express = require('express');
const { readFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

router.get('/groups/', authenticateToken, (req, res) => {
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

router.get('/classes/', authenticateToken, (req, res) => {
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

router.get('/timetable/', authenticateToken, (req, res) => {
    let user = req.user.user;
    let fileClasses = './src/students/classes.json';
    let fileStudents = './src/students/students.json';
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    readFile(fileStudents, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            if (students.hasOwnProperty(user)) {
                let student = students[user];
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
                        let timetable = {};
                        for (d in days) {
                            timetable[days[d]] = {};
                            for (elem in followedClasses) {
                                if (classes[followedClasses[elem]] != undefined && classes[followedClasses[elem]]["day"] == days[d]) {
                                    timetable[days[d]][followedClasses[elem]] = classes[followedClasses[elem]];

                                }
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