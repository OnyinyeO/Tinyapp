const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const generateRandomString = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/urls/new', (req, res) => {
  res.render('urls_new', { user: users[req.cookies.user_id] });
});

app.get('/', (req, res) => {
  res.render('urls_index', {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  res.render('urls_index', {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  });
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  res.render('urls_show', { id, longURL, user: users[req.cookies.user_id] });
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  if (email === '' || password === '') {
    res.status(400).send('Email and password cannot be empty');
    return;
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(400).send('Email already exists');
    return;
  }

  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
  };

  users[userId] = newUser;

  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    invalidLogin: false,
  };
  res.render('login', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email);
  if (!user || !user.password) {
    const templateVars = {
      user: users[req.cookies.user_id],
      invalidLogin: true,
    };
    return res.render('login', templateVars);
  }
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    const templateVars = {
      user: users[req.cookies.user_id],
      invalidLogin: true,
    };
    return res.render('login', templateVars);
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});
