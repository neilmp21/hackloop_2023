const express = require('express');
const app= express();
const PORT =  3001;
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');

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


async function main(){
    // every api is written inside this function
    //mongoose connectivirt is in here
    await mongoose.connect(MONGO_URL);

app.get("/",(req,res)=>{
    console.log("welcome to home page");
    res.render('home.ejs')
})    

//Events
app.get("/event",async(req,res)=>{
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
        
        res.render("Events/addEvents.ejs")  //showing events
    });


app.post('/event',async(req,res)=>{
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
 app.get('/getProfiles', async(req, res) => {
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