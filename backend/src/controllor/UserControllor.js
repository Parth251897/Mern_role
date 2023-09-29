const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { StatusCodes } = require("http-status-codes");

const User = require("../models/user");
const  {TokenGenerate}  = require("../utils/jwt");
const { blockTokens } = require("../middleware/Auth");
const MessageRespons = require("../utils/MessageRespons.json");

const {
  passwordencrypt,
  validatePassword,
} = require("../services/CommonServices");

exports.Register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        status: StatusCodes.PRECONDITION_REQUIRED,
        message: MessageRespons.required,
      });
    } else if (!validatePassword(password)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: MessageRespons.passwordvalidate,
      });
    } else {
      const checkemail = await User.findOne({ email });
      const checkphone = await User.findOne({ phone });

      if (checkemail || checkphone) {
        const message = checkemail
          ? MessageRespons.checkemail
          : MessageRespons.checkphone;

        res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message,
        });
      } else {
        password = await passwordencrypt(password);
        created = moment(Date.now()).format("LLL");
        let user = new User({
          name,
          email,
          phone,
          password,
          role,
          created,
        });

        user
          .save()
          .then((data) => {
            return res.status(201).json({
              status: StatusCodes.CREATED,
              message: MessageRespons.created,
              UserData: data,
            });
          })
          .catch((err) => {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: MessageRespons.bad_request,
            });
          });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: MessageRespons.internal_server_error,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { password, MasterField, role } = req.body;

   
    const userLogin = await User.findOne({
      $or: [
        { email: MasterField },
        { name: MasterField },
        { phone: MasterField },
      ],
    });

    
    if (!userLogin) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: MessageRespons.login,
      });
    }

  
    if (userLogin.isActivated) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: MessageRespons.isdeleted,
      });
    }

    
    if (userLogin.role !== role) {
      return res.status(403).json({
        status: StatusCodes.FORBIDDEN,
        message: "Please make sure you are logging in from the right portal.",
      });
    }

   
    const isvalid = await bcrypt.compare(password, userLogin.password);


    if (!isvalid) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: MessageRespons.notmatch,
      });
    }

    const { error, token } = await TokenGenerate({ _id: userLogin._id, role });

    if (error) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: MessageRespons.notcreatetoken,
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        success: true,
        accesstoken: token,
        message: MessageRespons.loginsuccess,
      });
    }
  } catch (error) {
    console.error(error); 
    return res.status(401).json({
      status: 401,
      message: MessageRespons.notsuccess,
    });
  }
};

exports.userfind = async (req, res) => {
  try {
   const token = req.headers.authorization;

    if (blockTokens.has(token)) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: "User logged out.",
      });
    } else {
      const userfind = await User.find({ _id: req.decodeduser });
     
      if (!userfind) {
        return res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: MessageRespons.login,
        });
      } else if (userfind.isActivated) {
        return res.status(403).json({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied. User has been deleted ",
        });
      } else {
        res.status(200).json({
          status: StatusCodes.OK,
          userfind,
          message: "User Credential Found ",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MessageRespons.internal_server_error,
    });
  }
};

exports.UserUpdate = async (req, res) => {
  try {
    let { email, phone } = req.body;


    const checkemail = await User.findOne({ email });
    const checkphone = await User.findOne({ phone });

    if (checkemail || checkphone) {
      const message = checkemail
        ? MessageRespons.checkemail
        : MessageRespons.checkphone;

      res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message,
      });
    } else {
      created = moment(Date.now()).format("LLL");

      const user = await User.findById({ _id: req.decodeduser });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User Credential Invalied",
        });
      } else {
        let user = {
          email,
          phone,
          created,
        };

        const UserUpdate = await User.findByIdAndUpdate(
          { _id: req.decodeduser },
          { $set: user },
          { new: true }
        );

        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: MessageRespons.created,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: MessageRespons.internal_server_error,
    });
  }
};

exports.UserDelete = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.decodeduser },
      { $set: { isActivated: true } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: "User not found",
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        user,
        message: "User Delete Successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: MessageRespons.internal_server_error,
    });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization;

 blockTokens.add(token);

  return res.status(200).json({
    status: StatusCodes.OK,
    message: MessageRespons.logout,
  });
};

exports.alluserfind = async (req, res) => {
  try {
   const token = req.headers.authorization;

    if (blockTokens.has(token)) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: "User logged out.",
      });
    } else {
      const userfind = await User.find({});
     
     
        res.status(200).json({
          status: StatusCodes.OK,
          userfind,
          message: "User  Found ",
        });
      }
    }
  catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MessageRespons.internal_server_error,
    });
  }
};