const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const https = require('https');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();
const app = express();
const port = 8080;

// Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.3',
        info: {
            title: 'Aroma UGE API',
            description: 'Documentation de l\'API Aroma UGE',
            version: '1.0.0',
            contact: {
                name: 'Support Aroma UGE',
                email: process.env.MAIL_SUPPORT
            },
            servers: [process.env.URL_API]
        },
        components: {
            securitySchemes: {
                accessToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                refreshToken: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
    },
    apis: [
        'index.js',
        "./routes/*.js"
    ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const registerRouter = require('./routes/registerRouter');
const validateRouter = require('./routes/validateRouter');
const loginRouter = require('./routes/loginRouter');
const apprenticeshipRouter = require('./routes/apprenticeshipRouter')
const todoRouter = require('./routes/todoRouter');
const studentsRouter = require('./routes/studentsRouter');
const adminRouter = require('./routes/adminRouter');
const friendsRouter = require('./routes/friendsRouter');


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

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

async function icsToJson(calendarURLs, cal, calendarFolder) {
    return new Promise((resolve, reject) => {
        fs.readFile(calendarFolder + calendarURLs[cal].icsFileName, 'utf8', function (err, data) {
            if (err) {
                error.write(err + ' ' + new Date() + "\n");
                reject(err);
            } else {
                const lines = data.split("\n");
                const events = [];
                let event = {};
                lines.forEach(function (line) {
                    if (line.startsWith("BEGIN:VEVENT")) {
                        event = {};
                    } else if (line.startsWith("END:VEVENT")) {
                        events.push(event);
                    } else if (line.startsWith("DTSTART")) {
                        event.start = line.substring(8).replace("\r", "");
                    } else if (line.startsWith("DTEND")) {
                        event.end = line.substring(6).replace("\r", "");
                    } else if (line.startsWith("SUMMARY")) {
                        event.summary = line.substring(8).replace("\r", "");
                    } else if (line.startsWith("LOCATION")) {
                        event.location = line.substring(9).replace("\r", "");
                    }
                });
                fs.writeFileSync(calendarFolder + calendarURLs[cal].jsonFileName, JSON.stringify(events), function (err) {
                    if (err) {
                        error.write(err + ' ' + new Date() + "\n");
                        reject(err);
                    }
                    resolve();
                });
            }
        });
    });
}

function processIcsData(calendarURLs, cal, calendarFolder) {
    access.write("Downloaded " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
    (async () => await icsToJson(calendarURLs, cal, calendarFolder))().then(() => {
        access.write("Converted " + calendarURLs[cal].icsFileName + " to json at " + new Date() + "\n");
    }).catch((err) => {
        error.write(err + ' ' + new Date() + "\n");
    });
}

async function downloadIcs(calendarURLs, cal, calendarFolder) {
    let url = calendarURLs[cal].url;
    let file = fs.createWriteStream(calendarFolder + calendarURLs[cal].icsFileName);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(processIcsData(calendarURLs, cal, calendarFolder));
            });
        }).on('error', err => {
            error.write("Error while downloading " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
            fs.unlink(calendarFolder + calendarURLs[cal].icsFileName);
            reject(err.message);
        });
    });
}

cron.schedule("0 2 * * * *", function () {
    let fileURLs = "./src/calendar/calendarURLs.json";
    let calendarFolder = "./src/calendar/";
    fs.readFile(fileURLs, (err, data) => {
        if (err) {
            console.log("Error while reading calendarURLs.json");
        } else {
            let calendarURLs = JSON.parse(data);
            for (cal in calendarURLs) {
                (async () => await downloadIcs(calendarURLs, cal, calendarFolder))();
            }
        }
    });
});

app.listen(port);

module.exports = app;