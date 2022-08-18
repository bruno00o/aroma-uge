const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile } = require('fs');
const router = express.Router();

router.post('/', (req, res) => {
    let fileName = './src/users/users.json';
    let passHash = crypto.createHash('md5').update(req.body.password).digest('hex');
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            if (users.hasOwnProperty(req.body.username) && users[req.body.username]["password"] === passHash) {
                res.status(200).send({ login: true });
            } else {
                res.status(200).send({ login: false });
            }
        }
    });
});

router.post('/deleteuser/', (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            delete users[req.body.username];
            writeFile(fileName, JSON.stringify(users), (err) => {
                if (err) {
                    res.status(500).send({ error: 'Internal server error' });
                } else {
                    res.status(200).send({ delete: true });
                }
            }
            );
        }
    }
    );
});

router.get('/getusers/', (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    }
    );
});

module.exports = router;