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
            servers: ['http://localhost:8080']
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

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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