const { assert } = require('chai');

const { checkEmail } = require('../helper.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput)
  });
  it('should return false if we pass it an email that does not exist', function() {
    const user = checkEmail("fakeuser@example.com", testUsers)
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput)
  });
});

