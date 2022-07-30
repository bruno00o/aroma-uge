const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile } = require('fs');
const nodemailer = require('nodemailer');
const router = express.Router();

const random = (length = 8) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

router.post('/', (req, res) => {
    let params = req.body;
    readFile('./src/users/users.json', (err, dataUsers) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(dataUsers);
            if (users.hasOwnProperty(params.username)) {
                res.status(400).send({ error: 'Username already exists' });
            } else {
                if (err) {
                    res.status(500).send({ error: 'Internal server error' });
                } else {
                    readFile('./src/students/students.json', (err, dataStudents) => {
                        if (err) {
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            let students = JSON.parse(dataStudents);
                            if (!students.hasOwnProperty(params.username)) {
                                res.status(400).send({ error: 'Username is not a student' });
                            } else {
                                var validating = {};
                                var randomString = random(40);
                                readFile('./src/users/validating.json', (err, dataValidating) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Internal server error' });
                                    } else {
                                        validating = JSON.parse(dataValidating);
                                        validating[randomString] = {
                                            username: params.username,
                                            password: crypto.createHash('md5').update(params.password).digest('hex')
                                        }
                                        writeFile('./src/users/validating.json', JSON.stringify(validating), (err) => {
                                            if (err) {
                                                res.status(500).send({ error: 'Internal server error' });
                                            } else {
                                                var transporter = nodemailer.createTransport({
                                                    service: 'gmail',
                                                    host: 'smtp.gmail.com',
                                                    auth: {
                                                        user: 'vos.loulous.info@gmail.com',
                                                        pass: 'whkrdbjvzsmaflcb'
                                                    }
                                                });
                                                let mailOptions = {
                                                    from: 'Aroma UGE <vos.loulous.info@gmail.com>',
                                                    to: params.username + '@edu.univ-eiffel.fr',
                                                    subject: 'Validation de votre compte',
                                                    /* html: "<h1>Bienvenue sur Aroma UGE !</h1><p>Vous avez demandé à créer un compte sur Aroma UGE. Pour valider votre compte, veuillez cliquer sur le lien suivant :<br><a href='http://mnfu4687.odns.fr/validate/" + randomString + "'>Valider mon compte</a></p><p>Si vous n'avez pas demandé à créer un compte, ignorez ce mail.</p>" */
                                                    html: "<h1>Bienvenue sur Aroma UGE !</h1><p>Vous avez demandé à créer un compte sur Aroma UGE. Pour valider votre compte, veuillez cliquer sur le lien suivant :<br><br><a href='http://localhost:8080/validate/" + randomString + "'>Valider mon compte</a></p><p>Si vous n'avez pas demandé à créer un compte, ignorez ce mail.</p>"
                                                }
                                                transporter.sendMail(mailOptions, (err, info) => {
                                                    if (err) {
                                                        res.status(500).send({ error: 'Internal server error' });
                                                    } else {
                                                        res.status(200).send({ success: 'Mail sent' });
                                                    }
                                                });
                                            }
                                        });
                                        setTimeout(() => {
                                            readFile('./src/users/validating.json', (err, dataValidating) => {
                                                if (err) {
                                                    res.status(500).send({ error: 'Internal server error' });
                                                } else {
                                                    validating = JSON.parse(dataValidating);
                                                    if (validating.hasOwnProperty(randomString)) {
                                                        delete validating[randomString];
                                                        writeFile('./src/users/validating.json', JSON.stringify(validating), (err) => {
                                                            if (err) {
                                                                res.status(500).send({ error: 'Internal server error' });
                                                            }
                                                        }
                                                        );
                                                    }
                                                }
                                            });
                                        }, 900000);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
});

/* router.get('/forgot/:username', (req, res) => {
    let username = req.params.username;
    readFile('./src/users/users.json', (err, dataUsers) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(dataUsers);
            if (users.hasOwnProperty(username)) {
                var randomString = random(40);
                readFile('./src/users/resetting.json', (err, dataResetting) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let resetting = JSON.parse(dataResetting);
                        resetting[randomString] = {
                            username: username
                        }
                        writeFile('./src/users/resetting.json', JSON.stringify(resetting), (err) => {
                            if (err) {
                                res.status(500).send({ error: 'Internal server error' });
                            } else {
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    host: 'smtp.gmail.com',
                                    auth: {
                                        user: 'vos.loulous.infos@gmail.com',
                                        pass: 'whkrdbjvzsmaflcb'
                                    }
                                });
                                let mailOptions = {
                                    from: 'Aroma UGE <vos.loulous.infos@gmail.com>',
                                    to: username + '@edu.univ-eiffel.fr',
                                    subject: 'Réinitialisation de votre mot de passe',
                                    html: "<h1>Vous avez</h1><p>Vous avez demandé à réinitialiser votre mot de passe. Pour le réinitialiser, veuillez cliquer sur le lien suivant :<br><br><a href='http://localhost:8080/register/reset/" + randomString + "'>Réinitialiser mon mot de passe</a></p><p>Si vous n'avez pas demandé à réinitialiser votre mot de passe, ignorez ce mail.</p>"
                                }
                                transporter.sendMail(mailOptions, (err, info) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Internal server error' });
                                    }
                                    else {
                                        res.status(200).send({ success: 'Mail sent' });
                                    }
                                }
                                );
                            }
                        });
                        setTimeout(() => {
                            readFile('./src/users/resetting.json', (err, dataResetting) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    resetting = JSON.parse(dataResetting);
                                    if (resetting.hasOwnProperty(randomString)) {
                                        delete resetting[randomString];
                                        writeFile('./src/users/resetting.json', JSON.stringify(resetting), (err) => {
                                            if (err) {
                                                res.status(500).send({ error: 'Internal server error' });
                                            }
                                        }
                                        );
                                    }
                                }
                            });
                        }, 900000);
                    }
                });
            } else {
                res.status(400).send({ error: 'Username does not exist' });
            }
        }
    });
}); */

module.exports = router;