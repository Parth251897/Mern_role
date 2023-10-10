const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const User = require("../models/user");
const { TokenGenerate } = require("../utils/jwt");
const { blockTokens } = require("../middleware/Auth");
const MessageRespons = require("../utils/MessageRespons.json");
const {
  passwordencrypt,
  validatePassword,
} = require("../services/CommonServices");
const uploadFile = require("../middleware/Upload");
const path = require("path");

//register signup
exports.Register = async (req, res) => {
  try {
    let { name, email, phone, password, profile, document, role } = req.body;

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
          document: req.document,
          created,
        });

        user.save().then((data, err) => {
          if (err) {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: MessageRespons.bad_request,
            });
          } else {
            return res.status(201).json({
              status: StatusCodes.CREATED,
              message: MessageRespons.created,
              UserData: data,
            });
          }
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

//login
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

    const { error, accessToken,refreshToken } = await TokenGenerate({ _id: userLogin._id, role });

    if (error) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: MessageRespons.notcreatetoken,
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        success: true,
        accesstoken: accessToken,
        refreshToken:refreshToken,
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

//findbyid
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

//update
exports.UserUpdate = async (req, res) => {
  try {
    let { email, phone } = req.body;
    const { _id } = req.decodeduser;

    const Email = email ? email.toLowerCase() : undefined;

    const checkemail = await User.findOne({
      email,
      _id: { $ne: req.decodeduser },
    });
    const checkphone = await User.findOne({
      phone,
      _id: { $ne: req.decodeduser },
    });

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

      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User Credential Invalied",
        });
      } else {
        let user = {
          email: Email,
          phone,

          created,
        };

        const UserUpdate = await User.findByIdAndUpdate(
          { _id },
          { $set: user },
          { new: true }
        );

        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: "data updated",
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

//deactive or softdelete
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

//logout
exports.logout = async (req, res) => {
  const token = req.headers.authorization;

  blockTokens.add(token);

  return res.status(200).json({
    status: StatusCodes.OK,
    message: MessageRespons.logout,
  });
};

//find all
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
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MessageRespons.internal_server_error,
    });
  }
};

//change or update password
exports.UserPasswordChange = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword || !currentPassword) {
    return res.status(403).json({
      status: 403,
      error: true,
      message: MessageRespons.EMPTYFIELDS,
    });
  } else if (!validatePassword(newPassword)) {
    return res.status(400).json({
      status: 400,
      message: MessageRespons.PASSWORDFORMAT,
    });
  } else {
    try {
      const user = await User.findOne({ _id: req.decodeduser });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: MessageRespons.NOTFOUND,
        });
      } else {
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
          return res.status(400).json({
            status: 400,
            message: MessageRespons.INCORRECT,
          });
        } else {
          const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
          );

          if (isSamePassword) {
            return res.status(400).json({
              status: 400,
              message: MessageRespons.NEWDIFFERENTOLD,
            });
          } else {
            if (newPassword !== confirmPassword) {
              return res.status(400).json({
                status: 400,
                message: MessageRespons.NEWCOMMATCH,
              });
            } else {
              const hashedPassword = await passwordencrypt(
                newPassword,
                user.password
              );
              const UpdateUser = await User.findByIdAndUpdate(
                { _id: user._id },
                { $set: { password: hashedPassword } },
                { new: true }
              );
            }
            return res.status(201).json({
              status: 201,
              message: MessageRespons.PSSWORDCHANGESUCC,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(304).json({
        status: 304,
        message: MessageRespons.NOTCHANGE,
      });
    }
  }
};

//document update
exports.updatedocument = async (req, res) => {
  try {
    const { _id } = req.decodeduser;
    const { document } = req;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user.documentPaths && user.documentPaths.length > 0) {
      user.documentPaths.push(user.document);
    }

    user.document = document[0];

    await user.save();

    res.status(200).json({
      status: 200,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
