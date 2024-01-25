if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express');
const cors = require('cors');
const swaggerDocs = require('./modules/initSwagger');
const swaggerUi = require('swagger-ui-express');
const calendarDl = require('./modules/calendarDl');
require('dotenv').config();
const app = express();
const port = 8080;

const registerRouter = require('./routes/registerRouter');
const validateRouter = require('./routes/validateRouter');
const loginRouter = require('./routes/loginRouter');
const apprenticeshipRouter = require('./routes/apprenticeshipRouter')
const todoRouter = require('./routes/todoRouter');
const studentsRouter = require('./routes/studentsRouter');
const friendsRouter = require('./routes/friendsRouter');
const shareScheduleRouter = require('./routes/shareScheduleRouter');

/* setting ejs as view engine */
/* https://ejs.co/ */
/* use to render the calendar */
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
}));

app.use('/register', registerRouter);
app.use('/validate', validateRouter);
app.use('/login', loginRouter);

app.use('/apprenticeship', apprenticeshipRouter);
app.use('/todo', todoRouter);
app.use('/students', studentsRouter);
app.use('/friends', friendsRouter);
app.use('/partage-edt', shareScheduleRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/* redirects the default url to /docs */
app.get('/', (req, res) => {
    res.redirect('/docs');
});

/* download calendar every time the app is reloaded */
calendarDl.DlCalendar();

/* initialize the cron to download calendars */
calendarDl.initCronDlCalendar();
 
if (typeof(PhusionPassenger) !== 'undefined') {
    app.listen('passenger');
} else {
    app.listen(port);
}

module.exports = app;