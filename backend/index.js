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
const fs = require('fs');

//image upload
const multer = require("multer");

const storagey = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/public/images')
    },
    filename: function (req, file, cb) {
    
        cb(null, Date.now()+"--"+ file.originalname);
    },
})
const upload = multer({ storage: storagey });

app.post("/single",upload.single('image'),(req,res)=>{ //image upload demo
    console.log(req.file);
res.send("image uploaded succesfully")
})
// initializePassport(passport);

//IMAGE DELETION

// Function to delete an image
const deleteImage = (imageName) => {
    const imagePath = path.join(__dirname, 'path/to/your/uploads', imageName);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(`Error deleting image: ${imageName}`, err);
        } else {
            console.log(`Image deleted successfully: ${imageName}`);
        }
    });
};

// Example usage:



 
//importing for working with mongoDB
const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://127.0.0.1:27017/Hackloop';
// const MONGO_URL ='mongodb+srv://kush:nnm22is077@cluster0.ug1qw6w.mongodb.net/'


main().then(() => { console.log("connected to DB") }).catch(err => console.log(err));
//uploading image


//importing models
const Event = require('./models/event.js')
const User = require('./models/profile.js')
const Issues = require('./models/issues.js');
const Comment = require('./models/comments.js');
const Issue = require('./models/issues.js');
const MaintenanceBill = require('./models/bill.js')


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
passport.use(User.createStrategy());

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




        
        

