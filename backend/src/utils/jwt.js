const jwt = require("jsonwebtoken");
require("dotenv").config();
const { jwt_secretkey,student_secretkey } = process.env;

const options = {
  expiresIn: "24h",
};

async function TokenGenerate({ _id, role }) {
  try {
    const payload = { _id, role };
    const token = await jwt.sign(payload, jwt_secretkey, options);
    return { error: false, token };
  } catch (error) {
    return { error: true };
  }
}

async function TokenGenerateStudent({ _id}) {
  try {
    const payload = { _id};
    const token = await jwt.sign(payload, student_secretkey, options);
    return { error: false, token };
  } catch (error) {
    return { error: true };
  }
}

module.exports =  {TokenGenerate,TokenGenerateStudent};

