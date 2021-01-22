// checking if email exists, returns the ID if it does.
const checkEmail = function check(email, users) {
  for (let user in users) {
    if (users[user].email === email){
      return users[user].id;
    }
  }
  return false;
};

// filtering URLs based on User ID to create a new object
const urlsForUser = function(id, urlDatabase) {
  let final = {};
  for (let i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      final[i] = urlDatabase[i];
    }
  }
  return final;
};

// generate random user id on register as well as random shortURL
const generateRandomString = () => {
  let final = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxzy';
  for (let i = 0; i < 6; i++) {
    final += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return final;
};

module.exports = {
  checkEmail,
  urlsForUser,
  generateRandomString
}