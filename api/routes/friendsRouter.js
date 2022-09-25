const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const getTimeTable = require('./modules/calendarModule').getTimeTable;
const getWeekTimetable = require('./modules/calendarModule').getWeekTimetable;
const generateSchedule = require('./modules/calendarModule').generateSchedule;

/**
 * @swagger
 * /friends:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie la liste des amis de l'utilisateur
 *     tags:
 *        - Amis
 *     responses:
 *        200:
 *          description: Liste d'amis envoyée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let user = req.user.user;
            if (users.hasOwnProperty(user)) {
                let friends = users[user]["friends"];
                res.status(200).send(JSON.stringify(friends));
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/requests:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie la liste des requêtes d'amis de l'utilisateur
 *     tags:
 *        - Amis
 *     responses:
 *        200:
 *          description: Liste de requêtes envoyée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/requests/', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let username = req.user.user;
            if (users.hasOwnProperty(username)) {
                res.status(200).send(users[username]["requests"]);
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/request/{username}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Envoie une requête d'amis à un utilisateur
 *     tags:
 *        - Amis
 *     parameters:
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'utilisateur à qui envoyer la requête
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Requête envoyée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Utilisateur non trouvé
 *        500:
 *          description: Internal server error
 */
router.post('/request/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let requestedUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(requestedUser)) {
                let requestedUserRequests = users[requestedUser]["requests"];
                let userFriends = users[username]["friends"];
                if (requestedUserRequests.indexOf(username) === -1  && requestedUser !== username && userFriends.indexOf(requestedUser) === -1) {
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
                    res.status(400).send({ error: 'Request already sent or already friends. You can\'t send a request to yourself' });
                }
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/accept/{username}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Accepte une requête d'amis d'un utilisateur
 *     tags:
 *        - Amis
 *     parameters:
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'utilisateur dont la requête doit être acceptée
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Requête acceptée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Requête non trouvée
 *        500:
 *          description: Internal server error
 */
router.post('/accept/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let acceptedUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["requests"].indexOf(acceptedUser) !== -1) {
                let acceptedUserFriends = users[acceptedUser]["friends"];
                if (acceptedUserFriends.indexOf(username) === -1) {
                    acceptedUserFriends.push(username);
                }
                users[acceptedUser]["friends"] = acceptedUserFriends;
                let usernameFriends = users[username]["friends"];
                if (usernameFriends.indexOf(acceptedUser) === -1) {
                    usernameFriends.push(acceptedUser);
                }
                users[username]["friends"] = usernameFriends;
                let usernameRequests = users[username]["requests"];
                usernameRequests.splice(usernameRequests.indexOf(acceptedUser), 1);
                users[username]["requests"] = usernameRequests;
                let acceptedUserRequests = users[acceptedUser]["requests"];
                if (acceptedUserRequests.indexOf(username) !== -1) {
                    acceptedUserRequests.splice(acceptedUserRequests.indexOf(username), 1);
                }
                users[acceptedUser]["requests"] = acceptedUserRequests;
                writeFile(fileName, JSON.stringify(users), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ message: 'Request accepted' });
                    }
                });
            } else {
                res.status(404).send({ error: 'Request not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/decline/{username}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Décline une requête d'amis d'un utilisateur
 *     tags:
 *        - Amis
 *     parameters:
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'utilisateur dont la requête doit être déclinée
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Requête déclinée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Requête non trouvée
 *        500:
 *          description: Internal server error
 */
router.post('/decline/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let declinedUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["requests"].indexOf(declinedUser) !== -1) {
                let declinedUserRequests = users[declinedUser]["requests"];
                declinedUserRequests.splice(declinedUserRequests.indexOf(username), 1);
                users[declinedUser]["requests"] = declinedUserRequests;
                let usernameRequests = users[username]["requests"];
                usernameRequests.splice(usernameRequests.indexOf(declinedUser), 1);
                users[username]["requests"] = usernameRequests;
                writeFile(fileName, JSON.stringify(users), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ message: 'Request declined' });
                    }
                });
            } else {
                res.status(404).send({ error: 'Request not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/delete/{username}:
 *  delete:
 *     security:
 *        - accessToken: []
 *     description: Supprime un ami d'un utilisateur
 *     tags:
 *        - Amis
 *     parameters:
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'amis à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Amis supprimé
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Ami non trouvé
 *        500:
 *          description: Internal server error
 */
router.delete('/delete/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let deletedUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(deletedUser) !== -1) {
                let deletedUserFriends = users[deletedUser]["friends"];
                deletedUserFriends.splice(deletedUserFriends.indexOf(username), 1);
                users[deletedUser]["friends"] = deletedUserFriends;
                let usernameFriends = users[username]["friends"];
                usernameFriends.splice(usernameFriends.indexOf(deletedUser), 1);
                users[username]["friends"] = usernameFriends;
                writeFile(fileName, JSON.stringify(users), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ message: 'Friend deleted' });
                    }
                });
            } else {
                res.status(404).send({ error: 'Friend not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/timetable/{username}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Récupère le planning d'un ami au format json
 *     tags:
 *        - Amis
 *     parameters:
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'amis à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Planning récupéré
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Ami non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/timetable/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    let studentsFileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let friend = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(friend) !== -1) {
                readFile(studentsFileName, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        if (students.hasOwnProperty(friend)) {
                            getTimeTable(students, friend).then((timetable) => {
                                res.status(200).send(timetable);
                            }).catch((err) => {
                                res.status(500).send({ error: 'Internal server error' });
                            });
                        } else {
                            res.status(404).send({ error: 'Friend not found' });
                        }
                    }
                });
            } else {
                res.status(404).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

/**
 * @swagger
 * /friends/weektimetable/{date}/{username}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Récupère le planning d'un ami sur une semaine au format json
 *     tags:
 *        - Amis
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'amis à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Planning récupéré
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Ami non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/weektimetable/:date/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    let studentsFileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let friend = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(friend) !== -1) {
                readFile(studentsFileName, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        if (students.hasOwnProperty(friend)) {
                            let date = req.params.date;
                            if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
                                let fileName = './src/students/students.json';
                                readFile(fileName, (err, data) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Internal server error' });
                                    } else {
                                        let students = JSON.parse(data);
                                        let dateArray = date.split('-');
                                        let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
                                        if (dateObj.getDay() === 1) {
                                            getWeekTimetable(students, friend, dateObj).then((calendar) => {
                                                res.status(200).send(calendar);
                                            }).catch((err) => {
                                                res.status(500).send({ error: 'Internal server error' });
                                            });
                                        } else {
                                            res.status(400).send({ error: 'Date must be a Monday' });
                                        }
                                    }
                                });
                            } else {
                                res.status(400).send({ error: 'Bad request' });
                            }
                        } else {
                            res.status(404).send({ error: 'Friend not found' });
                        }
                    }
                });
            } else {
                res.status(404).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

router.get('/genschedule/:date/style.css', (req, res) => {
    res.sendFile('style.css', { 'root': __dirname + '/../views/schedule-view/assets/css/' });
});

router.get('/genschedule/:date/util.js', (req, res) => {
    res.sendFile('util.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});

router.get('/genschedule/:date/main.js', (req, res) => {
    res.sendFile('main.js', { 'root': __dirname + '/../views/schedule-view/assets/js/' });
});

/**
 * @swagger
 * /friends/genschedule/{date}/{username}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Récupère le planning d'un ami au format html
 *     tags:
 *        - Amis
 *     parameters:
 *        - date:
 *          name: date
 *          description: date format dd-mm-yyyy (doit être un lundi)
 *          in: path
 *          required: true
 *          type: string
 *        - username:
 *          name: username
 *          description: username (prenom.nom) de l'amis à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Planning récupéré
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Ami non trouvé
 *        500:
 *          description: Internal server error
 */
router.get('/genschedule/:date/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    let studentsFileName = './src/students/students.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let friend = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(friend) !== -1) {
                readFile(studentsFileName, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        if (students.hasOwnProperty(friend)) {
                            let date = req.params.date;
                            if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
                                let fileName = './src/students/students.json';
                                readFile(fileName, (err, data) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Internal server error' });
                                    } else {
                                        let students = JSON.parse(data);
                                        let dateArray = date.split('-');
                                        let dateObj = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
                                        if (dateObj.getDay() === 1) {
                                            generateSchedule(students, friend, dateObj, res, false);
                                        } else {
                                            res.status(400).send({ error: 'Date must be a Monday' });
                                        }
                                    }
                                });
                            } else {
                                res.status(400).send({ error: 'Bad request' });
                            }
                        } else {
                            res.status(404).send({ error: 'Friend not found' });
                        }
                    }
                });
            } else {
                res.status(404).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

module.exports = router;