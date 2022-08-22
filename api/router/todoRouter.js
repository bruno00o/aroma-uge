const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

router.get('/apprenticeship/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    });
});

router.post('/apprenticeship/add/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            let newTodo = req.body;
            todo = { 'active': newTodo };
            writeFile(fileName, JSON.stringify(todo), (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: 'Internal server error' });
                } else {
                    res.status(200).send({ success: 'Todo added' });
                }
            });
        } else {
            let todo = JSON.parse(data);
            let keys = Object.keys(todo);
            let ids = [];
            for (let i = 0; i < keys.length; i++) {
                let idsKeys = Object.keys(todo[keys[i]]);
                for (let j = 0; j < idsKeys.length; j++) {
                    ids.push(idsKeys[j]);
                }
            }
            let newTodo = req.body;
            let id = Object.keys(newTodo)[0];
            if (ids.includes(id)) {
                res.status(400).send({ error: 'Id already used' });
            } else {
                if (todo.hasOwnProperty("active")) {
                    todo.active[id] = newTodo[id];
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send({ success: 'Todo added' });
                        }
                    });
                } else {
                    let newTodo = req.body;
                    todo.active = newTodo;
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send({ success: 'Todo added' });
                        }
                    });
                }
            }
        }
    });
});

router.get('/apprenticeship/maxid/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let keys = Object.keys(todo);
            let maxId = 0;
            for (let i = 0; i < keys.length; i++) {
                let ids = Object.keys(todo[keys[i]]);
                for (let j = 0; j < ids.length; j++) {
                    if (ids[j] > maxId) {
                        maxId = ids[j];
                    }
                }
            }
            res.status(200).send({ maxId: maxId });
        }
    });
});

router.post('/apprenticeship/todone/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.active.hasOwnProperty(id)) {
                if (todo.hasOwnProperty("done")) {
                    todo.done[id] = todo.active[id];
                    delete todo.active[id];
                } else {
                    todo.done = {};
                    todo.done[id] = todo.active[id];
                    delete todo.active[id];
                }
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

router.post('/apprenticeship/toactive/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.done.hasOwnProperty(id)) {
                if (todo.hasOwnProperty("active")) {
                    todo.active[id] = todo.done[id];
                    delete todo.done[id];
                } else {
                    todo.active = {};
                    todo.active[id] = todo.done[id];
                    delete todo.done[id];
                }
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

router.delete('/apprenticeship/delete/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.active.hasOwnProperty(id)) {
                delete todo.active[id];
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ success: 'Todo deleted' });
                    }
                });
            } else if (todo.done.hasOwnProperty(id)) {
                delete todo.done[id];
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ success: 'Todo deleted' });
                    }
                });
            }
            else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

router.get('/university/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(200).send(JSON.parse(data));
        }
    });
});

router.post('/university/add/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            let newTodo = req.body;
            todo = { 'active': newTodo };
            writeFile(fileName, JSON.stringify(todo), (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: 'Internal server error' });
                } else {
                    res.status(200).send({ success: 'Todo added' });
                }
            });
        } else {
            let todo = JSON.parse(data);
            let keys = Object.keys(todo);
            let ids = [];
            for (let i = 0; i < keys.length; i++) {
                let idsKeys = Object.keys(todo[keys[i]]);
                for (let j = 0; j < idsKeys.length; j++) {
                    ids.push(idsKeys[j]);
                }
            }
            let newTodo = req.body;
            let id = Object.keys(newTodo)[0];
            if (ids.includes(id)) {
                res.status(400).send({ error: 'Id already used' });
            } else {
                if (todo.hasOwnProperty("active")) {
                    todo.active[id] = newTodo[id];
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send({ success: 'Todo added' });
                        }
                    });
                } else {
                    let newTodo = req.body;
                    todo.active = newTodo;
                    writeFile(fileName, JSON.stringify(todo), (err) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ error: 'Internal server error' });
                        } else {
                            res.status(200).send({ success: 'Todo added' });
                        }
                    });
                }
            }
        }
    });
});

router.get('/university/maxid/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let keys = Object.keys(todo);
            let maxId = 0;
            for (let i = 0; i < keys.length; i++) {
                let ids = Object.keys(todo[keys[i]]);
                for (let j = 0; j < ids.length; j++) {
                    if (ids[j] > maxId) {
                        maxId = ids[j];
                    }
                }
            }
            res.status(200).send({ maxId: maxId });
        }
    });
});

router.post('/university/todone/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.active.hasOwnProperty(id)) {
                if (todo.hasOwnProperty("done")) {
                    todo.done[id] = todo.active[id];
                    delete todo.active[id];
                } else {
                    todo.done = {};
                    todo.done[id] = todo.active[id];
                    delete todo.active[id];
                }
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

router.post('/university/toactive/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.done.hasOwnProperty(id)) {
                if (todo.hasOwnProperty("active")) {
                    todo.active[id] = todo.done[id];
                    delete todo.done[id];
                } else {
                    todo.active = {};
                    todo.active[id] = todo.done[id];
                    delete todo.done[id];
                }
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

router.delete('/university/delete/:id/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let todo = JSON.parse(data);
            let id = req.params.id;
            if (todo.active.hasOwnProperty(id)) {
                delete todo.active[id];
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ success: 'Todo deleted' });
                    }
                });
            } else if (todo.done.hasOwnProperty(id)) {
                delete todo.done[id];
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ success: 'Todo deleted' });
                    }
                });
            }
            else {
                res.status(200).send({ error: 'No todo with this id' });
            }
        }
    });
});

module.exports = router;