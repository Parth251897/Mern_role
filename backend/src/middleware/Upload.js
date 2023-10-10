const multer = require("multer");
const express = require("express");
const fs = require("fs");
const path = require("path");
const user = require("../models/user");
const UserControllor = require("../controllor/UserControllor");
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "document") {
      cb(null, "public/document");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const timestamp = new Date().getTime();
    const filename = `${file.originalname}_${timestamp}.${ext}`;
    cb(null, filename);
  },
});

let Upload = multer({ storage: storage }).fields([{ name: "document" }]);

async function uploadFile(req, res, next) {
  Upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        status: 400,
        message: responseMessage.WRONG,
      });
    } else {
      if (req.files && req.files.document) {
        req.document = req.files.document.map((file) => {
          const documentpath = `public/document/${file.filename}`;
          return documentpath;
        });
      }
      next();
    }
  });
}

module.exports = uploadFile;
