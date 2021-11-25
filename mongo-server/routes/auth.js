var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const saltRounds = 10;

const privateKey = process.env.JWT_PRIVATE_KEY;

router.use(function (req, res, next) {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      req.hashedPassword = hash;
      next();
    });
  });
});

router.post("/login", async function (req, res, next) {
  if (req.body.username && req.body.password) {
    const user = await User.findOne()
      .where("username")
      .equals(req.body.username.toLowerCase())
      .exec();

    if (user) {
      return await bcrypt
        .compare(req.body.password, user.password)
        .then((result) => {
          if (result === true) {
            const token = jwt.sign({ id: user._id }, privateKey, {
              algorithm: "RS256",
            });
            return res.status(200).json({ access_token: token });
          } else {
            return res.status(401).json({ error: "Invalid credentials." });
          }
        })
        .catch((error) => {
          return res.status(500).json({ error: error.message });
        });
    } else {
      return res.status(401).json({ error: "User is not registered" });
    }
  } else res.status(400).json({ error: "Username or Password missing" });
});
router.post("/register", function (req, res, next) {
  if (req.body.username && req.body.password && req.body.passwordConfirmation) {
    if (req.body.password === req.body.passwordConfirmation) {
      const user = new User({
        username: req.body.username.toLowerCase().trim(),
        password: req.hashedPassword,
      });
      user
        .save()
        .then((savedUser) => {
          const token = jwt.sign({ id: user._id }, privateKey, {
            algorithm: "RS256",
          });
          return res.status(201).json({
            id: savedUser._id,
            username: savedUser.username,
            access_token: token,
          });
          // }
        })
        .catch((error) => {
          return res.status(500).json({ error: error.message });
        });
    } else
      res
        .status(400)
        .json({ error: "Password and confirm password does not match" });
  } else res.status(400).json({ error: "Username or Password or confirm password missing" });
});

module.exports = router;
