const fs = require('fs').promises;

let users = {};

const loadUsers = async () => {
  try {
    const data = await fs.readFile('users.json', 'utf8');
    users = JSON.parse(data);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // 'ENOENT' is error when the file doesn't exist. We don't want to log that as an error.
      console.error('Error reading users data:', err);
    }
  }
};

const saveUsers = async (usersToSave) => {
  try {
    await fs.writeFile('users.json', JSON.stringify(usersToSave), 'utf8');
  } catch (err) {
    console.error('Error saving users data:', err);
  }
};

module.exports = {
  users,
  loadUsers,
  saveUsers,
};
