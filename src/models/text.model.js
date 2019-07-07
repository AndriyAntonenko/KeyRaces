const mongoose = require("mongoose");

const { Schema } = mongoose;

const schema = new Schema({
  text: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Textes", schema);
