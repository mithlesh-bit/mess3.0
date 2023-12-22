const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerSchema = mongoose.Schema({
  name: String,
  email: String,
  number: String,
  interval: String,
  password: String,
  college: String,
  amount: Number,
  address: String,
  confirmPassword: String,
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  money: [
    {
      recharges: {
        type: String,
      },
      date: {
        type: String,
      },
    },
  ],
  skipMeall: [
    {
      skipMealData: {
        type: String,
      },
      date: {
        type: String,
      },
    }
  ],
  mealDone: [
    {
      date: String,
      mealDoneOk: String,
      // Other fields...
    },
  ],
  cardId: String

});

registerSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign(
      { _id: this._id.toString() },
      process.env.secretKey
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

registerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model("registers", registerSchema);



