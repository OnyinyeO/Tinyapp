const express = require('express');
const bcrypt = require('bcryptjs');
const { users, saveUsers } = require('./data');
const { generateRandomString, getUserByEmail } = require('./helpers');

const router = express.Router();

// Route to render the new URL creation form
router.get('/urls/new', (req, res) => {
  res.render('urls_new', { user: users?.[req.session?.user_id] });
});

// Root route to render the URLs index page
router.get('/', (req, res) => {
  res.render('urls_index', {
    urls: [],
    user: users?.[req.session?.user_id],
  });
});

// Route to respond with a "Hello World" message
router.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
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
  };
  res.render('register', templateVars);
});

// Route to handle user registration
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  // Validation checks for email and password
  if (email === '' || password === '') {
    res.status(400).send('Email and password cannot be empty');
    return;
  }

  const userEmail = email.toLowerCase();
  const existingUser = getUserByEmail(userEmail);
  if (existingUser) {
    return res.status(400).send('Email already exists');
  }

  // Create a new user and store it in the users database
  const newUser = {
    id: userId,
    email: userEmail,
    password: hashedPassword,
    urls: [],
  };

  users[userId] = newUser;

  // Save the updated users object to users.json
  saveUsers(users);

  // Set a cookie for the user and redirect to the URLs page
  req.session['user_id'] = userId;
  res.redirect('/urls');
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
  const user = getUserByEmail(email.toLowerCase());
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
router.post('/urls/:id/edit', (req, res) => {
  const user = users[req.session?.user_id];
  if (!user) {
    return res.status(401).send('You are not logged in');
  }
  const shortUrl = req.params.id;
  const longUrl = req.body.longURL;

  const url = user.urls.find((x) => x.shortUrl === shortUrl);
  url[shortUrl] = longUrl;
  users[req.session?.user_id].urls = user.urls.filter(
    (x) => x.shortUrl === shortUrl
  );

  users[req.session?.user_id].urls.push(url);

  res.redirect('/urls');
});

// Route to handle URL creation
router.post('/urls', (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  const userId = req.session.user_id;

  if (users?.[userId]?.urls)
    users[userId].urls.push({ shortUrl: shortURL, longUrl: longURL });
  else users[userId] = { urls: [{ shortUrl: shortURL, longUrl: longURL }] };

  // Save users data to users.json file
  saveUsers(users);

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

// Return a relevant error message on '/urls' if a user is not logged in
router.get('/urls', (req, res) => {
  const user = users?.[req.session?.user_id];
  if (!user) {
    res.status(401).send('You need to be logged in to view this page.');
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
    return res.status(401).send('You need to be logged in to view this page.');
  }
  const url = user.urls.find((x) => x.shortUrl === shortUrl);
  res.render('urls_show', {
    id: shortUrl,
    shortUrl,
    longURL: url.longUrl,
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

// router.post('/urls/:id', (req, res) => {
//   const id = req.params.id;
//   const user = users?.[req.session?.user_id];

//   if (!user) {
//    return res.status(401).send('You need to be logged in to edit URLs.');
//   } else if (!longURL) {
//     res.status(404).send('This URL does not exist.');
//   } else if (user.urls.indexOf(id) === -1) {
//     res.status(403).send("You don't have access to edit this URL.");
//   } else {
//     const newLongURL = req.body.longURL;
//     urlDatabase[id] = newLongURL;
//     res.redirect('/urls');
//   }
// });

// Prevent non-owners from deleting URLs and add checks for URL existence
router.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  const user = users?.[req.session?.user_id];

  if (!user) {
    return res.status(401).send('You need to be logged in to delete URLs.');
  }
  users[req.session.user_id].urls = user.urls.filter(
    ({ shortUrl }) => shortUrl !== id
  );
  saveUsers(users);
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
