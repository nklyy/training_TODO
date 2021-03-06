const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const todoRoutes = require('./routes/todos');
const path = require('path');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('./passport/setup')
const flash = require('connect-flash')
const config = require('config')
// const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 5000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(
  session({
    secret: config.get("secretKey"),
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use(express.urlencoded({ extended:true }));

// app.use(cookieParser())

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')));

app.use(todoRoutes);

async function start() {
    try {
        await mongoose.connect(config.get('mongoUrl'), {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => {
            console.log(`Server has been started... ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start().catch(err => console.log(err));