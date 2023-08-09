const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

// User data
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
    urls: [],
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
    urls: [],
  },
};

// Function to generate a random alphanumeric string
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

// Function to get a user by email
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.set('view engine', 'ejs');

// URL database
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route to render the new URL creation form
app.get('/urls/new', (req, res) => {
  res.render('urls_new', { user: users[req.cookies.user_id] });
});

// Root route to render the URLs index page
app.get('/', (req, res) => {
  res.render('urls_index', {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  });
});

// Route to respond with the URL database in JSON format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Route to respond with a "Hello World" message
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Route to render the URLs index page
app.get('/urls', (req, res) => {
  res.render('urls_index', {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  });
});

// Route to show a specific URL
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  res.render('urls_show', { id, longURL, user: users[req.cookies.user_id] });
});

// Route to handle user logout
app.post('/logout', (req, res) => {
  // Delete user's URLs from the database
  const urls = users[req.cookies.user_id]?.urls || [];
  for (let i = 0; i < urls.length; i++) {
    const shortUrl = urls[i];
    shortUrl in urlDatabase && delete urlDatabase[shortUrl];
  }
  // Clear user's cookie and redirect to the homepage
  res.clearCookie('user_id');
  res.redirect('/');
});

// Route to render the registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('register', templateVars);
});

// Route to handle user registration
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  // Validation checks for email and password
  if (email === '' || password === '') {
    res.status(400).send('Email and password cannot be empty');
    return;
  }

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(400).send('Email already exists');
    return;
  }

  // Create a new user and store it in the users database
  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
    urls: [],
  };
  users[userId] = newUser;

  // Set a cookie for the user and redirect to the URLs page
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

// Route to render the login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    invalidLogin: false,
  };
  res.render('login', templateVars);
});

// Route to handle user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists and if the password is correct
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

  // Set a cookie for the user and redirect to the URLs page
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// Route to handle URL deletion
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// Route to handle URL editing
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

// Route to handle URL creation
app.post('/urls', (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  users[req.cookies.user_id]?.urls?.push(shortURL);
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

// Redirect '/' to '/urls' when a user is logged in, and to '/login' when not logged in
app.get('/', (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Return a relevant error message on '/urls' if a user is not logged in
app.get('/urls', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.status(401).send('You need to be logged in to view this page.');
  } else {
    res.render('urls_index', {
      urls: urlDatabase,
      user: user,
    });
  }
});

// Return a message for non-existing short URLs on '/u/:id'
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('This short URL does not exist.');
  }
});

// Allow only the owner to access '/urls/:id' and add checks for URL existence
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];

  if (!user) {
    res.status(401).send('You need to be logged in to view this page.');
  } else if (!longURL) {
    res.status(404).send('This URL does not exist.');
  } else if (user.urls.indexOf(id) === -1) {
    res.status(403).send("You don't have access to this URL.");
  } else {
    res.render('urls_show', { id, longURL, user });
  }
});

// Redirect '/urls/new' to '/login' if the user is not logged in
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', { user });
  }
});

// Prevent non-logged-in users from creating URLs
app.post('/urls', (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.status(401).send('You need to be logged in to create URLs.');
  } else {
    const { longURL } = req.body;
    const shortURL = generateRandomString();
    user.urls.push(shortURL);
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// Prevent non-owners from editing URLs and add checks for URL existence
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];

  if (!user) {
    res.status(401).send('You need to be logged in to edit URLs.');
  } else if (!longURL) {
    res.status(404).send('This URL does not exist.');
  } else if (user.urls.indexOf(id) === -1) {
    res.status(403).send("You don't have access to edit this URL.");
  } else {
    const newLongURL = req.body.longURL;
    urlDatabase[id] = newLongURL;
    res.redirect('/urls');
  }
});

// Prevent non-owners from deleting URLs and add checks for URL existence
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];

  if (!user) {
    res.status(401).send('You need to be logged in to delete URLs.');
  } else if (!longURL) {
    res.status(404).send('This URL does not exist.');
  } else if (user.urls.indexOf(id) === -1) {
    res.status(403).send("You don't have access to delete this URL.");
  } else {
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

// Redirect '/login' and '/register' to '/urls' when a user is logged in
app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user,
      invalidLogin: false,
    };
    res.render('login', templateVars);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user,
    };
    res.render('register', templateVars);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
