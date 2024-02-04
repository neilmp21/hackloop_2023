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
const Issues = require('./models/issues.js');
const Comment = require('./models/comments.js');
const Issue = require('./models/issues.js');


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

// passport.use(new LocalStrategy({

// }, User.authenticate()));
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

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

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        function async (req, res) {
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


app.get("/logout", (req, res, next) => {
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
    req.curUser= req.user;
   const user= req.curUser;
    // console.log(req.flash('success'));
    if(user){
    console.log(user._id);
console.log(req.curUser._id)}
    res.render('home.ejs',{user});
})    

    app.post("/signup", wrapasync(async (req, res) => {


        try {
            let { username, email, password } = req.body;
            let newUser = new User({ email: email, username: username });
            let registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
          req.login(registeredUser, async (err) => {
                if (err) {
                    return next(err);
                }
               req.user = await User.findOne({ where: { username: username } });
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
    app.get("/event", async (req, res) => {   //,isLoggedIn
     const issues = await Issues.find();
    const events= await Event.find();

    const dummyEvents = [
        {
            name: "Kush ka Birthday",
            description: "Bhai ka happy birthday",
            location: "Sabke dil me",
            image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI6NoYGIhAmwbydE2LUX0jbjtKU_hFwQLtHQ&usqp=CAU"
        },
        {
            name: "Community Picnic",
            description: "Enjoy a day of fun and food with the community",
            location: "Local Park",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUWQg08FGpvKL61s7TwSAMXPY24LvV6Wl4xw&usqp=CAU"
        },
        {
            name: "Monthly Meeting",
            description: "Discuss community matters and share updates",
            location: "Community Center",
           
        }
        // Add more dummy events as needed
    ];
    //adding few dummy events
       
         const user = req.curUSer;
        // console.log(req.flash('success'));
        if (user) {
            console.log(user._id);
        }
    if(events.length==0){
    const createdEvents = await Promise.all(dummyEvents.map(event => Event.create(event)));
    }
    if(user){
    res.render("Events/showEvents.ejs",{events,issues,user})  //showing events
    }
    else{
        res.render("Events/showEvents.ejs", { events, issues, user })

    }
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
    app.get('/getProfiles', async (req, res) => {//, isLoggedIn
        // const deleted = await User.deleteMany();
         const profiles =await User.find();
        //  console.log(profiles);
        //  console.log(deleted);
        
         res.render("profile/getProfiles.ejs",{profiles});
    });
//get form to add profile
   app.get("/createProfile",(req,res)=>{
       const user = req.user;
    // console.log(user);
    res.render("profile/profile.ejs",{user});
    })
//adding data from form into db
app.post('/createProfile',async (req, res) => {
    const { username, ...updatedFields } = req.body.user;
    const newProfile = await User.findOneAndUpdate({ username }, updatedFields, { new: true });
    
        console.log(newProfile);
        res.redirect("/getProfiles");
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

    //ISSUES
   
    // Index - show all issues
   // see the events route

    // New - show form to create a new issue
    app.get('/issues/new', (req, res) => {
        req.curUser = req.user;
        const user=req.curUser;
        console.log(user);
        res.render("issues/add_issues.ejs",{user});
    });

    // Create - add a new issue to the database
    app.post('/addIssue',  async (req, res) => { //isLoggedIn,
        try {
            const { title, description, status, createdBy } = req.body;
            const newIssue = new Issues({ title, description, status, createdBy });
            const savedIssue = await newIssue.save();
            req.flash('success', 'Issue created successfully!');
            res.redirect('/event');
        } catch (error) {
            console.error('Error creating issue:', error.message);
            res.status(500).send('Internal Server Error');
        }
    });

    // Show - display details of a specific issue
    app.get('/issues/:id', async (req, res) => { // isLoggedIn,
        try {
            const { id } = req.params;
            const issue = await Issues.findById(id).populate("Comments");
            const {createdBy}= issue;
            console.log(createdBy);
            const user = await User.findById(createdBy);
            console.log("user found by is params",user);

            if (!issue) {
                req.flash('error', 'Issue not found');
                return res.redirect('/issues');
            }
            res.render('issues/display_issues.ejs', { issue,user });
        } catch (error) {
            console.error('Error fetching issue details:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    // COMMENTS 
    app.post("/comments/:id", async(req,res)=>{
        const {id} = req.params; //issueId
        req.curUser = req.user;
        const user = req.curUser;
        const {comment} = req.body;
       console.log(comment);  
    const newComment= new Comment({
            commentedBy:user.username,
            comment: comment,
        });    
        const Issue= await Issues.findById(id);

            Issue.Comments.push(newComment);
            await Issue.save();
            await newComment.save();

            res.redirect(`/issues/${id}`);
 
        console.log(id);

    });
    //comment upvote
    app.put('/comments/:id/:iid', async (req, res) => {
        const { id,iid } = req.params;
        console.log(id);
        console.log(iid);//issue id...used for redirecting

        try {
            const comment = await Comment.findByIdAndUpdate(
                id,
                { $inc: { upvote: 1 } }, // Increment upvotes by 1
                { new: true } // Return the updated document
            );

            if (!comment) {
                req.flash('error', 'Comment not found');
                return res.redirect('/issues'); // Redirect to appropriate page
            }

            // Redirect to the issue details page or another appropriate page
            res.redirect(`/Issues/${iid}`);
        } catch (error) {
            console.error('Error updating upvotes for comment:', error);
            res.status(500).send('Internal Server Error');
        }
    });


    // Edit - show form to edit a specific issue
    app.get('/issues/:id/edit', async (req, res) => { //, isLoggedIn
        try {
            const { id } = req.params;
            const issue = await Issues.findById(id);
            if (!issue) {
                req.flash('error', 'Issue not found');
                return res.redirect('/issues');
            }
            res.render('issues/edit', { issue });
        } catch (error) {
            console.error('Error fetching issue for edit:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    // Update - update a specific issue in the database
    app.put('/issues/:id', async (req, res) => { // isLoggedIn,
        try {
            const { id } = req.params;
            const { title, description, status } = req.body.issue;
            const updatedIssue = await Issues.findByIdAndUpdate(id, { title, description, status }, { new: true });
            req.flash('success', 'Issue updated successfully!');
            res.redirect(`/issues/${id}`);
        } catch (error) {
            console.error('Error updating issue:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    //upvotes
    // Update - update a specific issue in the database
    app.put('/issues/upvote/:id', async (req, res) => { // isLoggedIn,
        const { id } = req.params;

        try {
            const issue = await Issues.findByIdAndUpdate(
                id,
                { $inc: { upvote: 1 } }, // Increment upvotes by 1
                { new: true } // Return the updated document
            );

            if (!issue) {
                req.flash('error', 'Issue not found');
                return res.redirect('/issues');
            }

            res.redirect("/event")
        } catch (error) {
            console.error('Error updating upvotes:', error);
            res.status(500).send('Internal Server Error');
        }

    });

    // Delete - remove a specific issue from the database
    app.delete('/issue/:id', async (req, res) => { // isLoggedIn,
        try {
            const { id } = req.params;
            const deletedIssue = await Issues.findByIdAndDelete(id);
            req.flash('success', 'Issue deleted successfully!');
            res.redirect('/event');
        } catch (error) {
            console.error('Error deleting issue:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    


app.listen(PORT,(req,res)=>{
    console.log(`listening at port ${PORT}`);
})

}