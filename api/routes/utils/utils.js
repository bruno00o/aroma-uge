const { readFileSync } = require('fs');

const getStudents = async () => {
    const file = './src/students/students.json';
    const students = readFileSync(file, 'utf8');
    if (students) {
        return JSON.parse(students);
    }
    return { error: 'Internal server error', code: 500 };
};

const getUsers = async () => {
    const file = './src/users/users.json';
    const users = readFileSync(file, 'utf8');
    if (users) {
        return JSON.parse(users);
    }
    return { error: 'Internal server error' };
};

const checkUser = async (user) => {
    const users = await getUsers();
    if (users.hasOwnProperty(user)) {
        return true;
    }
    return false;
};

module.exports = {
    getStudents,
    getUsers,
    checkUser
};