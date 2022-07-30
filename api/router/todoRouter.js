const express = require('express');
const crypto = require('crypto');
const { readFile, writeFile } = require('fs');
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

router.get('/apprenticeship/', (req, res) => {
    let username = req.auth.user;
    let fileName = './src/todo/todoApprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            if (todo.hasOwnProperty(username)) {
                res.status(200).send(todo[username]);
            } else {
                res.status(200).send({ error: 'No todo' });
            }
        }
    });
});

router.post('/apprenticeship/add/', (req, res) => {
    let username = req.auth.user;
    let fileName = './src/todo/todoApprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            if (todo.hasOwnProperty(username) && todo[username].hasOwnProperty("active")) {
                let newTodo = req.body;
                let id = Object.keys(newTodo)[0];
                todo[username].active[id] = newTodo[id];
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo[username]);
                    }
                });
            } else if (todo.hasOwnProperty(username)) {
                let newTodo = req.body;
                todo[username].active = newTodo;
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo[username]);
                    }
                });
            } else {
                let newTodo = req.body;
                todo[username] = { active: newTodo };
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo[username]);
                    }
                });
            }
        }
    });
});

router.get('/apprenticeship/maxid/', (req, res) => {
    let username = req.auth.user;
    let fileName = './src/todo/todoApprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            if (todo.hasOwnProperty(username)) {
                let keys = Object.keys(todo[username]);
                let maxId = 0;
                for (let i = 0; i < keys.length; i++) {
                    let ids = Object.keys(todo[username][keys[i]]);
                    for (let j = 0; j < ids.length; j++) {
                        if (ids[j] > maxId) {
                            maxId = ids[j];
                        }
                    }
                }
                res.status(200).send({ maxId: maxId });
            } else {
                res.status(200).send({ error: 'No todo' });
            }
        }
    });
});

router.get('/apprenticeship/todone/:id', (req, res) => {
    let username = req.auth.user;
    let fileName = './src/todo/todoApprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            if (todo.hasOwnProperty(username)) {
                let id = req.params.id;
                if (todo[username].active.hasOwnProperty(id)) {
                    if (todo[username].hasOwnProperty("done")) {
                        todo[username].done[id] = todo[username].active[id];
                        delete todo[username].active[id];
                    } else {
                        todo[username].done = {};
                        todo[username].done[id] = todo[username].active[id];
                        delete todo[username].active[id];
                    }
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send(todo[username]);
                        }
                    });
                } else {
                    res.status(200).send({ error: 'No todo with this id' });
                }
            } else {
                res.status(200).send({ error: 'No todo' });
            }
        }
    });
});

router.get('/apprenticeship/toactive/:id', (req, res) => {
    let username = req.auth.user;
    let fileName = './src/todo/todoApprenticeship.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            if (todo.hasOwnProperty(username)) {
                let id = req.params.id;
                if (todo[username].done.hasOwnProperty(id)) {
                    if (todo[username].hasOwnProperty("active")) {
                        todo[username].active[id] = todo[username].done[id];
                        delete todo[username].done[id];
                    } else {
                        todo[username].active = {};
                        todo[username].active[id] = todo[username].done[id];
                        delete todo[username].done[id];
                    }
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send(todo[username]);
                        }
                    });
                } else {
                    res.status(200).send({ error: 'No todo with this id' });
                }
            } else {
                res.status(200).send({ error: 'No todo' });
            }
        }
    });
});

module.exports = router;