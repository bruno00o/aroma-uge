const jwt = require('jsonwebtoken');
require('dotenv').config();
const { readFileSync } = require('fs');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
}

exports.authenticateTokenAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(401);
        }
        try {
            const data = readFileSync('./src/users/admin.json');
            const admins = JSON.parse(data);
            if (admins.indexOf(user.user) !== -1) {
                req.user = user;
                next();
                return;
            }
            return res.sendStatus(401);
        } catch (err) {
            return res.sendStatus(401);
        }
    });
}