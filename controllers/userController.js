const fs = require("fs");

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
);

exports.validateID = (req, res, next, val) =>{
    console.log(`id is ${val}`);
    const id = req.params.id;
    const user = users.find((x) => x._id === id);

    if (!user) {
    return res.status(404).json({
        status: "fail",
        messgae: "invalid id",
    });
    }
    next();
};
exports.getAllUsers = (req, res) => {
  res.status(200).json({
    reuestedAt: req.requestTime,
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};
exports.createUser = (req, res) => {
  const newID = users.slice(-1)[0].id + 1;
  const newUser = { ...req.body, id: newID };
  users.push(newUser);
  fs.writeFile(
    `${__dirname}/../dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      console.log(err);
      res.status(201).json({
        status: "success",
        data: {
          user: newUser,
        },
      });
    },
  );
};

exports.getUser = (req, res) => {
  const id = req.params.id;
  const user = users.find((x) => x._id === id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.updateUser = (re, res) => {
  const id = req.params.id;
  const user = users.find((x) => x._id === id);
  res.status(200).JSON({
    status: "success",
    data: "<Updated user here ...>",
  });
};
exports.deleteUser = (re, res) => {
  const id = req.params.id;
  const user = users.find((x) => x._id === id);
  res.status(204).JSON({
    status: "success",
    data: null,
  });
};
