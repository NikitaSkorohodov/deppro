const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const i18n = require('./i18n');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Passport Config
require('./config/passport');

const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cookieParser());
app.use(i18n.init);
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    __: function (...args) { return i18n.__.apply(this, args); }
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const lang = req.query.lang || req.cookies.lang || 'en';
  res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });
  req.setLocale(lang);
  next();
});

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const url = 'mongodb+srv://nikitaskoroho14:k91JX8WHbKcFNuIb@root.yil9zns.mongodb.net/shop';
    await mongoose.connect(url, {
      useNewUrlParser: true,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

start();
