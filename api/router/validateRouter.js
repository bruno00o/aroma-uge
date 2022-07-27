const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();

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
                                            res.status(200).send({ message: 'User created' });
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
                res.status(400).send({ error: 'Invalid token' });
            }
        }
    });
});

module.exports = router;