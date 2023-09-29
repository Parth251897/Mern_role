const bcrypt = require("bcrypt")


const User = require("../models/user")


async function passwordencrypt(password) {

        let salt = await bcrypt.genSalt(10)
        let passwordHash = bcrypt.hash(password, salt)
        return passwordHash
}

function validatePassword(password) {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&%])[A-Za-z\d@#$&%]{6,16}$/;
  return pattern.test(password);
}


module.exports = {
    passwordencrypt,
    validatePassword

}