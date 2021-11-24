var express = require("express");
var router = express.Router();
var Todo = require("../models/Todo");
var jwt = require("jsonwebtoken");

const privateKey = process.env.JWT_PRIVATE_KEY;
router.use(function (req, res, next) {
  console.log(req.header("Authorization"));
  if (req.header("Authorization")) {
    try {
      req.payload = jwt.verify(req.header("Authorization"), privateKey, {
        algorithms: ["RS256"],
      });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
router.get("/:todoId", async function (req, res, next) {
  const todo = await Todo.findOne()
    .where("_id")
    .equals(req.params.todoId)
    .exec();

  return res.status(200).json(todo);
});
router.get("/", async function (req, res, next) {
  // res.render("index", { title: "Express" });
  const todoList = await Todo.find()
    .where("authorId")
    .equals(req.payload.id)
    .exec();
  return res.status(200).json({ todoList: todoList });
});

router.post("/", function (req, res, next) {
  //res.render('index', { title: 'Express' });
  const todo = new Todo({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    dateCreated: req.body.dateCreated,
    completed: req.body.completed,
    dateCompleted: req.body.dateCompleted,
    authorId: req.payload.id,
  });

  todo
    .save()
    .then((savedTodo) => {
      return res.status(201).json({
        id: savedTodo._id,
        title: savedTodo.title,
        author: savedTodo.author,
        description: savedTodo.description,
        dateCreated: savedTodo.dateCreated,
        completed: savedTodo.completed,
        dateCompleted: savedTodo.dateCompleted,
        authorId: savedTodo.authorId,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});

router.patch("/:id", function (req, res) {
  var updateObject = req.body;
  var id = req.params.id;
  Todo.findByIdAndUpdate(id, updateObject)
    .then((updateObj) => {
      updateObj.save();
      return res.status(201).json(updateObj);
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});
router.delete("/:id", (req, res) => {
  var deleteObject = req.body;
  Todo.remove({ _id: req.params.id }, (error) => {
    if (error) return res.status(500).json({ error: error.message });
    else return res.status(200).json(req.params.id);
  });
});
module.exports = router;
