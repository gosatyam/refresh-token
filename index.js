const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/authRoutes");

dotenv.config();

const app = express();
// MIDDLEWARES

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

mongoose.connect("mongodb://127.0.0.1:27017/refresh-token");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("connected to mongoDB");
});

// Routes
app.get("/", (_, res) => res.send("<h1>Healthy server!</h1>"));

app.use("/auth", authRoutes);

const port = process.env.PORT;

app
  .listen(port, () => {
    console.log(`server running on port : ${port}`);
  })
  .on("error", (e) => console.log("Error in starting server", e));
