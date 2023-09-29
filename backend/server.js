const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors")
const PORT = process.env.PORT || 5000;

require("./src/config/Db.Config.js");
const userRoute = require("./src/routes/UserRoutes.js");


app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/user", userRoute);
 app.use("/student", userRoute)

app.listen(PORT, () => {
  console.log(`Server Successfully Connected port no ${PORT}`);
});
