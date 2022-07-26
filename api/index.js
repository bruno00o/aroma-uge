const express = require('express');
const app = express();
const port = 8080;
const calendarRouter = require('./router/calendarRouter')

app.use(express.json());

app.use('/calendar', calendarRouter);



app.listen(port);


module.exports = app;