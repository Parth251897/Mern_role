const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

require("../controllor/UserControllor");

const { jwt_secretkey,student_secretkey } = process.env;

const UserToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({
      status: StatusCodes.FORBIDDEN,
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(authHeader, jwt_secretkey);
    req.decodeduser = decoded;
    
  } catch (error) {
    return res.status(403).json({
      status: StatusCodes.FORBIDDEN,
      message: "Unauthorized:Invalid token",
    });
  }
 
  next();
};

const StudentToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({
      status: StatusCodes.FORBIDDEN,
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(authHeader, student_secretkey);
    req.decodedstudent = decoded;
   
  } catch (error) {
    return res.status(403).json({
      status: StatusCodes.FORBIDDEN,
      message: "Unauthorized:Invalid token",
    });
  }
 
  next();
};


const restrict = (requiredRole) => {
  return (req, res, next) => {
   
    if (req.decodeduser.role !== requiredRole) {
      return res.status(403).json({
        status: StatusCodes.FORBIDDEN,
        message: "You do not have permission",
      });
    }

    next();
  };
};
const blockTokens = new Set();

module.exports = {
  UserToken,
  blockTokens,
  restrict,
  StudentToken
};
