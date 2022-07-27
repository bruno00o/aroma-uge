const express = require('express');
const app = express();
const port = 8080;
const registerRouter = require('./router/registerRouter');
const validateRouter = require('./router/validateRouter');
const apprenticeshipRouter = require('./router/apprenticeshipRouter')

app.use(express.json());

app.use('/register', registerRouter);
app.use('/validate', validateRouter);
app.use('/calendar/apprenticeship', apprenticeshipRouter);

app.listen(port);


module.exports = app;