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
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const generateRandomString = (length) => {
  let randomString = '';
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < length; i++) {
    const random = Math.trunc(Math.random() * charset.length);
    randomString += charset.charAt(random);
  }
  return randomString;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls', (req, res) => {
  const url = { urls: urlDatabase };
  res.render('urls_index', url);
});

app.get('/urls/:urlId', (req, res) => {
  const longURLs = urlDatabase[req.params.urlId];
  const templateVars = { id: req.params.urlId, longURL: longURLs };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  const id = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[`${id}`] = longURL;
  res.redirect(`/urls/${id}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
