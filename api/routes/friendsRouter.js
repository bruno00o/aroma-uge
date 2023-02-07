const express = require('express');
const { writeFileSync } = require('fs');
const router = express.Router();
const authenticateToken = require('./modules/authenticateToken').authenticateToken;
const getTimetable = require('./modules/calendarModule').getTimetable;
const getWeekTimetable = require('./modules/calendarModule').getWeekTimetable;
const getNextClass = require('./modules/calendarModule').getNextClass;
const { getUsers, getStudents, checkUser } = require('./utils/utils.js');

const getFriends = async (user) => {
    const users = await getUsers();
    if (users.hasOwnProperty(user)) {
        return users[user]["friends"];
    }
    return { error: 'Internal server error' };
};

const getFriendsList = async (friends) => {
    const students = await getStudents();
    let friendsList = {};
    for (let i = 0; i < friends.length; i++) {
        if (students.hasOwnProperty(friends[i])) {
            friendsList[friends[i]] = students[friends[i]];
        }
    }
    return friendsList;
};

const checkFriend = async (user, friend) => {
    const users = await getUsers();
    if (users.hasOwnProperty(user)) {
        if (users[user]["friends"].includes(friend)) {
            return true;
        }
    }
    return false;
};

const getSortedFriendsList = async (friendsList) => {
    return Object.entries(friendsList)
        .sort(([, a], [, b]) => a.NOM.localeCompare(b.NOM))
        .reduce((acc, [id, friend]) => {
            acc[id] = friend;
            return acc;
        }, {});
};

const getRequests = async (user) => {
    const users = await getUsers();
    if (users.hasOwnProperty(user)) {
        return users[user]["requests"];
    }
    return { error: 'Internal server error' };
};

