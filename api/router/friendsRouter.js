const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile } = require('fs');
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
                return cb(null, basicAuth.safeCompare(passHash, users[username]["password"]));
            } else {
                return cb(null, false);
            }
        }
    });
}

router.get('/requests/', (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let username = req.auth.user;
            if (users.hasOwnProperty(username)) {
                res.status(200).send(users[username]["requests"]);
            } else {
                res.status(400).send({ error: 'User not found' });
            }
        }
    });
});

router.get('/', (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let user = req.auth.user;
            if (users.hasOwnProperty(user)) {
                let friends = users[user]["friends"];
                res.status(200).send(JSON.stringify(friends));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

router.post('/request/:id', (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let requestedUser = req.params.id;
            let username = req.auth.user;
            if (users.hasOwnProperty(requestedUser)) {
                let requestedUserRequests = users[requestedUser]["requests"];
                if (requestedUserRequests.indexOf(username) === -1) {
                    requestedUserRequests.push(username);
                    users[requestedUser]["requests"] = requestedUserRequests;
                    writeFile(fileName, JSON.stringify(users), (err) => {
                        if (err) {
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send({ message: 'Request sent' });
                        }
                    });
                } else {
                    res.status(400).send({ error: 'Request already sent' });
                }
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

module.exports = router;