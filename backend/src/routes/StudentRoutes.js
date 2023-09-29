const express = require("express");
const router = express.Router();

const StudentData = require("../controllor/StudentControllor");
const UserData = require("../controllor/UserControllor");
require("../models/Student");
const User = require("../models/user")
const { UserToken, restrict } = require("../middleware/Auth");


router.post("/studentregister", UserToken, restrict(User.role),StudentData.StudentRegister);

module.exports = router