const express = require('express')
const mongo = require('mongoose')
const sy_route = require('./routes/system.js')
const cookieParser = require("cookie-parser");

const app = express()
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const connect_mongo = process.env.MONGODB_URI || "-------------------------------------MONGO(db)URI---------------------------------------------";
const port = process.env.PORT || 8888;

console.log('Connecting to Database')
mongo.connect(connect_mongo, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then((res) => {
        console.log('db Connection................ok')
        console.log('Main Server Check.................ok')
        app.listen(port);
    })
    .catch((err) => console.log(err))

app.use(sy_route)

app.use((req, res) => {
    res.status(404).render('404', { msg: '404 Page Not Found' })
});
