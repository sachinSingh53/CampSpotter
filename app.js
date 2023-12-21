if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
// const {campgroundSchema,reviewSchema}=require('./schemas')
// const catchAsync=require('./utils/catchAsync');

// const Campground=require('./models/campground');
// const Review = require('./models/review');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const User=require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const usersRoutes = require('./routes/user');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL;

// 'mongodb://127.0.0.1:27017/yelp-camp'


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    // useNewUrlParser: true,
    // // useCreateIndex:true,
    // useUnifiedTopology:true
});



const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const app=express();



//middleware...............................................................................................................
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')));

// app.use((req,res,next)=>{
//     // req.method = 'GET';
//     req.requetTime = Date.now();
//     console.log(req.method.toUpperCase(), req.path);
//     next();
// })

//..........................................................................................................................


//----------------------session Configuration----------------------------------------
const store = new MongoStore({
    url: dbUrl,
    secret:'thisismysecret',
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("Session Error",e);
})
const sessionConfig = {
    store,
    secret:'thisismysecret',
    resave: false,

    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()*1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }

}
app.use(session(sessionConfig));
app.use(flash());

//-----------------------------------------------------------------------------------

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.currentUser = req.user;  
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes); 
app.use('/',usersRoutes);

app.get('/',(req,res)=>{
   res.render('home');
})




app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500}=err;
    if(!err.message) err.message="Oh No, Something Went Wrong"
    res.status(statusCode).render('error',{err});
})

app.listen(3000,() => {
    console.log("listning on port 3000");
})