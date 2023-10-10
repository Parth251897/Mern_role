const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    StudentName: {
      FirstName: {
        type: String,
        required: false,
      },
      LastName: {
        type: String,
        required: false,
      },
    },
    Gender: {
      type: String,
      required: false,
      enum: ["Male", "Female"],
    },
    Category: {
      type: String,
      required: false,
      enum: ["General", "OBC", "SC", "ST", "Others"],
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    Phone: {
      type: String,
      required: false,
    },
    Profile: {
      type: String,
      require: false,
    },
    Address: {
      Address_Line_1: {
        type: String,
        required: false,
      },
      City: {
        type: String,
        required: false,
      },
      State: {
        type: String,
        required: false,
      },
      PostalCode: {
        type: String,
        required: false,
      },
      Country: {
        type: String,
        required: false,
      },
    },
    CourseName: {
      type: String,
      required: false,
      enum: ["BBA", "BCOM", "BCA", "BSc", "MBA", "MCOM", "MCA", "MSc"],
    },
    BranchName: {
      type: String,
      required: false,
    },
    Class: {
      type: String,
      required: false,
      enum: [
        "1st Semester",
        "2nd Semester",
        "3rd Semester",
        "4th Semester",
        "5th Semester",
        "6th Semester",
        "7th Semester",
        "8th Semester",
      ],
    },
    otp: {
      type: String,
    },
    otpexpiration: {
      type: String,
    },
    created: {
      type: String,
      required: false,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
