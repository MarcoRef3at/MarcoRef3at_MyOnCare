/*
Set Default Password when no password is provided in the request to be
fist letter of first name followed by first letter of last name followed by '.1234'
eg.
    username: john.smith
    password:john.smith@1234

*/

const setDefaultPassword = username => {
  return `${username}@1234`;
};

module.exports = setDefaultPassword;
