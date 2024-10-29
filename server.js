const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

const app = require("./app");

//mogodb
const mongoose = require("mongoose");
const CONNECTION_STRING = process.env.CONNECTION_STRING.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(CONNECTION_STRING)
  .then((con) => {
    console.log("db connected successfully");
  })
  .catch((err) => console.log(err));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
