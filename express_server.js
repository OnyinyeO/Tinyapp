// const express = require('express');
// const session = require('cookie-session');
// const { PORT } = require('./config');
// const { loadUsers } = require('./data');
// const routes = require('./routes');

// const app = express();

// app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     name: 'session',
//     keys: [process.env.SESSION_SECRET],
//     maxAge: 24 * 60 * 60 * 1000, // 24 hours
//   })
// );

// // Function to initialize the server
// const initializeServer = async () => {
//   try {
//     // Load users from the file
//     await loadUsers();
//     console.log('Users loaded');

//     app.use('/', routes);

//     app.listen(PORT, () => {
//       console.log(`App listening on port ${PORT}!`);
//     });
//   } catch (error) {
//     console.error('Error initializing server:', error);
//   }
// };

// initializeServer();

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
