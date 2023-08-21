const express = require('express');
const bcrypt = require('bcryptjs');
const { users, saveUsers } = require('./data');
const { generateRandomString, getUserByEmail } = require('./helpers');

const router = express.Router();

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (users[req.session.user_id]) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware to check if user is already logged in
const checkUserLoggedIn = (req, res, next) => {
  if (users[req.session.user_id]) {
    return res.redirect('/urls');
  }
  next();
};

router.use('/urls', requireLogin);
router.use('/urls/:id', requireLogin);
router.use('/login', checkUserLoggedIn);
router.use('/register', checkUserLoggedIn);

// Route to render the new URL creation form
router.get('/urls/new', (req, res) => {
  res.render('urls_new', { user: users?.[req.session?.user_id] });
});

// Root route to render the URLs index page
router.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (users[userId]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Route to handle user logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// Route to render the registration page
router.get('/register', (req, res) => {
  const templateVars = {
    user: users?.[req.session?.user_id],
    message: '',
  };
  res.render('register', templateVars);
});

// Route to handle user registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  // Validation checks for email and password
  if (!email || !password) {
    return res.render('register', {
      message: 'Email and password cannot be empty',
    });
  }

  const userEmail = email.toLowerCase();
  const existingUser = getUserByEmail(userEmail, users);
  if (existingUser) {
    return res.render('register', {
      message: 'Email already exists',
      user: undefined,
    });
  }

  // Create a new user and store it in the users database
  users[userId] = {
    id: userId,
    email: userEmail,
    password: hashedPassword,
    urls: {},
  };

  // Save the updated users object to users.json
  await saveUsers(users);

  // Set a cookie for the user and redirect to the URLs page
  req.session['user_id'] = userId;
  return res.redirect('/urls');
});

// Route to render the login page
router.get('/login', (req, res) => {
  const templateVars = {
    message: '',
    user: undefined,
    invalidLogin: false,
  };
  res.render('login', templateVars);
});

// Route to handle user login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists and if the password is correct
  const user = getUserByEmail(email.toLowerCase(), users);
  if (!user || !user.password) {
    const templateVars = {
      message: 'Invalid email or password',
      user: undefined,
      invalidLogin: true,
    };
    return res.render('login', templateVars);
  }
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    const templateVars = {
      user: users?.[req.session?.user_id],
      message: 'Invalid username or password',
      invalidLogin: true,
    };
    return res.render('login', templateVars);
  }

  // Set a cookie for the user and redirect to the URLs page
  req.session['user_id'] = user.id;
  res.redirect('/urls');
});

// Route to handle URL editing
router.post('/urls/:id/edit', async (req, res) => {
  const user = users[req.session?.user_id];
  if (!user) {
    return res.status(401).send('You are not logged in');
  }
  const shortUrl = req.params.id;
  const longUrl = req.body.longUrl;

  if (user.urls[shortUrl]) {
    user.urls[shortUrl].longUrl = longUrl;
    await saveUsers(users);
  }

  res.redirect('/urls');
});

// Route to handle URL creation
router.post('/urls', async (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  const userId = req.session.user_id;

  if (!users[userId].urls) {
    users[userId].urls = {};
  }

  users[userId].urls[shortURL] = { shortUrl: shortURL, longUrl: longURL };

  // Save users data to users.json file
  await saveUsers(users);

  res.redirect(`/urls`);
});

// Redirect '/' to '/urls' when a user is logged in, and to '/login' when not logged in
router.get('/', (req, res) => {
  const userId = req.session?.user_id;
  if (users?.[userId]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Redirect user to login page if they are not logged in
router.get('/urls', (req, res) => {
  const user = users?.[req.session?.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_index', {
      urls: user.urls,
      user,
    });
  }
});

// Allow only the owner to access '/urls/:id' and add checks for URL existence
router.get('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const user = users?.[req.session?.user_id];

  if (!user) {
    return res.redirect('/login');
  }
  const url = user.urls[shortUrl];
  res.render('urls_show', {
    id: shortUrl,
    shortUrl,
    longUrl: url.longUrl,
    user,
  });
});

// Redirect '/urls/new' to '/login' if the user is not logged in
router.get('/urls/new', (req, res) => {
  const user = users?.[req.session?.user_id];
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', { user });
  }
});

// Prevent non-owners from deleting URLs and add checks for URL existence
router.post('/urls/:id/delete', async (req, res) => {
  const shortUrl = req.params.id;
  const user = users?.[req.session?.user_id];

  if (!user) {
    return res.status(401).send('You need to be logged in to delete URLs.');
  }

  if (user.urls[shortUrl]) {
    delete user.urls[shortUrl];
  }

  await saveUsers(users);
  res.redirect('/urls');
});

// Redirect '/login' and '/register' to '/urls' when a user is logged in
router.get('/login', (req, res) => {
  const user = users?.[req.session?.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user,
      invalidLogin: false,
      message: '',
    };
    res.render('login', templateVars);
  }
});

router.get('/register', (req, res) => {
  const user = users?.[req.session?.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user,
      message: '',
      invalidLogin: false,
    };
    res.render('register', templateVars);
  }
});

module.exports = router;
