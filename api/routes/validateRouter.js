const express = require('express');
const crypto = require('crypto');
var parseUrl = require('body-parser');
const { readFile, writeFile } = require('fs');
const router = express.Router();

let encodeUrl = parseUrl.urlencoded({ extended: false });

router.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/src/css/style.css');
});

router.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/views/src/img/favicon.ico');
});

router.get('/fonts/tahoma.ttf', (req, res) => {
    res.sendFile(__dirname + '/views/src/fonts/tahoma.ttf');
});

router.get('/fonts/TAHOMABD.TTF', (req, res) => {
    res.sendFile(__dirname + '/views/src/fonts/TAHOMABD.TTF');
});

router.get('/changepass/style.css', (req, res) => {
    res.sendFile(__dirname + '/views/src/css/style.css');
});

router.get('/changepass/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/views/src/img/favicon.ico');
});

router.get('/changepass/fonts/tahoma.ttf', (req, res) => {
    res.sendFile(__dirname + '/views/src/fonts/tahoma.ttf');
});

router.get('/changepass/fonts/TAHOMABD.TTF', (req, res) => {
    res.sendFile(__dirname + '/views/src/fonts/TAHOMABD.TTF');
});

router.get('/:token', (req, res) => {
    let params = req.params;
    let token = params.token;
    let fileNameValidating = './src/users/validating.json';
    readFile(fileNameValidating, (err, dataValidating) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let validating = JSON.parse(dataValidating);
            if (validating.hasOwnProperty(token)) {
                let fileNameUsers = './src/users/users.json';
                readFile(fileNameUsers, (err, dataUsers) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let users = JSON.parse(dataUsers);
                        if (users.hasOwnProperty(validating[token]["username"])) {
                            res.status(400).send({ error: 'Username already exists' });
                        } else {
                            users[validating[token]["username"]] = {
                                password: validating[token]["password"],
                                friends: [],
                                requests: []
                            };
                            writeFile(fileNameUsers, JSON.stringify(users), (err) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    delete validating[token];
                                    writeFile(fileNameValidating, JSON.stringify(validating), (err) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Internal server error' });
                                        } else {
                                            res.status(200).sendFile('./views/registrationSuccessful.html', { root: __dirname });
                                        }
                                    }
                                    );
                                }
                            }
                            );
                        }
                    }
                });
            } else {
                res.status(400).sendFile('./views/registrationFailed.html', { root: __dirname });
            }
        }
    });
});

router.post('/changepass/:token', encodeUrl, (req, res) => {
    let token = req.params.token;
    let fileNameResetting = './src/users/resetting.json';
    let params = req.body;
    readFile(fileNameResetting, (err, dataResetting) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let resetting = JSON.parse(dataResetting);
            if (resetting.hasOwnProperty(token)) {
                let fileNameUsers = './src/users/users.json';
                readFile(fileNameUsers, (err, dataUsers) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let users = JSON.parse(dataUsers);
                        if (users.hasOwnProperty(resetting[token])) {
                            users[resetting[token]] = {
                                password: crypto.createHash('sha256').update(params.password).digest('hex'),
                                friends: [],
                                requests: []
                            };
                            writeFile(fileNameUsers, JSON.stringify(users), (err) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    delete resetting[token];
                                    writeFile(fileNameResetting, JSON.stringify(resetting), (err) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Internal server error' });
                                        } else {
                                            res.status(200).sendFile('./views/passwordChanged.html', { root: __dirname });
                                        }
                                    }
                                    );
                                }
                            }
                            );
                        } else {
                            res.status(400).send({ error: 'User not found' });
                        }
                    }
                });
            } else {
                res.status(400).sendFile('./views/passwordChangeFailed.html', { root: __dirname });
            }
        }
    });
});

module.exports = router;