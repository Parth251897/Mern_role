const express = require("express");
const router = express.Router();

const UserData = require("../controllor/UserControllor");
const StudentData = require("../controllor/StudentControllor");
const User = require("../models/user");
const { UserToken, restrict,StudentToken } = require('../middleware/Auth')
const uploadFile = require("../middleware/Upload")
const EmailService = require("../services/EmailService")

router.post("/register",uploadFile, UserData.Register);
router.post("/login", UserData.login);

// router.patch("/updateprofile",UserToken,uploadFile,UserData.updateProfile);


router.get("/userdetail", UserToken, restrict("admin"),UserData.userfind);
router.get("/alluserdetail",UserToken, restrict("user"),UserData.alluserfind);

router.patch("/update", UserToken, restrict("user"),UserData.UserUpdate);
router.patch("/updatedocument", UserToken, restrict("user"),uploadFile,UserData.updatedocument);

router.patch("/updatepassword", UserToken,UserData.UserPasswordChange);
router.delete("/delete", UserToken, UserData.UserDelete);
router.post("/logout", UserToken, UserData.logout);



router.post("/studentregister",UserToken, restrict("user"),StudentData.StudentRegister);
router.post("/studentlogin",StudentData.StudentLogin);
router.get("/studentfind",StudentToken,StudentData.StudentFind);
router.get("/allstudentfind",UserToken,restrict('admin','supervisor'),StudentData.allStudentFind);
router.patch("/studentupdate",StudentToken,StudentData.Studentupdate);
router.post("/studentlogout",StudentToken,StudentData.Studentlogout);
router.delete("/studentdelete",StudentToken,StudentData.Studentdelete);
router.patch("/studentPasswordUpdate",StudentToken,StudentData.StudentPasswordChange);


////Email service
router.post("/sentotp",EmailService.sentotp);
router.post("/verifyotp",EmailService.verifyOTP);
router.post("/setnewpassword",EmailService.resetPassword);


module.exports = router;
