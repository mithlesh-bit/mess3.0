const mongoose = require("mongoose");

const messSchema = new mongoose.Schema({
  messName: String,
  location: String,
  image: String,
  link: String,
});

module.exports = mongoose.model("webdata", messSchema);
