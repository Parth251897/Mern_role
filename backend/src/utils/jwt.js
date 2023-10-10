const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid'); 
require("dotenv").config();
const { jwt_secretkey, student_secretkey, refresh_token_secretkey } = process.env;

const accessTokenOptions = {
  expiresIn: "30m",
};

const refreshTokenOptions = {
  expiresIn: "7d", 
};

async function TokenGenerate({ _id, role }) {
  try {
    const payload = { _id, role };
    const accessToken = await jwt.sign(payload, jwt_secretkey, accessTokenOptions);
    const refreshTokenId = uuidv4(); 
    const refreshToken = await jwt.sign({ refreshTokenId }, refresh_token_secretkey, refreshTokenOptions);
    return { error: false, accessToken, refreshToken };
  } catch (error) {
    return { error: true };
  }
}

async function TokenGenerateStudent({ _id }) {
  try {
    const payload = { _id };
    const accessToken = await jwt.sign(payload, student_secretkey, accessTokenOptions);
    const refreshTokenId = uuidv4(); 
    const refreshToken = await jwt.sign({ refreshTokenId }, refresh_token_secretkey, refreshTokenOptions);
    return { error: false, accessToken, refreshToken };
  } catch (error) {
    return { error: true };
  }
}

module.exports = { TokenGenerate, TokenGenerateStudent };
