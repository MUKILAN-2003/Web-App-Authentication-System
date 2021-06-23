const User = require('../model/user.js')
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

const createToken = (id) => {
    return jwt.sign({ id }, "%$iwudibdiiwd@#$wdjdwnomdw(*&whdwhd#$>idnw(*&^");
}

const login_post = async(req, res) => {
    user_find = req.body
    const user = await User.findOne({ username: user_find.username }).lean()
    if (!user) {
        res.render("login", { error: "Username does Not Exist" });
    } else {
        if (await bcrypt.compare(user_find.password, user.password)) {
            const token = createToken(user._id);
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

const feedback_post = (req, res) => {
    console.log(req.body)
    res.end()
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

module.exports = { home, logged, logout, login_get, signup_get, feedback_get, login_post, signup_post, feedback_post }