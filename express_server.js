const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const checkEmail = function check(email) {
  for (let user in users) {
    if (users[user].email === email){
      return users[user].id;
    }
  }
  return false;
 }

function generateRandomString() {
  let final = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxzy';
  for (let i = 0; i < 6; i++) {
    final += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return final;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let check = checkEmail(email);

  if (!check) {
    return res.status(403).send('403 Forbidden');
  } else {
    if (password !== users[check].password){
      return res.status(403).send('403 Forbidden');
    } else {
      res.cookie("user_id", check);
      res.redirect('/urls');
    }
  }
});

app.post("/register", (req, res) => {
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  }
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('400 Bad Request');
  }
  if (checkEmail(req.body.email)) {
    return res.status(400).send('400 Bad Request');
  }
  users[newUser.id] = newUser;
  res.cookie("user_id", newUser.id);
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  const newURL = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  urlDatabase[short] = newURL;
  console.log(urlDatabase)
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id)
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    user
  };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase, 
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    user
  }
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
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
  const id = req.cookies["user_id"];
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
  console.log(longURL)
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// semi useless stuff atm

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

