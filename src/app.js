const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const express = require('express');
const path = require('path');
const pool = require('./configurations/database');
const authRoutes = require('./routes/auth.routes');
const config = require('./configurations/config');
const {requireAuth} = require('./middlewares/auth.middleware');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    store: new pgSession({
        pool:pool,
        tableName:'session',
        createTableIfMissing:true
    }),
    secret:config.SESSION.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        secure:false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8
    }
}))

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// ROUTES
const homeRoutes = require('./routes/home.routes');
const entryRoutes = require('./routes/entry.routes');

app.use(authRoutes);
app.use('/',requireAuth,homeRoutes);
app.use('/entries',requireAuth,entryRoutes);
// MIDDLEWARE ERROR
const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;