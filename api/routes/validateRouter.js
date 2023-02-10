const express = require('express');
const crypto = require('crypto');
var parseUrl = require('body-parser');
const { readFileSync, writeFileSync } = require('fs');
const router = express.Router();
const { getUsers } = require('./utils/utils');

let encodeUrl = parseUrl.urlencoded({ extended: false });

router.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/src/css/style.css');
});

router.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/views/src/img/favicon.ico');
});

router.get('/changepass/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/src/css/style.css');
});

router.get('/changepass/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/views/src/img/favicon.ico');
});

router.get('/:token', async (req, res) => {
    const params = req.params;
    const token = params.token;
    const fileNameValidating = './src/users/validating.json';

    const dataValidating = readFileSync(fileNameValidating, 'utf8');

    if (!dataValidating) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    const validating = JSON.parse(dataValidating);

    if (!validating.hasOwnProperty(token)) {
        res.status(400).sendFile('./views/registrationFailed.html', { root: __dirname });
        return;
    }

    const fileNameUsers = './src/users/users.json';
    const users = await getUsers();

    if (users.hasOwnProperty(validating[token]["username"])) {
        res.status(400).send({ error: 'Username already exists' });
        return;
    }

    users[validating[token]["username"]] = {
        password: validating[token]["password"],
        friends: [],
        requests: [],
        shareSchedule: false,
        shareScheduleURL: ""
    };

    writeFileSync(fileNameUsers, JSON.stringify(users));

    delete validating[token];
    writeFileSync(fileNameValidating, JSON.stringify(validating));

    res.status(200).sendFile('./views/registrationSuccessful.html', { root: __dirname });
});

router.post('/changepass/:token', encodeUrl, async (req, res) => {
    const token = req.params.token;
    const fileNameResetting = './src/users/resetting.json';
    const params = req.body;

    const paternMin = /[a-z]/;
    const paternMaj = /[A-Z]/;
    const paternNum = /[0-9]/;
    const paternLength = /.{8,}/;

    if (!paternMin.test(params.password) || !paternMaj.test(params.password) || !paternNum.test(params.password) || !paternLength.test(
        params.password)) {
        res.status(400).send({ error: 'Password is not strong enough' });
        return;
    }

    const dataResetting = readFileSync(fileNameResetting, 'utf8');

    if (!dataResetting) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    const resetting = JSON.parse(dataResetting);

    if (!resetting.hasOwnProperty(token)) {
        res.status(400).sendFile('./views/passwordChangeFailed.html', { root: __dirname });
        return;
    }

    const fileNameUsers = './src/users/users.json';
    const users = await getUsers();

    if (!users.hasOwnProperty(resetting[token])) {
        res.status(400).send({ error: 'User not found' });
        return;
    }

    users[resetting[token]].password = crypto.createHash('sha256').update(params.password).digest('hex');

    writeFileSync(fileNameUsers, JSON.stringify(users));

    delete resetting[token];
    writeFileSync(fileNameResetting, JSON.stringify(resetting));

    res.status(200).sendFile('./views/passwordChanged.html', { root: __dirname });
});

module.exports = router;