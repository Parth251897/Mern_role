const multer = require("multer")
const express = require("express")
const fs = require("fs");
const path = require("path")
const user = require("../models/user")
const UserControllor = require("../controllor/UserControllor")
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profile") {
      cb(null, "public/profile");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    const filename = `profile_${timestamp}.${ext}`;
    cb(null, filename);
  },
});

let Upload = multer({ storage: storage }).fields([{ name: "profile" }]);

async function uploadFile(req, res, next) {
  Upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        status: 400,
        message: responseMessage.WORNG,
      });
    } else {
      if (req.files && req.files.profile) {
      
        const profileFilename = req.files.profile[0].filename;
        req.profile = profileFilename;
  
        if (req.oldProfileFilename) {
          const oldProfilePath = `public/profile/${req.oldProfileFilename}`;
          fs.unlink(oldProfilePath, (err) => {
            if (err) {
              console.error(`Error deleting old profile file: ${err}`);
            } else {
              console.log(`Old profile file deleted: ${oldProfilePath}`);
            }
          });
        }
        req.oldProfileFilename = profileFilename;
      }

      next();
    }
  });
}
module.exports = uploadFile;
