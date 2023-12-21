const path = require("path");
const staticPath = path.join(__dirname, "../../public");
const registerSchema = require("../models/registerSchema");
const MessModel = require("../models/messSchema");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { log } = require("console");

const contactSchema = require("../models/contactSchema");

const { use } = require("../router/router");
const { cursorTo } = require("readline");

exports.index = async (req, res) => {
  try {
    const messSystem = await MessModel.find({}); // Use await here to wait for the result

    res.render("index", {
      messList: messSystem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.registerPost = async (req, resp) => {
  try {
    const {
      inputName,
      inputEmail,
      inputPassword,
      inputMobileNumber,
      inputConfirmPassword,
      Status,
      inputAddress,
      inputCollegeOrJob,
    } = req.body;
    const checkemail = await registerSchema.findOne({ inputEmail });
    const checknumber = await registerSchema.findOne({ inputMobileNumber });

    if (checknumber) {
      resp
        .status(405)
        .json({ success: false, message: "Number is already registered" });
    } else if (checkemail) {
      resp
        .status(405)
        .json({ success: false, message: "Email is already registered" });
    } else {
      if (inputPassword == inputConfirmPassword) {
        const userdata = new registerSchema({
          name: inputName,
          email: inputEmail,
          number: inputMobileNumber,
          interval: Status,
          password: inputPassword,
          college: inputCollegeOrJob,
          address: inputAddress,
          confirmPassword: inputConfirmPassword,
        });
        const token = await userdata.generateAuthToken();
        resp.cookie("jwt", token, {
          expires: new Date(Date.now() + 5259600000),
          httpOnly: true,
          sameSite: "Strict",
        });
        const user = await userdata.save();
        resp
          .status(200)
          .json({ success: true, message: "register successful", user });
      } else {
        resp
          .status(401)
          .json({ success: false, message: "Password do not match" });
      }
    }
  } catch (error) {
    resp
      .status(401)
      .json({ success: false, message: "Please try again later" });
  }
};

// login ke liye
exports.loginPost = async (req, resp) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email + "   " + password);

  try {
    const useremail = await registerSchema.findOne({ email: email });
    const ismatch = await bcrypt.compare(password, useremail.password);
    const token = await useremail.generateAuthToken();
    if (ismatch) {
      resp.cookie("jwt", token, {
        expires: new Date(Date.now() + 5259600000),
        httpOnly: true,
        sameSite: "Strict",
      });
      resp.status(200).json({
        success: true,
        message: "Successfuly",
      });
    } else {
      resp.status(402).json({
        success: false,
        message: "Your Email or Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    resp
      .status(401)
      .json({ success: false, message: "Your Email or Password is incorrect" });
  }
};

exports.profileGet = async (req, resp) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const user = await registerSchema.findOne({ _id: verify._id });

    resp.render("profile", {
      user: user,
    });
  } catch (error) {
    console.log(error);
    resp
      .status(402)
      .json({ success: false, message: "Please login or create an account" });
  }
};

// edit profile
exports.editprofilePost = async (req, resp) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const user = await registerSchema.findOne({ _id: verify._id });

    const { name, number, address } = req.body;
    if (!user) {
      return resp
        .status(401)
        .send("User not found you have to login or register.");
    }

    if (name) user.name = name;
    if (number) user.number = number;
    if (address) user.address = address;
    await user.save();
    resp.redirect("/profile");
  } catch (error) {
    console.log(error);
    resp
      .status(402)
      .json({ success: false, message: "Please login or create an account" });
  }
};

// exports.profilePost = async (req, resp) => {
//   console.log(111111111111);
//   try {
//     const token = req.cookies.jwt;
//     const verify = jwt.verify(token, process.env.secretKey);
//     const user = await registerSchema.findById(verify._id);
//     if (!user) {
//       return resp
//         .status(401)
//         .send("User not found you have to login or register.");
//     }
//     const { name, email, money } = req.body;
//     console.log(name, email, money);
//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (money) user.money = money;
//     await user.save();
//     //TODO :
//     resp.redirect("profile");
//   } catch (error) {
//     console.error(error);
//     resp.status(401).send("Login timeout. Please login.");
//   }
// };

//admin

exports.adminpost = async (req, res) => {
  // res.render('admin')
  const user = await registerSchema.find({});
  console.log(user);
  res.render("admin", {
    user: user,
  });
};

// allcard holders
exports.costomers = async (req, res) => {
  const user = await registerSchema.find({});
  console.log(user);
  res.render("customers", {
    user: user,
  });
};

// card allot

exports.cardAllotment = async (req, res) => {
  res.sendFile("html/cardAlloatment.html", { root: staticPath });
};

exports.userlogin = async (req, res) => {
  res.sendFile("html/login.html", { root: staticPath });
};

//edit profile
exports.editProfileGet = async (req, res) => {
  // res.sendFile("html/edit.html", { root: staticPath });
  res.render("editprofile");
};

//recharge card
exports.recharge = async (req, res) => {
  res.render("recharge");
};

//testing learning ejs

exports.testing = async (req, res) => {
  try {
    const messSystem = await MessModel.find({}); // Use await here to wait for the result

    res.render("test", {
      messList: messSystem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

//contact form

exports.contactPost = async (req, resp) => {
  console.log(11111111);
  const name = req.body.name;
  const number = req.body.number;
  const subject = req.body.subject;
  const message = req.body.message;
  console.log(name);
  console.log(number);

  try {
    const contactData = new contactSchema({
      name: name,
      number: number,
      subject: subject,
      message: message,
    });
    const contact = await contactData.save();
    resp
      .status(200)
      .json({ success: true, message: "We will contact you soon", contact });
  } catch (error) {
    console.error(error);
    resp.status(401).send("Some Error occured");
  }
};

//edit profile

exports.editPost = async (req, resp) => {
  console.log(11111111, req.body);
  const token = req.cookies.jwt;
  const verify = jwt.verify(token, process.env.secretKey);
  const user = await registerSchema.findById(verify._id);
  6;
  console.log(user);
  const name = req.body.name;
  const number = req.body.number;
  const address = req.body.address;
  console.log(name);
  console.log(number);

  try {
    const editData = new editSchema({
      name: name,
      number: number,
      message: address,
    });
    const edit = await editData.save();
    resp
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully", edit });
  } catch (error) {
    console.error(error);
    resp.status(401).send("Some Error occured");
  }
};

exports.testingPost = async (req, resp) => {
  const id = req.body.id;
  const uses_money = req.body.uses_money;
  console.log(id, uses_money);

  try {
    const user = await registerSchema.findOne({ email: id });
    if (uses_money <= user.amount) {
      const realmoney = user.amount - uses_money;
      console.log(realmoney);
    } else {
      console.log("not enough balance");
    }
    resp.send(realmoney);
  } catch (error) { }
};

// recharge post

exports.rechargePost = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const users = await registerSchema.find(); // Retrieve all users
    if (!users || users.length === 0) {
      return res.status(401).send("No users found.");
    }

    // Logging date values from money arrays of all users
    users.forEach((user) => {
      user.money.forEach((moneyEntry) => {
        console.log(moneyEntry.date);
      });
    });

    const userIdToUpdate = verify._id; // ID of the user to update (current user)

    // Find the specific user by ID
    const currentUser = users.find(
      (user) => String(user._id) === String(userIdToUpdate)
    );
    if (!currentUser) {
      return res.status(401).send("User not found.");
    }

    const { money } = req.body;
    const parsedMoney = parseFloat(money);
    const parsedAcMoney = parseFloat(currentUser.amount);
    const newAmount = parsedAcMoney + parsedMoney;

    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const parts = currentDate.split(" ");
    const indianDate = parts.slice(0, 4).join(" ");

    // Update user's money and add to the 'money' array

    currentUser.amount = newAmount;
    currentUser.money.push({ recharges: money, date: indianDate });
    await currentUser.save();

    res.redirect("../profile");
  } catch (error) {
    console.error(error);
    res.status(401).send("something went wrong");
  }
};

// meal plan
exports.skeepMeal = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const users = await registerSchema.find(); // Retrieve all users
    if (!users || users.length === 0) {
      return res.status(401).send("No users found.");
    }

    const userIdToUpdate = verify._id;
    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const parts = currentDate.split(",");
    const indianDate = parts.slice(0, 1).join(" ");
    console.log(indianDate);
    const { skipMealOption } = req.body;
    const currentUser = users.find(
      (user) => String(user._id) === String(userIdToUpdate)
    );

    if (!currentUser) {
      return res.status(401).send("User not found.");
    }

    currentUser.skipMeall.push({
      skipMealData: skipMealOption,
      date: indianDate,
    });
    await currentUser.save();
    res.redirect("../profile");
  } catch (error) {
    console.error(error);
    res.status(401).send("something went wrong");
  }
};

exports.notTaking = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const userIdToUpdate = verify._id;

    const currentDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const parts = currentDate.split(",");
    const indianDate = parts.slice(0, 1).join(" ");
    console.log(indianDate);
    const users = await registerSchema.aggregate([
      {
        $match: {
          "skipMeall.date": indianDate,
        },
      },
    ]);

    if (!users || users.length === 0) {
      return res
        .status(401)
        .send("No users found for today's date in skipMeall.");
    }

    res.render("notTaking", {
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Something went wrong");
  }
};

exports.success = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.secretKey);
    const userIdToUpdate = verify._id;

    const currentDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const parts = currentDate.split(",");
    const indianDate = parts.slice(0, 1).join(" ");

    const users = await registerSchema.aggregate([
      {
        $match: {
          "skipMeall.date": {
            $not: { $eq: indianDate }, // Match documents where today's date is not present in skipMeall
          },
        },
      },
    ]);

    if (!users || users.length === 0) {
      return res
        .status(401)
        .send("No users found without today's date in skipMeall.");
    }

    res.render("success", {
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Something went wrong");
  }
};

exports.mealDone = async (req, res) => {
  try {
    const cardId = req.params.cardId;

    const currentDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const parts = currentDate.split(",");
    const indianDate = parts.slice(0, 1).join(" ");

    // Check if the user has placed any meal for today
    const userToday = await registerSchema.findOne({
      cardId,
      "skipMeall.date": indianDate,
    });

    if (!userToday) {
      // User is eligible to take a meal today
      const userMealDone = await registerSchema.findOne({
        cardId,
        "mealDone.date": indianDate,
      });

      if (userMealDone && userMealDone.mealDone.length > 0) {
        // User has already marked the meal as done for today
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "You have already marked your meal as done today",
        });
      }

      // Update the user's mealDone to indicate the meal is done for today
      await registerSchema.updateOne(
        { cardId },
        { $addToSet: { "mealDone": { date: indianDate, mealDoneOk: "done" } } }
      );

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Meal successfully marked as done",
      });
    } else {
      // User has indicated that they are not taking a meal today
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "You have indicated that you are not taking a meal today",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "server error",
      code: 500,
      message: "Something Went Wrong",
    });
  }
};


