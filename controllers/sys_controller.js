const User = require('../model/user.js')
const Feedback = require('../model/feedback.js')
const Reset = require('../model/pass_reset.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const { getMaxListeners } = require('../model/user.js')

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, //secure port for modern apps with TLC encryption
    secure: false, //only true when using 465 port
    auth: {
        user: 'mukilan069@gmail.com',
        pass: '-----Pass Key-----'
    },
});

transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Mail Server Check.................ok");
    }
});

const send_mail_reset = async(mailto, tmpid, tmptoken, userid, tmpname) => {
    var redirect_link = 'http://localhost:8888/reset/password/' + tmpid + '/' + tmptoken + '/' + userid;
    let info = await transporter.sendMail({
        from: 'mukilan069@gmail.com',
        to: mailto,
        subject: "Authentication Password Reset",
        html: `<div style='background: linear-gradient(#acbac4, #2c3e50);text-align:center' ;>
        <br />
        <h1 style='text-align:left' ;>Hello ${tmpname},</h1>
        <h2><b><a href=${redirect_link} target='_blank'>Click To Reset Password</a></b></h2>
        <p>Link Will be expire in 30 minutes</p>
        <br />
        <p style="color:white;width: 100%;background-color: rgba(0, 0, 0, 0.192);">SM Bro's &copy; 2021</p>
        <br />
    </div>`
    });
}

const change_password = async(req, res) => {
    const get_cookie = jwt.verify(req.cookies.jwt, "--------------Reset Password Security Key----------------");
    if (get_cookie) {
        const change_password_user = await User.findOne({ username: get_cookie.id.username }).lean()
        if (change_password_user) {
            req.body["password"] = await bcrypt.hash(req.body["password"], 12);
            User.updateOne({ "username": get_cookie.id.username }, { "password": req.body["password"] }, (err, result) => {
                if (err) {
                    console.log(err)
                }
            });
            res.redirect('/login')
        }
    }
}

const email_verification = async(req, res) => {
    const user_verify = await User.findOne({ _id: req.params.userid }).lean()
    const verify_db_find = await Reset.findOne({ _id: req.params.tmpid }).lean()
    if (user_verify) {
        if (verify_db_find) {
            if (req.cookies.jwt) {
                const verify_cookie = jwt.verify(req.cookies.jwt, "--------------Reset Password Security Key----------------");
                if (verify_cookie) {
                    res.render("change_pass", { error: null })
                } else {
                    res.render("reset_pass_word", { error: 'Session Expired' })
                }
            } else {
                res.render("reset_pass_word", { error: 'Session Expires' });
            }
        } else {
            res.render("reset_pass_word", { error: 'Link Expires' });
        }
    } else {
        res.render("reset_pass_word", { error: 'Invalid User' });
    }
}


const home = (req, res) => {
    res.render("index");
}

const login_get = (req, res) => {
    res.render("login", { error: null });
}

const signup_get = (req, res) => {
    res.render("signup", { error: null });
}

const feedback_get = (req, res) => {
    res.render("feedback");
}

const createToken_SU = (id) => {
    return jwt.sign({ id }, "--------------Login Password Security Key----------------");
}

const createToken_PR = (id) => {
    return jwt.sign({ id }, "--------------Reset Password Security Key----------------");
}

const pass_reset_post = async(req, res) => {
    var req_reset = new Reset(req.body);
    const user_reset = await User.findOne({ username: req_reset.username }).lean()
    if (user_reset) {
        if (user_reset.mail == req.body['mail_id']) {
            req_reset.save()
                .then(async(result) => {
                    const temp_data = await Reset.findOne({ username: user_reset.username }).lean()
                    const tmp_token = createToken_PR(temp_data);
                    res.cookie('jwt', tmp_token, { httpOnly: true });
                    send_mail_reset(user_reset.mail, temp_data._id, tmp_token, user_reset._id, user_reset.name).catch(console.error);
                    res.render('404', { msg: 'Check Registered E-Mail to Reset Password' })
                })
                .catch((error) => {
                    console.log(error)
                    res.render("reset_pass_word", { error: 'Username / Mail Invaild' });
                })
        } else {
            res.render("reset_pass_word", { error: 'Username & Mail Mismatch' });
        }
    } else {
        res.render("reset_pass_word", { error: 'Username Invaild' });
    }
}

const pass_reset_get = async(req, res) => {
    res.render("reset_pass_word", { error: null });
}

const login_post = async(req, res) => {
    user_find = req.body
    const user = await User.findOne({ username: user_find.username }).lean()
    if (!user) {
        res.render("login", { error: "Username does Not Exist" });
    } else {
        if (await bcrypt.compare(user_find.password, user.password)) {
            const token = createToken_SU(user._id);
            res.cookie('jwt', token, { httpOnly: true });
            res.redirect("/logged");
        } else {
            res.render("login", { error: "Password Incorrect" });
        }
        res.end()
    }
}

const signup_post = async(req, res) => {
    if (req.body['password'].length < 5) {
        res.render("signup", { error: 'Password Must be 6 Character' });
    } else {

        req.body["password"] = await bcrypt.hash(req.body["password"], 12);
        var newUser = new User(req.body);
        newUser.save()
            .then((result) => {
                res.redirect('/login');
            })
            .catch((error) => {
                if (error.code == 11000) {
                    res.render("signup", { error: 'Username Already Exist' });
                }
            })
    }
}

const feedback_post = async(req, res) => {
    console.log(req.body)
    var feed = new Feedback(req.body);
    feed.save()
        .then((result) => {
            res.redirect('/')
        })
        .catch((error) => {
            console.log(error)
        })
}

const logged = async(req, res) => {
    if (req.cookies.jwt) {
        const cookie_id = jwt.verify(req.cookies.jwt, "--------------Login Password Security Key----------------");
        if (cookie_id) {
            const user = await User.findOne({ _id: cookie_id.id }).lean();
            res.render('logged', { user_name: user['name'] })
        }
    } else {
        res.redirect('/')
    }
}

const logout = async(req, res) => {
    res.cookie('jwt', {}, { httpOnly: true, maxAge: 1 });
    res.redirect('/')
}

module.exports = { home, pass_reset_post, pass_reset_get, email_verification, change_password, logged, logout, login_get, signup_get, feedback_get, login_post, signup_post, feedback_post }
