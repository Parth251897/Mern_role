const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/rolecollage", {})
  .then(() => {
    console.log("Successfully connected");
  })
  .catch((error) => {
    console.log("Not connected");
  });
