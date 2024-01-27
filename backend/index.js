const express = require('express');
const app= express();
const PORT =  3001;
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const initializePassport = require('./passport-config.js');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const { isLoggedIn }= require('./middlewares.js');
const { saveRedirectUrl } = require('./middlewares.js');
const passport =require('passport')
const wrapasync = require('./utils/wrapAsync.js')
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

// initializePassport(passport);



//importing for working with mongoDB
const mongoose = require('mongoose');
const MONGO_URL = 'mongodb://127.0.0.1:27017/Hackloop';
main().then(() => { console.log("connected to DB") }).catch(err => console.log(err));
//uploading image
const multer = require('multer');
const upload = multer;

//importing models
const Event = require('./models/event.js')
const User = require('./models/profile.js')



//middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend"));
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.engine("ejs", ejsMate);
app.use(flash()); //for messages while using site
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //neseccary cookies for working of autho?!

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//flashing
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    next();
});

async function main(){
    // every api is written inside this function
    //mongoose connectivirt is in here
    await mongoose.connect(MONGO_URL);



//authentification
    initializePassport(passport,
        async (email) => {
            try {
                const user = await User.findOne({ email });
                return user;
            } catch (error) {
                console.error("Error finding user by email:", error);
                throw error; // Handle the error as needed
            }
        });   
        
        

app.get("/login",(req,res)=>{
   res.render("Auth/signin-signup/index.ejs");
});
//     app.post("/login",saveRedirectUrl,passport.authenticate('local',
// {
//     successRedirect: "/",
//     failureRedirect:"/login",
//     failureFlash:true,
//         }),
// (req,res)=>{
//     req.flash("success", "Welcome to the site!");
//     let redirectUrl = res.locals.redirectUrl || "/";
//     console.log(req.flash('success'));
//     res.redirect(redirectUrl);
    
// }

//  );
//  app.post('/login', async (req, res, next) => {
//         const { username, password } = req.body.user;

//         try {
//             const user = await User.findOne({ username });

//             if (!user) {
//                 req.flash('error', 'Invalid username or password');
//                 console.log("wrong user");
//                 return res.redirect('/login');
//             }

//             // Check if the password is correct
//             const isPasswordValid = await user.authenticate(password);

//             if (!isPasswordValid) {
//                 req.flash('error', 'Invalid username or password');
//                 console.log("wrong password");
//                 return res.redirect('/login');
//             }

//             req.login(user, (err) => {
//                 if (err) {
//                     return next(err);
//                 }

//                 req.flash('success', 'Welcome to the site!');
//                 let redirectUrl = res.locals.redirectUrl || '/';
//                 res.redirect(redirectUrl);
//             });
//         } catch (error) {
//             console.error('Login error:', error);
//             req.flash('error', 'Login failed.');
//             res.redirect('/login');
//         }
//     });

  

    app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash:true
    }), async (req, res) => {
        try {
            req.flash('success', 'Welcome to the site!');
            let redirectUrl = res.locals.redirectUrl || '/';
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error', 'Login failed.');
            res.redirect('/login');
        }
    });


app.post("/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("error", "you are logged out!");
            console.log("logout succesful");
            res.redirect("/");


        });

    })

 app.get("/signup",(req,res)=>{
     res.render("Auth/signup.ejs");
 });


app.get("/",(req,res)=>{
    console.log("welcome to home page");
    
   req.flash('success',"welcome to home page") ;

    // console.log(req.flash('success'));
    res.render('home.ejs');
})    

    app.post("/signup", wrapasync(async (req, res) => {


        try {
            let { username, email, password } = req.body;
            let newUser = new User({ email: email, username: username });
            let registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }

                req.flash("Success", "Welcome to Our colony!");
                res.redirect("/");

            });
           

        }
        catch (e) {
            req.flash("error", e.message);
            // res.redirect("/signup")
            console.log(e);
        }
    }));

//Events
    app.get("/event", isLoggedIn,async(req,res)=>{
    const events= await Event.find();
    const dummyEvents = [
        {
            name: "Kush ka Birthday",
            description: "Bhai ka happy birthday",
            location: "Sabke dil me"
        },
        {
            name: "Community Picnic",
            description: "Enjoy a day of fun and food with the community",
            location: "Local Park"
        },
        {
            name: "Monthly Meeting",
            description: "Discuss community matters and share updates",
            location: "Community Center"
        }
        // Add more dummy events as needed
    ];
    //adding few dummy events
    if(events.length==0){
    const createdEvents = await Promise.all(dummyEvents.map(event => Event.create(event)));
    }
    res.render("Events/showEvents.ejs",{events})  //showing events
});

    app.get("/addevent", async (req, res) => {
        
        res.render("Events/eventAdmin.ejs")  //showing events
    });


app.post('/event',isLoggedIn,async(req,res)=>{
    // const {data}= req.body.event; //pass fields as objects from form eg event[name]
    const newevent = await Event.create( {...req.body.event });
    // console.log(createdEvents);
    console.log(req.body.event);
    res.redirect("/event");

})

app.delete("/event/:id",async(req,res)=>{
    const {id}= req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    console.log(id);
    res.redirect("/event");
})

//PROFILE
//see all the profiles from db
    app.get('/getProfiles', isLoggedIn, async(req, res) => {
        // const deleted = await User.deleteMany();
         const profiles =await User.find();
         console.log(profiles);
        //  console.log(deleted);
         res.render("profile/getProfiles.ejs",{profiles});
    });
//get form to add profile
   app.get("/createProfile",(req,res)=>{
    res.render("profile/profile.ejs");
    })
//adding data from form into db
app.post('/createProfile',async (req, res) => {
        
        const newProfile = await User.create({...req.body.user});
        console.log(newProfile);
        res.redirect('getProfiles');
    });

    app.delete("/profile/:id",async(req,res)=>{
        const {id} = req.params;
        const deleted = await User.findByIdAndDelete(id);
        console.log("deleted");
        res.redirect("/getProfiles");
    })



    app.delete('/deleteProfile/:id', (req, res) => {
        // const profileId = parseInt(req.params.id);
        // const index = profiles.findIndex(profile => profile.id === profileId);

        // if (index !== -1) {
        //     profiles.splice(index, 1);
        //     res.json({ success: true });
        // } else {
        //     res.status(404).json({ success: false, message: 'Profile not found' });
        // }
    });

app.listen(PORT,(req,res)=>{
    console.log(`listening at port ${PORT}`);
})

}