const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

/**
 * Get friends
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
 * Get requests from user
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
                res.status(400).send({ error: 'User not found' });
            }
        }
    });
});

/**
 * Request to add a friend
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
                let requestdUserFriends = users[requestedUser]["friends"];
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
                    res.status(400).send({ error: 'Request already sent or already friends' });
                }
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        }
    });
});

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
                res.status(400).send({ error: 'Request not found' });
            }
        }
    });
});

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
                res.status(400).send({ error: 'Request not found' });
            }
        }
    });
});

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
                res.status(400).send({ error: 'Friend not found' });
            }
        }
    });
});

router.get('/timetable/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let timetableUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(timetableUser) !== -1) {
                let user = timetableUser;
                let fileClasses = './src/students/classes.json';
                let fileStudents = './src/students/students.json';
                let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                readFile(fileStudents, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        if (students.hasOwnProperty(user)) {
                            let student = students[user];
                            let followedClasses = new Array();
                            let studentKeys = Object.keys(student);
                            for (let i = 0; i < studentKeys.length; i++) {
                                followedClasses.push(studentKeys[i].toLowerCase().replaceAll(' ', authenticateToken, '_') + '_' + student[studentKeys[i]]);
                            }
                            readFile(fileClasses, (err, data) => {
                                if (err) {
                                    res.status(500).send({ error: 'Internal server error' });
                                } else {
                                    let classes = JSON.parse(data);
                                    let timetable = {};
                                    for (d in days) {
                                        timetable[days[d]] = {};
                                        for (elem in followedClasses) {
                                            if (classes[followedClasses[elem]] != undefined && classes[followedClasses[elem]]["day"] == days[d]) {
                                                timetable[days[d]][followedClasses[elem]] = classes[followedClasses[elem]];

                                            }
                                        }
                                    }
                                    res.status(200).send(JSON.stringify(timetable));
                                }
                            });
                        } else {
                            res.status(404).send({ error: 'User not found' });
                        }
                    }
                });
            } else {
                res.status(400).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

router.get('/groups/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let groupsUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(groupsUser) !== -1) {
                let fileStudents = './src/students/students.json';
                readFile(fileStudents, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        let user = req.user.user;
                        if (students.hasOwnProperty(user)) {
                            let groups = students[user];
                            res.status(200).send(JSON.stringify(groups));
                        } else {
                            res.status(404).send({ error: 'User not found' });
                        }
                    }
                });
            } else {
                res.status(400).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

router.get('/sharedgroups/:id', authenticateToken, (req, res) => {
    let fileName = './src/users/users.json';
    let sharedgroups = new Array();
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let users = JSON.parse(data);
            let groupsUser = req.params.id;
            let username = req.user.user;
            if (users.hasOwnProperty(username) && users[username]["friends"].indexOf(groupsUser) !== -1) {
                let fileStudents = './src/students/students.json';
                readFile(fileStudents, (err, data) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        let students = JSON.parse(data);
                        let user = req.user.user;
                        if (students.hasOwnProperty(user) && students.hasOwnProperty(groupsUser)) {
                            let userGroups = students[user];
                            let friendGroups = students[groupsUser];
                            let userKeys = Object.keys(userGroups);
                            let friendKeys = Object.keys(friendGroups);
                            for (let i = 0; i < userKeys.length; i++) {
                                for (let j = 0; j < friendKeys.length; j++) {
                                    if (userKeys[i] == friendKeys[j]) {
                                        if (userGroups[userKeys[i]] === friendGroups[friendKeys[j]]) {
                                            sharedgroups.push(userKeys[i]);
                                        }
                                    }
                                }
                            }
                            res.status(200).send(JSON.stringify(sharedgroups));
                        } else {
                            res.status(404).send({ error: 'One user not found' });
                        }
                    }
                });
            } else {
                res.status(400).send({ error: 'User not found or friend not found' });
            }
        }
    });
});

module.exports = router;