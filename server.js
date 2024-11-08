const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

process.on("uncaughtException", ({ name, message }) => {
  console.log(name, message);
  console.log("uncaught Exception shutting down...");
  process.exit(1);
});

const app = require("./app");
//mogodb
const mongoose = require("mongoose");
const CONNECTION_STRING = process.env.CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(CONNECTION_STRING).then((con) => {
  console.log("db connected successfully");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

process.on("unhandledRejection", ({ name, message }) => {
  console.log(name, message);
  console.log("unhandled Rejection shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