app.get("/login",(req,res)=>{
   res.render("Auth/signin-signup/index.ejs");
});
//sign in problem is here...middleware - line 70
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
            image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI6NoYGIhAmwbydE2LUX0jbjtKU_hFwQLtHQ&usqp=CAU",
            createdBy:"65bbc18bc14fa76e81326d6e"
        },
        {
            name: "Community Picnic",
            description: "Enjoy a day of fun and food with the community",
            location: "Local Park",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUWQg08FGpvKL61s7TwSAMXPY24LvV6Wl4xw&usqp=CAU",
            createdBy: "65bbc18bc14fa76e81326d6e"
        },
        {
            name: "Monthly Meeting",
            description: "Discuss community matters and share updates",
            location: "Community Center",
            createdBy: "65bbc18bc14fa76e81326d6e"
           
        }
        // Add more dummy events as needed
    ];
    //adding few dummy events
         req.curUser= req.user;
         const user = req.curUser;
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
        req.curUser= req.user;
        const user = req.curUser;
        
        res.render("Events/eventAdmin.ejs",{user});  //showing events
    });


    app.post('/event', upload.single('image'), async (req, res) => {
        // Extract the form data from req.body and req.file
        console.log(req.file)
        console.log(req.body);
        
        
        const eventData = {
            ...req.body.event,
            image: req.file.filename // assuming you want to save the filename
        };

        try {
            // Create a new event using the extracted data
            const newEvent = await Event.create(eventData);
            console.log(newEvent);

            // Redirect or send a response as needed
            res.redirect("/event");
        } catch (error) {
            // Handle errors appropriately
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });


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
        req.curUser = req.user;
        const user = req.curUser;
         
        //  console.log(profiles);
        //  console.log(deleted);
        
         res.render("profile/getProfiles.ejs",{profiles,user});// added admin visiblity
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
    //just updating not creting new
        console.log(newProfile);
        console.log("hello")
        res.redirect("/getProfiles");
    });

    app.delete("/profile/:id",async(req,res)=>{
        const {id} = req.params;
        const deleted = await User.findByIdAndDelete(id);
        console.log("deleted");
        res.redirect("/getProfiles");
    })


    //ISSUES
   
    // Index - show all issues
   // see the events route

    // New - show form to create a new issue
    app.get('/issues/new', (req, res) => {
        req.curUser = req.user;
        const user=req.curUser;
        // console.log(user);
        res.render("issues/add_issues.ejs",{user});
    });

    // Create - add a new issue to the database
    app.post('/addIssue', upload.array('uploadedImages', 10), async (req, res) => {
        try {
            const { title, description, status, createdBy } = req.body.issue;

            // Extract filenames from req.files
            const imageFilenames = req.files.map(file => file.filename);

            // Create a new issue with the extracted filenames
            const newIssue = new Issue({
                title,
                description,
                status,
                createdBy,
                images: imageFilenames,
            });

            const savedIssue = await newIssue.save();
            req.flash('success', 'Issue created successfully!');
            res.redirect('/event');
        } catch (error) {
            console.error('Error creating issue:', error);
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

          req.curUser= req.user;
         const curuser=req.curUser
         console.log(curuser);
            if (!issue) {
                req.flash('error', 'Issue not found');
                return res.redirect('/issues');
            }
            res.render('issues/display_issues.ejs', { issue,user,curuser });
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
    //delete comment
    
    app.delete("/comments/:issueId/:commentId", async (req, res) => {
        try {
            const { issueId, commentId } = req.params;

            // Find the issue by ID
            const issue = await Issues.findById(issueId);

            // Find the index of the comment with the given commentId
            const commentIndex = issue.Comments.findIndex(comment => comment._id.equals(commentId));

            // If the comment is found, remove it from the array
            if (commentIndex !== -1) {
                issue.Comments.splice(commentIndex, 1);

                // Save the updated issue
                await issue.save();

                req.flash('success', 'Comment deleted successfully!');
                res.redirect(`/issues/${issueId}`);
            } else {
                req.flash('error', 'Comment not found!');
                res.redirect(`/issues/${issueId}`);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            req.flash('error', 'Internal Server Error');
            res.redirect(`/issues/${issueId}`);
        }
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
    //status changes
    app.put("/Issues/status/:id",async(req,res)=>{
        const {id}=req.params;
        const {status} = req.body.issue;
        const updated_Issue = await Issues.findByIdAndUpdate(id,{status});
        console.log("Updated");
        res.redirect(`/event`);


    })

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
    // app.delete('/issue/:id', async (req, res) => {
    //     try {
    //         const { id } = req.params;

    //         // Fetch the issue from the database
    //         const issue = await Issues.findById(id);

    //         if (!issue) {
    //             return res.status(404).json({ error: 'Issue not found' });
    //         }

    //         // Delete associated images
    //         issue.images.forEach(deleteImage);

    //         // Delete the issue from the database
    //         await Issues.findByIdAndDelete(id);

    //         req.flash('success', 'Issue deleted successfully!');
    //         res.redirect('/event');
    //     } catch (error) {
    //         console.error('Error deleting issue:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // });

    app.use("/pre",(req,res)=>{
        res.render("Auth/signin-signup/prior_login.ejs")
    });

    //changing userType
   

app.put("/MakeAdmin/:id", async (req, res) => {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
        try {
            await User.findByIdAndUpdate(id, { Type: "ADMIN" }).populate();
            req.flash("success", "User updated to Admin");
            res.redirect("/getProfiles");
        } catch (error) {
            console.error("Error updating user to Admin: ", error);
            req.flash("error", "Error updating user to Admin, please try again.");
            res.redirect("/getProfiles");
        }
    } else {
        // Handle invalid id format
        console.error("Invalid ObjectId format");
        req.flash("error", "Invalid ObjectId format");
        res.redirect("/getProfiles");
    }
});

    app.put("/MakeUser/:id", async (req, res) => {
        const { id } = req.params;

        // Check if id is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            try {
                await User.findByIdAndUpdate(id, { Type: "USER" }).populate();
                req.flash("success", "Admin updated to User");
                res.redirect("/getProfiles");
            } catch (error) {
                console.error("Error updating admin to User: ", error);
                req.flash("error", "Error updating admin to user, please try again.");
                res.redirect("/getProfiles");
            }
        } else {
            // Handle invalid id format
            console.error("Invalid ObjectId format");
            req.flash("error", "Invalid ObjectId format");
            res.redirect("/getProfiles");
        }
    });


    app.get('/maintainanceForm',(req,res)=>{
        res.render("bills/form.ejs")
    })
    app.get("/showMaintance",async(req,res)=>{
        req.curUser=req.user;
        user=req.curUser;
         const all = await MaintenanceBill.find()
         console.log(all)
         res.render("bills/shhowbills.ejs",{all})

    })
    app.post('/addMaintenanceBill', async (req, res) => {
        try {
            const { billSubject, amount, dueDate } = req.body;

            // Create a new MaintenanceBill instance
            const newMaintenanceBill = new MaintenanceBill({
                billSubject,
                amount,
                dueDate,
            });

            // Save the instance to the database
            await newMaintenanceBill.save();

            // Redirect or respond as needed
            res.redirect('/'); // Redirect to home page, adjust as needed
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    


app.listen(PORT,(req,res)=>{
    console.log(`listening at port ${PORT}`);
})

}
