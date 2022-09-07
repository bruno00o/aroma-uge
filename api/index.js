const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const https = require('https');
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

var access = fs.createWriteStream('./access.log', { flags: 'a' })
    , error = fs.createWriteStream('./error.log', { flags: 'a' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
}));

app.use('/register', registerRouter);
app.use('/validate', validateRouter);
app.use('/login', loginRouter);

app.use('/calendar/apprenticeship', apprenticeshipRouter);
app.use('/todo', todoRouter);
app.use('/students', studentsRouter);
app.use('/admin', adminRouter);
app.use('/friends', friendsRouter);

cron.schedule("0 2 * * * * ", function () {
    let fileURLs = "./src/calendar/calendarURLs.json";
    let calendarFolder = "./src/calendar/";
    fs.readFile(fileURLs, (err, data) => {
        if (err) {
            console.log("Error while reading calendarURLs.json");
        } else {
            let calendarURLs = JSON.parse(data);
            let calendars = {};
            for (cal in calendarURLs) {
                let url = calendarURLs[cal].url;
                let file = fs.createWriteStream(calendarFolder + calendarURLs[cal].icsFileName);
                let request = https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close();
                        access.write("Downloaded " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
                    });
                }).on('error', function (err) {
                    error.write("Error while downloading " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
                    fs.unlink(dest);
                });
            }
        }
    });
});

app.listen(port);

module.exports = app;