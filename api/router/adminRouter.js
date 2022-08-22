const express = require('express');
const { readFile, writeFile } = require('fs');
const router = express.Router();
const authenticateTokenAdmin = require('./modules/authenticateToken').authenticateTokenAdmin;

router.get('/students/', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            res.status(200).send(students);
        }
    })
});

router.get('/students/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            if (students.hasOwnProperty(req.params.id)) {
                res.status(200).send(students[req.params.id]);
            } else {
                res.status(404).send({ error: 'Student not found' });
            }
        }
    })
});

/**
 * change data from student but can't post new student
 */
router.post('/students/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            if (students.hasOwnProperty(req.params.id)) {
                students[req.params.id] = req.body;
                writeFile(fileName, JSON.stringify(students), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(students[req.params.id]);
                    }
                })
            } else {
                res.status(404).send({ error: 'Student not found' });
            }
        }
    })
});

/**
 * Delete a student from json
 */
router.delete('/students/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            if (students.hasOwnProperty(req.params.id)) {
                delete students[req.params.id];
                writeFile(fileName, JSON.stringify(students), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ message: 'Student deleted' });
                    }
                })
            } else {
                res.status(404).send({ success: 'Student not found' });
            }
        }
    })
});

router.post('/students/', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/students.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let students = JSON.parse(data);
            let body = req.body;
            let newStudents = Object.keys(body);
            let allNew = true;
            newStudents.forEach(element => {
                if (students.hasOwnProperty(element)) {
                    res.status(409).send({ error: 'At least one student already exists' });
                    allNew = false;
                }
            });
            if (allNew) {
                newStudents.forEach(element => {
                    students[element] = body[element];
                });
                writeFile(fileName, JSON.stringify(students), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(students);
                    }
                })
            }
        }
    })
});

router.get('/classes/', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            res.status(200).send(classes);
        }
    })
});

router.get('/classes/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            if (classes.hasOwnProperty(req.params.id)) {
                res.status(200).send(classes[req.params.id]);
            } else {
                res.status(404).send({ error: 'Class not found' });
            }
        }
    })
});

router.post('/classes/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            if (classes.hasOwnProperty(req.params.id)) {
                classes[req.params.id] = req.body;
                writeFile(fileName, JSON.stringify(classes), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(classes[req.params.id]);
                    }
                })
            } else {
                res.status(404).send({ error: 'Class not found' });
            }
        }
    })
});

router.delete('/classes/:id', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            if (classes.hasOwnProperty(req.params.id)) {
                delete classes[req.params.id];
                writeFile(fileName, JSON.stringify(classes), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send({ message: 'Class deleted' });
                    }
                })
            } else {
                res.status(404).send({ success: 'Class not found' });
            }
        }
    })
});

router.post('/classes/', authenticateTokenAdmin, (req, res) => {
    let fileName = './src/students/classes.json'
    readFile(fileName, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            let classes = JSON.parse(data);
            let newClasses = req.body;
            let allNew = true;
            Object.keys(newClasses).forEach(element => {
                if (classes.hasOwnProperty(element)) {
                    res.status(409).send({ error: 'At least one class already exists' });
                    allNew = false;
                }
            });
            if (allNew) {
                Object.keys(newClasses).forEach(element => {
                    classes[element] = newClasses[element];
                }
                );
                writeFile(fileName, JSON.stringify(classes), (err) => {
                    if (err) {
                        res.status(500).send({ error: 'Internal server error' });
                    } else {
                        res.status(200).send(classes);
                    }
                })
            }
        }
    })
});

module.exports = router;