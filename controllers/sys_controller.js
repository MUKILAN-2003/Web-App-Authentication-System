const User = require('../model/user.js')
const Feedback = require('../model/feedback.js')
const Reset = require('../model/pass_reset.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    return jwt.sign({ id }, "%$iwudibdiiwd@#$wdjdwnomdw(*&whdwhd#$>idnw(*&^");
}

const createToken_PR = (id) => {
    return jwt.sign({ id }, "^&*(wndi>$#dhwdhw&*(wdmonwdjdw$#@dwiidbiduwi$%");
}

const pass_reset_post = async(req, res) => {
    var req_reset = new Reset(req.body);
    const user_reset = await User.findOne({ username: req_reset.username }).lean()
    if (user_reset) {
        if (user_reset.mail == req.body['mail_id']) {
            req_reset.save()
                .then(async(result) => {
                    const temp_data = await Reset.findOne({ username: user_reset.username }).lean()
                    console.log(temp_data)
                    res.redirect('/')
                })
                .catch((error) => {
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
        const cookie_id = jwt.verify(req.cookies.jwt, "%$iwudibdiiwd@#$wdjdwnomdw(*&whdwhd#$>idnw(*&^");
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

module.exports = { home, pass_reset_post, pass_reset_get, logged, logout, login_get, signup_get, feedback_get, login_post, signup_post, feedback_post }