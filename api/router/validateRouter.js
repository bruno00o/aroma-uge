const express = require('express');
const crypto = require('crypto');
var parseUrl = require('body-parser');
const { readFile, writeFile } = require('fs');
const router = express.Router();

let encodeUrl = parseUrl.urlencoded({ extended: false });

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
                            users[validating[token]["username"]] = validating[token]["password"];
                            writeFile(fileNameUsers, JSON.stringify(users), (err) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    delete validating[token];
                                    writeFile(fileNameValidating, JSON.stringify(validating), (err) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Internal server error' });
                                        } else {
                                            res.status(200).send("<body style='font-family:Arial, sans-serif; margin:0; padding:0; box-sizing:border-box; display:flex; justify-content:center; align-items:center; flex-direction:column';><h1>Aroma UGE</h1><h2 style='text-align: center;'>Votre compte a bien été créé. Bienvenue sur Aroma UGE !</h2></body>");
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
                res.status(400).send("<body style='font-family:Arial, sans-serif; margin:0; padding:0; box-sizing:border-box; display:flex; justify-content:center; align-items:center; flex-direction:column';><h1>Aroma UGE</h1><h2 style='text-align: center; '>Lien de validation expiré ou invalide. Veuillez réessayer.</h2></body>");
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
                            users[resetting[token]] = crypto.createHash('md5').update(params.password).digest('hex');
                            writeFile(fileNameUsers, JSON.stringify(users), (err) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    delete resetting[token];
                                    writeFile(fileNameResetting, JSON.stringify(resetting), (err) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Internal server error' });
                                        } else {
                                            res.status(200).send("<body style='font-family:Arial, sans-serif; margin:0; padding:0; box-sizing:border-box; display:flex; justify-content:center; align-items:center; flex-direction:column';><h1>Aroma UGE</h1><h2 style='text-align: center;'>Votre mot de passe a bien été changé.</h2></body>");
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
                res.status(400).send({ error: 'Link expired' });
            }
        }
    });
});

module.exports = router;