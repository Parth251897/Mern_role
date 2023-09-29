const express = require("express");
const router = express.Router();

const UserData = require("../controllor/UserControllor");
const StudentData = require("../controllor/StudentControllor");
const User = require("../models/user");
const { UserToken, restrict,StudentToken } = require("../middleware/Auth");

router.post("/register", UserData.Register);
router.post("/login", UserData.login);
router.get("/userdetail", UserToken, restrict("admin"),UserData.userfind);
router.get("/alluserdetail",UserData.alluserfind);
router.patch("/update", UserToken, restrict("user"),UserData.UserUpdate);
router.delete("/delete", UserToken, UserData.UserDelete);
router.post("/logout", UserToken, UserData.logout);


router.post("/studentregister",UserToken, restrict("user"),StudentData.StudentRegister);
router.post("/studentlogin",StudentData.StudentLogin);
router.get("/studentfind",StudentToken,StudentData.StudentFind);
router.patch("/studentupdate",StudentToken,StudentData.Studentupdate);
router.post("/studentlogout",StudentToken,StudentData.Studentlogout);
router.delete("/studentdelete",StudentToken,StudentData.Studentdelete);
router.patch("/studentdelete",StudentToken,StudentData.StudentPasswordChange);


module.exports = router;
