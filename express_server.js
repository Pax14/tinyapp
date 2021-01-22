const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const { checkEmail, urlsForUser, generateRandomString } = require('./helper.js')
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'user_id',
  keys: ['lalala'],
  maxAge: 24 * 60 * 60 * 1000 
}))

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
  }
};

app.post("/login", (req, res) => {

  let email = req.body.email;
  let password = req.body.password;
  let check = checkEmail(email, users);

  if (!check) {
    return res.status(403).send('403 Forbidden: Incorrect username and/or password');
  } else {
    if (bcrypt.compareSync(password, users[check].password)) {
      req.session.user_id = check;
      res.redirect('/urls');
    } else {
      res.status(403).send('403 Forbidden: Incorrect username and/or password');
    }
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('400 Bad Request');
  }
  if (checkEmail(req.body.email, users)) {
    return res.status(400).send('400 Bad Request');
  }
  const stringPassword = req.body.password;
  const hash = bcrypt.hashSync(stringPassword, 10);
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: hash
  }
  console.log(newUser);
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  const newURL = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  urlDatabase[short] = newURL;
  // console.log(urlDatabase)
  res.redirect(`/urls/${short}`);
});

// update to make it so only users can edit their own links
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL
  if (id !== urlDatabase[shortURL].userID) {
    return res.status(401).send('Not authorized: This is not your link!');
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
    res.redirect('/urls');
  }
});

// update to make it so only users can delete their own links
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL
  if (id !== urlDatabase[shortURL].userID) {
    return res.status(401).send('Not authorized: This is not your link!');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { 
    user
  };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (!user) {
    const templateVars = {
      urls: {},
      user
    }
    res.render("urls_index", templateVars)
  } else {
    const finalUrls = urlsForUser(id, urlDatabase);
    const templateVars = { 
      urls: finalUrls, 
      user
    };
    res.render("urls_index", templateVars)
  }
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user
  }
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { 
    user
  };

  if (!id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  // console.log(longURL)
  res.redirect(longURL);
});

app.get("*", (req, res) => {
  res.redirect("login")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

