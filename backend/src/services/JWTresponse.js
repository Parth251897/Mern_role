const responseMessage = require("../../src/utils/MessageRespons.json");
const { jwt_secretkey } = process.env;

const jwtResponse = async function jwtResponse() {
  try {
    jwt.verify(token, jwt_secretkey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "not access",
        });
      }
    });
    console.log("ssecure");
  } catch (error) {
    console.log("Error encrypting password:", error);
    throw error;
  }
};
module.exports = jwtResponse;
