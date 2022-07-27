const express = require('express');
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
            console.log(err);
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
                                            password: params.password
                                        }
                                        console.log(validating);
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
                                                    html: "<h1>Bienvenue sur Aroma UGE !</h1><p>Vous avez demandé à créer un compte sur Aroma UGE. Pour valider votre compte, veuillez cliquer sur le lien suivant :<br><a href='http://mnfu4687.odns.fr/validate/" + randomString + "'>Valider mon compte</a></p><p>Si vous n'avez pas demandé à créer un compte, ignorez ce mail.</p>"
                                                }
                                                transporter.sendMail(mailOptions, (err, info) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500).send({ error: 'Internal server error' });
                                                    } else {
                                                        res.status(200).send({ message: 'Mail sent' });
                                                    }
                                                });
                                            }
                                        });
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

module.exports = router;