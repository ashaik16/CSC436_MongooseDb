var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Todo = require("../models/Todo");
/* GET home page. */

// router.get("/", async function (req, res) {
//   await User.find({}, function (err, users) {
//     var userMap = {};

//     users.forEach(function (user) {
//       userMap[user._id] = user;
//     });

//     return res.status(200).json({ users: userMap });
//   });
// });
router.get("/", async function (req, res, next) {
  // res.render("index", { title: "Express" });
  const userList = await User.find().exec();
  return res.status(200).json({ userList: userList });
});
router.get("/:userId", async function (req, res, next) {
  const todoList = await Todo.find()
    .where("authorId")
    .equals(req.params.userId)
    .exec();

  return res.status(200).json({ todoList: todoList });
});
module.exports = router;
