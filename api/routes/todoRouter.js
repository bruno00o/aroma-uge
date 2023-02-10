const express = require('express');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const { isApprentice } = require('./utils/utils');

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
 * /todo/{type}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Renvoie la liste des tâches à faire pour l'apprentissage
 *     tags:
 *        - Rappels
 *     parameters:
 *        - type:
 *          name: type
 *          description: Type de todo (apprentissage, université)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [apprenticeship, university]
 *     responses:
 *        200:
 *          description: Liste envoyée
 *        401:
 *          description: Token invalide
 *        500:
 *          description: Internal server error
 */
router.get('/:type', authenticateToken, async (req, res) => {
    const username = req.user.user.replace('.', '_');
    const type = req.params.type;

    if (type === 'apprenticeship' && !await isApprentice(username.replace('_', '.'))) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }

    const fileName = `./src/todo/${type}/${username}.json`;

    if (!existsSync(fileName)) {
        res.status(200).send({ active: {}, done: {} });
        return;
    }

    const todos = readFileSync(fileName, 'utf8');

    if (!todos) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    res.status(200).send(JSON.parse(todos));
});

/**
 * @swagger
 * /todo/{type}/add:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Ajoute une tâche à faire pour l'apprentissage
 *     tags:
 *        - Rappels
 *     parameters:
 *        - type:
 *          name: type
 *          description: Type de todo (apprentissage, université)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [apprenticeship, university]
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
router.post('/:type/add', authenticateToken, async (req, res) => {
    const username = req.user.user.replace('.', '_');
    const type = req.params.type;
    if (type === 'apprenticeship' && !await isApprentice(username.replace('_', '.'))) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }
    const fileName = `./src/todo/${type}/${username}.json`;
    const newTodo = req.body;
    if (!(newTodo instanceof Array)) {
        res.status(400).send({ error: 'Bad request todo must be a list' });
        return;
    }
    if (!existsSync(fileName)) {
        writeFileSync(fileName, JSON.stringify({ active: {}, done: {} }));
    }
    let todos = readFileSync(fileName, 'utf8');

    if (!todos) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    todos = JSON.parse(todos);
    const todoAdd = todos.active;
    let maxId = getMaxId(todos);
    for (let i = 0; i < newTodo.length; i++) {
        maxId++;
        todoAdd[maxId] = newTodo[i];
    }
    todos.active = todoAdd;
    writeFileSync(fileName, JSON.stringify(todos));

    res.status(200).send(todos);
});

/**
 * @swagger
 * /todo/{type}/todone/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme faite
 *     tags:
 *        - Rappels
 *     parameters:
 *        - type:
 *          name: type
 *          description: Type de todo (apprentissage, université)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [apprenticeship, university]
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
router.post('/:type/todone/:id', authenticateToken, async (req, res) => {
    const username = req.user.user.replace('.', '_');
    const type = req.params.type;
    if (type === 'apprenticeship' && !await isApprentice(username.replace('_', '.'))) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }
    const fileName = `./src/todo/${type}/${username}.json`;
    const id = req.params.id;

    let todos = readFileSync(fileName, 'utf8');

    if (!todos) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    todos = JSON.parse(todos);
    if (!todos.active.hasOwnProperty(id)) {
        res.status(404).send({ error: 'Todo not found' });
        return;
    }
    if (!todos.done) {
        todos.done = {};
    }
    todos.done[id] = todos.active[id];
    delete todos.active[id];

    writeFileSync(fileName, JSON.stringify(todos));

    res.status(200).send(todos);
});

/**
 * @swagger
 * /todo/{type}/toactive/{id}:
 *  post:
 *     security:
 *        - accessToken: []
 *     description: Marque une tâche comme à faire
 *     tags:
 *        - Rappels
 *     parameters:
 *        - type:
 *          name: type
 *          description: Type de todo (apprentissage, université)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [apprenticeship, university]
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
router.post('/:type/toactive/:id', authenticateToken, async (req, res) => {
    const username = req.user.user.replace('.', '_');
    const type = req.params.type;
    if (type === 'apprenticeship' && !await isApprentice(username.replace('_', '.'))) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }
    const fileName = `./src/todo/${type}/${username}.json`;
    const id = req.params.id;

    let todos = readFileSync(fileName, 'utf8');

    if (!todos) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    todos = JSON.parse(todos);

    if (!todos.done.hasOwnProperty(id)) {
        res.status(404).send({ error: 'Todo not found' });
        return;
    }
    if (!todos.active) {
        todos.active = {};
    }
    todos.active[id] = todos.done[id];
    delete todos.done[id];

    writeFileSync(fileName, JSON.stringify(todos));

    res.status(200).send(todos);
});

/**
 * @swagger
 * /todo/{type}/delete/{id}:
 *  delete:
 *     security:
 *        - accessToken: []
 *     description: Supprime une tâche
 *     tags:
 *        - Rappels
 *     parameters:
 *        - type:
 *          name: type
 *          description: Type de todo (apprentissage, université)
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *            enum: [apprenticeship, university]
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
router.delete('/:type/delete/:id', authenticateToken, async (req, res) => {
    const username = req.user.user.replace('.', '_');
    const type = req.params.type;
    const fileName = `./src/todo/${type}/${username}.json`;
    const id = req.params.id;

    let todos = readFileSync(fileName, 'utf8');

    if (!todos) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    todos = JSON.parse(todos);

    if (!todos.active.hasOwnProperty(id) && !todos.done.hasOwnProperty(id)) {
        res.status(404).send({ error: 'Todo not found' });
        return;
    }

    if (todos.active.hasOwnProperty(id)) {
        delete todos.active[id];
    } else if (todos.done.hasOwnProperty(id)) {
        delete todos.done[id];
    } else {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    writeFileSync(fileName, JSON.stringify(todos));

    res.status(200).send(todos);
});

module.exports = router;