require("dotenv").config();
const express = require("express");
const mustache = require("mustache-express");
const bodyParser = require("body-parser");
const mockDb = require("./mockDb.js");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verificationSID = process.env.TWILIO_VERIFY_SID;

const app = express();

//Templating Engine Setup
app.engine("html", mustache());
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));

//Fake Database
const database = new mockDb();

//Sign Up Page
app.get("/", (req, res) => {
  res.render("register");
});

//New User Created
app.post("/", (req, res) => {
  const email = req.body.email;

  database.addUser({
    username: req.body.username,
    email: email,
    password: req.body.password,
    verified: "Not Verified"
  });

  // //CREATE A NEW VERIFICATION HERE
  twilioClient.verify
    .services(verificationSID)
    .verifications.create({ to: email, channel: "email" })
    .then(verification => {
      console.log("Verification email sent");
      res.redirect(`/verify?email=${email}`);
    })
    .catch(error => {
      console.log(error);
    });
});

//Requesting Verification Code
app.get("/verify", (req, res) => {
  res.render("verify", { email: req.query.email });
});

//Verification Code submission
app.post("/verify", (req, res) => {
  const userCode = req.body.code;
  const email = req.body.email;

  console.log(`Code: ${userCode}`);
  console.log(`Email: ${email}`);
  //CHECK YOUR VERIFICATION CODE HERE

  twilioClient.verify
    .services(verificationSID)
    .verificationChecks.create({ to: email, code: userCode })
    .then(verification_check => {
      if (verification_check.status === "approved") {
        database.verifyUser(email);
        res.redirect("users");
      } else {
        res.render("verify", {
          email: email,
          message: "Verification Failed. Please enter the code from your email"
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.render("verify", {
        email: email,
        message: "Verification Failed. Please enter the code from your email"
      });
    });
});

app.get("/users", (req, res) => {
  let users = database.getUsers();
  res.render("users", {
    users: {
      users: users
    }
  });
});

console.log("Listening on Port 3000");
app.listen(3000);
