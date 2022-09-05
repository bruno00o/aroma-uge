const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const https = require('https');
const ical = require('node-ical');
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

// cron.schedule("*/10 * * * * *", function() {
//     let url = "";
//     let file = fs.createWriteStream("calendar.ics");
//     let request = https.get(url, function(response) {
//         console.log("Downloading calendar...");
//         response.pipe(file);
//         file.on('finish', function() {
//             file.close();
//             console.log("Calendar downloaded.");
//         });
//     }).on('error', function(err) {
//         console.log("Error while downloading calendar.");
//         fs.unlink(dest);
//     });
// });

cron.schedule("*/10 * * * * *", function() {
    let url = "";
    ical.async.fromURL(url).then(function(calendar) {
        console.log("Downloading calendar...");
        let calendarObject = {};
        for (let key in calendar) {
            if (calendar.hasOwnProperty(key)) {
                let event = calendar[key];
                if (event.type === 'VEVENT') {
                    let date = new Date(event.start);
                    let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
                    let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
                    let year = date.getFullYear();
                    let dateString = day + '/' + month + '/' + year;
                    calendarObject[dateString] = event.summary;
                }
            }
        }
        fs.writeFile('calendar.json', JSON.stringify(calendarObject), function(err) {
            if (err) {
                console.log("Error while downloading calendar.");
            } else {
                console.log("Calendar downloaded.");
            }
        });
    });
});


app.listen(port);

module.exports = app;