const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile, read } = require('fs');
const basicAuth = require('express-basic-auth');
const router = express.Router();

router.use(basicAuth({
    authorizer: checkPassword,
    authorizeAsync: true
}));

function checkPassword(username, password, cb) {
    let fileName = './src/users/users.json';
    let fileAdmin = './src/users/admin.json';
    let passHash = crypto.createHash('md5').update(password).digest('hex');
    readFile(fileAdmin, (err, dataAdmin) => {
        if (err) {
            return cb(null, false);
        } else {
            let admins = JSON.parse(dataAdmin);
            if (admins.includes(username)) {
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
            } else {
                return cb(null, false);
            }
        }
    })
}

router.get('/students/', (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            res.status(200).send(students);
        }
    })
});

router.get('/classes/', (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            res.status(200).send(classes);
        }
    })
});

module.exports = router;