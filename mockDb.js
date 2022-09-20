const _ = require("lodash");

module.exports = function() {
  this.users = [];

  this.getUsers = function() {
    return this.users;
  };

  this.addUser = function(newUser) {
    //createID
    newUser.id = this.users.length + 1;
    this.users.push(newUser);
    console.log("New User Added");
    return;
  };

  this.verifyUser = function(email) {
    const index = _.findIndex(this.users, { email: email });
    if (index == -1) {
      return new Error("User not found");
    } else {
      this.users[index].verified = "Verified";
      return "User Verified";
    }
  };
};
