const cron = require('node-cron');
const fs = require('fs');
const https = require('https');

/* log files */
var access = fs.createWriteStream('./access.log', { flags: 'a' })
    , error = fs.createWriteStream('./error.log', { flags: 'a' });

/**
 * Create the events array from the ics file
 * @param {*} icsLines 
 * @returns 
 */
const createEvents = (icsLines) => {
    let events = [];
    let event = {};
    icsLines.forEach(function (line) {
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
        } else if (line.startsWith("DESCRIPTION")) {
            let array = (line.substring(12).replace("\r", "")).split("\\n");
            let description = array[array.length - 2];
            if (description.includes("Exported")) {
                description = "";
            }
            event.description = description;
        }
    });
    return events;
}

/**
 * Convert the ics file to json
 * @param {*} calendarURLs 
 * @param {*} cal 
 * @param {*} calendarFolder 
 * @returns 
 */
const icsToJson = async (calendarURLs, cal, calendarFolder) => {
    return new Promise((resolve, reject) => {
        fs.readFile(calendarFolder + "ics/" + calendarURLs[cal].icsFileName, 'utf8', function (err, data) {
            if (err) {
                error.write(err + ' ' + new Date() + "\n");
                reject(err);
            } else {
                const lines = data.split("\n");
                const events = createEvents(lines);
                fs.writeFileSync(calendarFolder + "json/" + calendarURLs[cal].jsonFileName, JSON.stringify(events), function (err) {
                    if (err) {
                        error.write(err + ' ' + new Date() + "\n");
                        reject(err);
                    }
                });
                /* if it is monday copy the file */
                let mondayFileName = calendarFolder + "monday/" + calendarURLs[cal].jsonFileName.replace(".json", "_monday.json");
                let fileExists = fs.existsSync(mondayFileName);
                if (new Date().getDay() == 1 || !fileExists) {
                    fs.writeFileSync(mondayFileName, JSON.stringify(events), function (err) {
                        if (err) {
                            error.write(err + ' ' + new Date() + "\n");
                            reject(err);
                        }
                    });
                }
                resolve();
            }
        });
    });
}

/**
 * Call the icsToJson function and log the result
 * @param {*} calendarURLs 
 * @param {*} cal 
 * @param {*} calendarFolder 
 */
const processIcsData = (calendarURLs, cal, calendarFolder) => {
    access.write("Downloaded " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
    (async () => await icsToJson(calendarURLs, cal, calendarFolder))().then(() => {
        access.write("Converted " + calendarURLs[cal].icsFileName + " to json at " + new Date() + "\n");
    }).catch((err) => {
        error.write(err + ' ' + new Date() + "\n");
    });
}

/**
 * Download the ics file
 * @param {*} calendarURLs 
 * @param {*} cal 
 * @param {*} calendarFolder 
 * @returns Promise
 */
const downloadIcs = async (calendarURLs, cal, calendarFolder) => {
    const url = calendarURLs[cal].url;
    const file = fs.createWriteStream(calendarFolder + 'ics/' + calendarURLs[cal].icsFileName);
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

/**
 * Define the cron job to download the calendars
 */
exports.initCronDlCalendar = function () {
    cron.schedule("0 0 */3 * * *", function () {
        const fileURLs = "./src/calendar/calendarURLs.json";
        const calendarFolder = "./src/calendar/";
        const file = fs.readFileSync(fileURLs, 'utf8');
        if (file) {
            const calendarURLs = JSON.parse(file);
            for (const cal in calendarURLs) {
                (async () => await downloadIcs(calendarURLs, cal, calendarFolder))().then(() => {
                    access.write("Downloaded " + calendarURLs[cal].icsFileName + " at " + new Date() + "\n");
                }).catch((err) => {
                    error.write(err + ' ' + new Date() + "\n");
                });
            }
        } else {
            error.write("Error while reading " + fileURLs + " at " + new Date() + "\n");
        }
    });

}