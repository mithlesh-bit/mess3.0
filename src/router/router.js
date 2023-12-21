const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/controller");

router.get("/", controller.index);
router.get("/profile/editprofile", auth, controller.editProfileGet);
router.get("/admin", controller.adminpost);
router.get("/cardAlloatment", controller.cardAllotment);
router.get("/login", controller.userlogin);
// router.get("/editprofile", controller.editprofile);

router.get("/recharge", controller.recharge);
router.get("/testing", controller.testing);
router.post("/contact", controller.contactPost);
router.post("/editProfile", controller.editPost);
// router.get("/profile/editProfile", auth, controller.editprofile);

router.get("/profile/recharge", auth, controller.recharge);
router.get("/testing", controller.testing);
router.get("/profile", auth, controller.profileGet);
router.get("/admin/costomers", controller.costomers);
router.get("/admin/success", controller.success);
router.get("/admin/notTaking", controller.notTaking);
router.get("/mealDone/:cardId", controller.mealDone);

router.post("/cardAlloatment", controller.registerPost);
router.post("/profile/editprofile", auth, controller.editprofilePost);
router.post("/login", controller.loginPost);
router.post("/profile/amount", controller.testingPost); //for tapping card and diduct the money
router.post("/profile/recharge", controller.rechargePost);
router.post("/profile", controller.skeepMeal);

module.exports = router;
