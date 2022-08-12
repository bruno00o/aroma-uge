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

router.get('/requests/', (req, res) => {
    let fileName = './src/friends/requests.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let requests = JSON.parse(data);
            let user = req.auth.user;
            if (requests.hasOwnProperty(user)) {
                let requests = requests[user];
                res.status(200).send(JSON.stringify(requests));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

router.get('/', (req, res) => {
    let fileName = './src/friends/friends.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let friends = JSON.parse(data);
            let user = req.auth.user;
            if (friends.hasOwnProperty(user)) {
                let friends = friends[user];
                res.status(200).send(JSON.stringify(friends));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

router.post('/request/:id', (req, res) => {
    let fileName = './src/friends/requests.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let requests = JSON.parse(data);
            let user = req.auth.user;
            let requesedtUser = req.params.id;
            if (requests.hasOwnProperty(requesedtUser)) {
                requests[requesedtUser].push(user);
            } else {
                requests[requesedtUser] = [user];
            }
            writeFile(fileName, JSON.stringify(requests), (err) => {
                if (err) {
                    res.status(500).send({ error: 'Internal server error' });
                } else {
                    res.status(200).send({ success: true });
                }
            });
        }
    });
});

module.exports = router;