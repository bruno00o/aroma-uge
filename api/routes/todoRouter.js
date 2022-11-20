const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;

function getMaxId(todo) {
    let todoActive = todo.active;
    let todoDone = todo.done;
    let ids = Object.keys(todoActive).concat(Object.keys(todoDone));
    if (ids.length === 0) {
        return 0;
    }
    return Math.max(...ids);
}

/**
 * @swagger
 * /todo/apprenticeship:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie la liste des tâches à faire pour l'apprentissage
 *     tags:
 *        - Rappels Apprentissage
 *     responses:
 *        200:
 *          description: Liste envoyée
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
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

/**
 * @swagger
 * /todo/apprenticeship/add:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Ajoute une tâche à faire pour l'apprentissage
 *     tags:
 *        - Rappels Apprentissage
 *     responses:
 *        200:
 *          description: Tâche ajoutée
 *        400:
 *          description: Bad request
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 *     requestBody:
 *       description: Tâche(s) à ajouter
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example: ["Tache 1", "Tache 2"]
 */
router.post('/apprenticeship/add/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/apprenticeship/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            let newTodo = req.body;
            if (newTodo instanceof Array) {
                let todoAdd = {};
                let maxId = 0;
                for (let i = 0; i < newTodo.length; i++) {
                    maxId++;
                    todoAdd[maxId] = newTodo[i];
                }
                todo = { 'active': todoAdd, 'done': {} };
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(400).send({ error: 'Bad request todo must be a list' });
            }
        } else {
            let todo = JSON.parse(data);
            let newTodo = req.body;
            if (newTodo instanceof Array) {
                let todoAdd = todo.active;
                let maxId = getMaxId(todo);
                for (let i = 0; i < newTodo.length; i++) {
                    maxId++;
                    todoAdd[maxId] = newTodo[i];
                }
                todo.active = todoAdd;
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(400).send({ error: 'Bad request todo must be a list' });
            }
        }
    });
});

/**
 * @swagger
 * /apprenticeship/todone/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme faite
 *     tags:
 *        - Rappels Apprentissage
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à marquer comme faite
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche marquée comme faite
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

/**
 * @swagger
 * /apprenticeship/toactive/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme à faire
 *     tags:
 *        - Rappels Apprentissage
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à marquer comme à faire
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche marquée comme à faire
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

/**
 * @swagger
 * /apprenticeship/delete/{id}:
 *  delete:
 *     security:
 *        - accessToken: []
 *     description: Supprime une tâche
 *     tags:
 *        - Rappels Apprentissage
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche supprimée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

/**
 * @swagger
 * /todo/university:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie la liste des tâches à faire pour l'université
 *     tags:
 *        - Rappels Université
 *     responses:
 *        200:
 *          description: Liste envoyée
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
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

/**
 * @swagger
 * /todo/university/add:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Ajoute une tâche à faire pour l'université
 *     tags:
 *        - Rappels Université
 *     responses:
 *        200:
 *          description: Tâche ajoutée
 *        400:
 *          description: Bad request
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 *     requestBody:
 *       description: Tâche(s) à ajouter
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example: ["Tache 1", "Tache 2"]
 */
router.post('/university/add/', authenticateToken, (req, res) => {
    let username = req.user.user;
    username = username.replace('.', '_');
    let fileName = './src/todo/university/' + username + '.json';
    readFile(fileName, (err, data) => {
        if (err) {
            let newTodo = req.body;
            if (newTodo instanceof Array) {
                let todoAdd = {};
                let maxId = 0;
                for (let i = 0; i < newTodo.length; i++) {
                    maxId++;
                    todoAdd[maxId] = newTodo[i];
                }
                todo = { 'active': todoAdd, 'done': {} };
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(400).send({ error: 'Bad request todo must be a list' });
            }
        } else {
            let todo = JSON.parse(data);
            let newTodo = req.body;
            if (newTodo instanceof Array) {
                let todoAdd = todo.active;
                let maxId = getMaxId(todo);
                for (let i = 0; i < newTodo.length; i++) {
                    maxId++;
                    todoAdd[maxId] = newTodo[i];
                }
                todo.active = todoAdd;
                writeFile(fileName, JSON.stringify(todo), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(todo);
                    }
                });
            } else {
                res.status(400).send({ error: 'Bad request todo must be a list' });
            }
        }
    });
});

/**
 * @swagger
 * /university/todone/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme faite
 *     tags:
 *        - Rappels Université
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à marquer comme faite
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche marquée comme faite
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

/**
 * @swagger
 * /university/toactive/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme à faire
 *     tags:
 *        - Rappels Université
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à marquer comme à faire
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche marquée comme à faire
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

/**
 * @swagger
 * /university/delete/{id}:
 *  delete:
 *     security:
 *        - accessToken: []
 *     description: Supprime une tâche
 *     tags:
 *        - Rappels Université
 *     parameters:
 *        - id:
 *          name: id
 *          description: id de la tâche à supprimer
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *        200:
 *          description: Tâche supprimée
 *        401:
 *          description: Token invalide
 *        404:
 *          description: Tâche non trouvée
 *        500:
 *          description: Internal server error
 */
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
                res.status(404).send({ error: 'No todo with this id' });
            }
        }
    });
});

module.exports = router;