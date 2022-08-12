const express = require('express');
const app = express();
const port = 8080;
const registerRouter = require('./router/registerRouter');
const validateRouter = require('./router/validateRouter');
const loginRouter = require('./router/loginRouter');
const apprenticeshipRouter = require('./router/apprenticeshipRouter')
const todoRouter = require('./router/todoRouter');
const studentsRouter = require('./router/studentsRouter');
const adminRouter = require('./router/adminRouter');
const friendsRouter = require('./router/friendsRouter');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());

app.use('/register', registerRouter);
app.use('/validate', validateRouter);
app.use('/login', loginRouter);
app.use('/calendar/apprenticeship', apprenticeshipRouter);
app.use('/todo', todoRouter);
app.use('/students', studentsRouter);
app.use('/admin', adminRouter);
app.use('/friends', friendsRouter);

app.listen(port);


module.exports = app;