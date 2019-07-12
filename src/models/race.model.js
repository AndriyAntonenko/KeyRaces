const mongoose = require("mongoose");

const { Schema } = mongoose;

const schema = new Schema(
  {
    racers: { type: [mongoose.SchemaTypes.ObjectId], ref: "Users" },
    isActive: {
      type: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Race", schema);
