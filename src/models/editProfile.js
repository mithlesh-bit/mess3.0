const mongoose = require("mongoose");

const editSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  address: String,
});

module.exports = mongoose.model("registers", editSchema);
