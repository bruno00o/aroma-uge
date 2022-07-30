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
            res.status(500).send('Internal server error');
        } else {
            let students = JSON.parse(data);
            let user = req.auth.user;
            if (students.hasOwnProperty(user)) {
                let groups = students[user];
                res.status(200).send(JSON.stringify(groups));
            } else {
                res.status(404).send({ message: 'User not found' });
            }
        }
    });
});

module.exports = router;