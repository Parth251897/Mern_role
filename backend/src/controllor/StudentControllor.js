const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { StatusCodes } = require("http-status-codes");
const Student = require("../models/Student");
const {
  passwordencrypt,
  validatePassword,
} = require("../services/CommonServices");
const MessageRespons = require("../utils/MessageRespons.json");
const { TokenGenerateStudent } = require("../utils/jwt");
const { blockTokens ,StudentToken} = require("../middleware/Auth");

exports.StudentRegister = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (blockTokens.has(token)) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: "Admin logged out.",
      });
    }
    let StudentData = req.body;
    let {
      StudentName,
      Gender,
      Category,
      email,
      password,
      Phone,
      Address,
      CourseName,
      BranchName,
      Class,
    } = req.body;

   
    if (!StudentName || !email || !Phone) {
      return res.status(400).json({
        status: 400,
        message: "StudentName, email, and PhoneNumber are required fields.",
      });
    } else if (!validatePassword(StudentData.password)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: MessageRespons.passwordvalidate,
      });
    } else {
      const checkemail = await Student.findOne({ email });
      const checkPhone = await Student.findOne({ Phone });

      if (checkemail || checkPhone) {
        const message = checkemail
          ? "email already exists."
          : "Phone number already exists.";

        return res.status(400).json({
          status: 400,
          message,
        });
      } else {
        password = await passwordencrypt(password);
        created = moment(Date.now()).format("LLL");
        const student = new Student({
          StudentName: {
            FirstName: StudentName.FirstName,
            LastName: StudentName.LastName,
          },
          Gender,
          Category,
          password,
          email,
          Phone,
          Address: {
            Address_Line_1: Address.Address_Line_1,
            City: Address.City,
            State: Address.State,
            PostalCode: Address.PostalCode,
            Country: Address.Country,
          },
          CourseName,
          BranchName,
          Class,
          created,
        });

        student
          .save()
          .then((data) => {
            return res.status(201).json({
              status: StatusCodes.CREATED,
              message: MessageRespons.created,
              StudentData: data,
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
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

exports.StudentLogin = async (req, res) => {
  try {
    const { password, MasterField } = req.body;

    const userLogin = await Student.findOne({
      $or: [{ email: MasterField }, { Phone: MasterField }],
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

    const isvalid = await bcrypt.compare(password, userLogin.password);

    if (!isvalid) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: MessageRespons.notmatch,
      });
    }

    const { error, token } = await TokenGenerateStudent({ _id: userLogin._id });

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

exports.StudentFind = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (blockTokens.has(token)) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: "student logged out.",
      });
    } else {
      const userfind = await Student.find({ _id: req.decodedstudent });

      if (!userfind) {
        return res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: MessageRespons.login,
        });
      } else if (userfind.isActivated) {
        return res.status(403).json({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied.student has been deleted ",
        });
      } else {
        res.status(200).json({
          status: StatusCodes.OK,
          userfind,
          message: "student Credential Found ",
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

exports.Studentlogout = async(req,res) => {
  const token = req.headers.authorization;

  blockTokens.add(token);
 
   return res.status(200).json({
     status: StatusCodes.OK,
     message: MessageRespons.logout,
   });
}

exports.Studentdelete = async(req,res) => {
 
    try {
      const userId = req.decodedstudent;
      let user = await Student.findById(userId);
      if (!user) {
        Student.findByIdAndUpdate({ _id: user._id }, { isActivated: true });
        return res.status(404).json({
          status: 404,
          massage: "not found",
        });
      } else {
        user.isActivated = true;
        await user.save();
      }
      return res.status(201).json({
        status: 201,
        massage: "deactivated succ",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        error: true,
        message: "internal error",
      });
    }
}

exports.StudentPasswordChange = async(req,res) => {
  const { _id, currentPassword, newPassword, confirmPassword } = req.body;
  
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
      const user = await Student.findOne({ _id: req.decodedstudent });

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
              const UpdateUser = await Student.findByIdAndUpdate(
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

}

exports.allStudentFind = async (req, res) => {
  try {
   const token = req.headers.authorization;

    if (blockTokens.has(token)) {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: "admin logged out.",
      });
    } else {
      const studentfind = await Student.find({});
     
     
        res.status(200).json({
          status: StatusCodes.OK,
          studentfind,
          message: "admin  Found ",
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




exports.Studentupdate = async(req,res) => {

}
