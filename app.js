require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');

// Database Connection
const dbUrl = process.env.DB_URL;
const dbUrlLocal = 'mongodb://localhost:27017/sBus';
mongoose.connect(dbUrlLocal, {
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

// App initialization
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
const store = MongoStore.create({
    mongoUrl: dbUrlLocal,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    },
});

const sessionConfig = {
    store,
    secret: process.env.SECRET || 'secret', // Fallback secret if not in env
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use('user-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        // Find the user by username
        const user = await User.findOne({ username: username });
        if (!user) {
            return done(null, false, { message: 'Unknown username' });
        }

        // Use passport-local-mongoose's authenticate method to verify the password
        user.authenticate(password, (err, authenticatedUser, passwordError) => {
            if (err) return done(err);
            if (!authenticatedUser) {
                return done(null, false, { message: 'Invalid password' });
            }
            return done(null, authenticatedUser);
        });
    } catch (err) {
        return done(err);
    }
}));

// Universal serializeUser and deserializeUser (User or Admin or Owner)
passport.serializeUser((entity, done) => {
    // Check the type of the entity and serialize accordingly
    let type;
    if (entity instanceof User) {
        type = 'User';
    } else if (entity instanceof Admin) {
        type = 'Admin';
    } else if (entity instanceof Owner) {
        type = 'Owner';
    } else {
        return done(new Error('Unknown entity type'));
    }
    
    // Serialize the entity with id and type
    done(null, { id: entity.id, type });
});

passport.deserializeUser(async ({ id, type }, done) => {
    let Model;
    
    // Determine which model to use based on the type
    if (type === 'User') {
        Model = User;
    } else if (type === 'Admin') {
        Model = Admin;
    } else if (type === 'Owner') {
        Model = Owner;
    } else {
        return done(new Error('Unknown entity type'));
    }
    
    try {
        // Find the entity by id and pass it to done
        const entity = await Model.findById(id);
        done(null, entity);
    } catch (err) {
        done(err);
    }
});

// Global middleware to set locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Routes
app.use('/', userRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);

// Home Route
app.get('/', (req, res) => {
    if(req.user && req.user.type === 'owner') {
        res.redirect('/owners/dashboard');
    } else if(req.user && req.user.type === 'admin') {
        res.redirect('/admins/dashboard')
    } else if(req.user && req.user.type === 'user') {
        res.redirect('/dashboard')
    } else {
        res.render('users/login')
    }
})

// 404 Handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// Start the server
app.listen(3000, () => {
    console.log('Serving on port 3000');
});