const sendRequest = async (user, friend) => {
    const users = await getUsers();
    if (!users.hasOwnProperty(user)) {
        return { error: 'Utilisateur non trouvé', code: 404 };
    }
    if (!users.hasOwnProperty(friend)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    if (users[friend]["requests"].includes(user)) {
        return { error: 'Requête déjà envoyée', code: 400 };
    }
    if (users[user]["requests"].includes(friend)) {
        return { error: 'Requête déjà envoyée', code: 400 };
    }
    if (users[user]["friends"].includes(friend)) {
        return { error: 'Déjà amis', code: 400 };
    }
    if (users[friend]["friends"].includes(user)) {
        return { error: 'Déjà amis', code: 400 };
    }
    if (user == friend) {
        return { error: 'Vous ne pouvez pas vous demandez en ami', code: 400 };
    }
    users[friend]["requests"].push(user);
    writeFileSync('./src/users/users.json', JSON.stringify(users));

    return { success: 'Requête envoyée', code: 200 };
};

const acceptRequest = async (user, friend) => {
    const users = await getUsers();
    if (!users.hasOwnProperty(user)) {
        return { error: 'Utilisateur non trouvé', code: 404 };
    }
    if (!users.hasOwnProperty(friend)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    if (!users[user]["requests"].includes(friend)) {
        return { error: 'Requête non trouvée', code: 404 };
    }
    if (users[user]["friends"].includes(friend)) {
        return { error: 'Déjà amis', code: 400 };
    }
    if (users[friend]["friends"].includes(user)) {
        return { error: 'Déjà amis', code: 400 };
    }
    users[user]["requests"].splice(users[user]["requests"].indexOf(friend), 1);
    users[user]["friends"].push(friend);
    users[friend]["friends"].push(user);
    writeFileSync('./src/users/users.json', JSON.stringify(users));

    return { success: 'Requête acceptée', code: 200 };
};

const declineRequest = async (user, friend) => {
    const users = await getUsers();
    if (!users.hasOwnProperty(user)) {
        return { error: 'Utilisateur non trouvé', code: 404 };
    }
    if (!users.hasOwnProperty(friend)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    if (!users[user]["requests"].includes(friend)) {
        return { error: 'Requête non trouvée', code: 404 };
    }
    users[user]["requests"].splice(users[user]["requests"].indexOf(friend), 1);
    writeFileSync('./src/users/users.json', JSON.stringify(users));

    return { success: 'Requête refusée', code: 200 };
};

const removeFriend = async (user, friend) => {
    const users = await getUsers();
    if (!users.hasOwnProperty(user)) {
        return { error: 'Utilisateur non trouvé', code: 404 };
    }
    if (!users.hasOwnProperty(friend)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    if (!users[user]["friends"].includes(friend)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    if (!users[friend]["friends"].includes(user)) {
        return { error: 'Ami non trouvé', code: 404 };
    }
    users[user]["friends"].splice(users[user]["friends"].indexOf(friend), 1);
    users[friend]["friends"].splice(users[friend]["friends"].indexOf(user), 1);
    writeFileSync('./src/users/users.json', JSON.stringify(users));

    return { success: 'Ami supprimé', code: 200 };
};

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
router.get('/', authenticateToken, async (req, res) => {
    const user = req.user.user;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    const friends = await getFriends(user);
    if (friends.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    const friendsList = await getFriendsList(friends);
    if (friendsList.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    const sortedFriendsList = await getSortedFriendsList(friendsList);
    if (sortedFriendsList.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    res.status(200).send(sortedFriendsList);
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
router.get('/requests/', authenticateToken, async (req, res) => {
    const user = req.user.user;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    const requests = await getRequests(user);
    if (requests.error) {
        res.status(500).send({ error: 'Internal server error' });
        return;
    }
    res.status(200).send(requests);
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
router.post('/request/:username', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.username;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        console.log('Utilisateur non trouvé');
        return;
    }
    const request = await sendRequest(user, friend);
    if (request.error) {
        res.status(request.code).send({ error: request.error });
        return;
    }
    res.status(200).send({ message: request.success });
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
router.post('/accept/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    const accept = await acceptRequest(user, friend);
    if (accept.error) {
        res.status(accept.code).send({ error: accept.error });
        return;
    }
    res.status(200).send({ message: accept.success });
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
router.post('/decline/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    const decline = await declineRequest(user, friend);
    if (decline.error) {
        res.status(decline.code).send({ error: decline.error });
        return;
    }
    res.status(200).send({ message: decline.success });
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
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    const deleted = await removeFriend(user, friend);
    if (deleted.error) {
        res.status(deleted.code).send({ error: deleted.error });
        return;
    }
    res.status(200).send({ message: deleted.success });
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
router.get('/timetable/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkFriend(user, friend)) {
        res.status(404).send({ error: 'Ami non trouvé' });
        return;
    }
    const timetable = await getTimetable(friend);
    if (timetable.error) {
        res.status(timetable.code).send({ error: timetable.error });
        return;
    }
    res.status(200).send(timetable);
});

/**
 * @swagger
 * /friends/next-class/{username}:
 *  get:
 *     security:
 *        - accessToken: []
 *     description: Récupère le prochain cours d'un ami
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
router.get('/next-class/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkFriend(user, friend)) {
        res.status(404).send({ error: 'Ami non trouvé' });
        return;
    }
    const nextClass = await getNextClass(friend);
    if (nextClass.error) {
        res.status(nextClass.code).send({ error: nextClass.error });
        return;
    }
    res.status(200).send(nextClass);
});

const checkDate = (date) => {
    const regex = new RegExp('^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\\d\\d$');
    return regex.test(date);
};

/**
 * @swagger
 * /friends/week-timetable/{date}/{username}:
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
router.get('/week-timetable/:date/:id', authenticateToken, async (req, res) => {
    const user = req.user.user;
    const friend = req.params.id;
    let date = req.params.date;
    if (!await checkUser(user)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!await checkUser(friend)) {
        res.status(404).send({ error: 'Utilisateur non trouvé' });
        return;
    }
    if (!checkDate(date)) {
        res.status(400).send({ error: 'Date invalide' });
        return;
    }
    if (!await checkFriend(user, friend)) {
        res.status(404).send({ error: 'Ami non trouvé' });
        return;
    }
    date = date.split('-');
    date = new Date(date[2], date[1] - 1, date[0]);
    const weekTimetable = await getWeekTimetable(friend, date);
    if (weekTimetable.error) {
        res.status(weekTimetable.code).send({ error: weekTimetable.error });
        return;
    }
    res.status(200).send(weekTimetable);
});

module.exports = router;