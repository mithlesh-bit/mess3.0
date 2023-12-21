const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
  subject: String,
  message: String,
});

module.exports = mongoose.model("contacts", contactSchema);
