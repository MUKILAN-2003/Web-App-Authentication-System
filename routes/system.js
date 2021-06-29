const express = require("express");
const syscontroller = require("../controllers/sys_controller.js");


const router = express.Router();

router.get("/", syscontroller.home)

router.get("/login", syscontroller.login_get)

router.get("/signup", syscontroller.signup_get)

router.get("/logged", syscontroller.logged)

router.get("/logout", syscontroller.logout)

router.get("/reset_password", syscontroller.pass_reset_get)

router.get("/reset/password/:tmpid/:tmptoken/:userid", syscontroller.email_verification)

router.get("/feedback", syscontroller.feedback_get)

router.post("/login", syscontroller.login_post)

router.post("/signup", syscontroller.signup_post)

router.post("/feedback", syscontroller.feedback_post)

router.post("/reset_password", syscontroller.pass_reset_post)

router.post("/reset/password/tmpid/tmptoken/userid", syscontroller.change_password)

module.exports = router;