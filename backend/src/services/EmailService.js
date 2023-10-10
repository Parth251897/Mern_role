const transporter = require("../../src/config/Email.config");
const otpGenerator = require("otp-generator");
const jwtResponse = require("../../src/services/JWTresponse").default;
const { TokenGenerate } = require("../utils/jwt");
const verifykey = require("../middleware/Auth");
const {
  passwordencrypt,
  validatePassword,
} = require("../../src/services/CommonServices");
const responseMessage = require("../../src/utils/MessageRespons.json");
const User = require("../../src/models/user");
const Student = require("../../src/models/Student");
require("dotenv").config();

// email password reset forgot update verify
exports.sentotp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(Math.random().toFixed(4) * 9999);

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    const expirationTimeIST = expirationTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    // console.log(expirationTimeIST);

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { otp: otp, otpexpiration: expirationTimeIST } },
      { new: true }
    );

    const student = await Student.findOneAndUpdate(
      { email },
      { $set: { otp: otp, otpexpiration: expirationTimeIST } },
      { new: true }
    );

    if (!user && !student) {
      return res.status(404).json({
        status: 404,
        message: "email id is not found",
      });
    } else {
      if (user) {
        await user.save();
      }

      if (student) {
        await student.save();
      }

      // Send the OTP to the user's email
      const mailOptions = {
        from: "parth@example.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for password reset is: ${otp}. 
      Please use this OTP within 5 minutes to reset your password. 
      If you didn't request this, please ignore this email.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(502).json({
            status: 502,
            message: "OTP not sent",
          });
        } else {
          console.log("Email sent:", info.response);
          return res.status(200).json({
            status: 200,
            message: "OTP sent Successfully",
          });
        }
      });
    }
  } catch (error) {
    console.log("Error sending OTP:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

// otp verify
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user =
      (await User.findOne({ email })) || (await Student.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: " Email not found ",
      });
    } else {
      if (otp !== user.otp) {
        return res.status(400).json({
          status: 400,
          message: "Invalied OTP please enter a Valied OTP",
        });
      } else {
        if (
          user.otpexpiration <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        )
          return res.status(400).json({
            status: 400,
            message: "OTP is Exparie",
          });
        else {
          user.otp = null;
          user.otpexpiration = null;
          await user.save();

          return res.status(201).json({
            status: 201,
            message: "OTP verify Successfully",
          });
        }
      }
    }
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return res.status(500).json({
      status: 500,
      message: "error while verify OTP",
    });
  }
};

// verify opt n reset pass
exports.resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!password || !confirmPassword || !email) {
    return res.status(403).json({
      status: 403,
      error: true,
      message: responseMessage.EMPTYFIELDS,
    });
  } else if (!validatePassword(password)) {
    return res.status(400).json({
      status: 400,
      message: responseMessage.PASSWORDFORMAT,
    });
  } else {
    try {
      const user =
        (await User.findOne({ email })) || (await Student.findOne({ email }));

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "email id not found",
        });
      } else {
        if (password !== confirmPassword) {
          return res.status(400).json({
            status: 400,
            message: "password and confirmpassword not match",
          });
        } else if (
          user.otpexpiration <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ) {
          return res.status(400).json({
            status: 400,
            message: "Time out Requset for new OTP again",
          });
        } else {
          const hashedPassword = await passwordencrypt(password);

          user.password = hashedPassword;
          await user.save();

          return res.status(201).json({
            status: 201,
            message: "password reset successfully",
          });
        }
      }
    } catch (error) {
      console.log("Error resetting password:", error);
      return res.status(500).json({
        status: 500,
        message: "error while resetting password",
      });
    }
  }
};
