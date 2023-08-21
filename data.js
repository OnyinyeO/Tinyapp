const fs = require('fs');

let users = {};

const loadUsers = () => {
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (!err && data) {
      users = JSON.parse(data);
    }
  });
};

const saveUsers = (users) => {
  fs.writeFile('users.json', JSON.stringify(users), 'utf8', (err) => {
    if (err) {
      console.error('Error saving users data:', err);
    }
  });
};

module.exports = {
  users,
  loadUsers,
  saveUsers,
};
