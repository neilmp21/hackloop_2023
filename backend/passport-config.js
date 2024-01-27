const { authenticate } = require('passport')
const bcrypt = require('bcrypt');


const LocalStratergy = require('passport-local').Strategy
async function initialize(
    passport, getUserByEmail){

    const authenticateUser = async (email,password, done)=>{
        const user = getUserByEmail(email);
        if(user==null){
            return done(null,false,{message:"no user with that email"});
        }
        try{
         if(await bcrypt.compare(password,user.password)){
            return done(null,user,);
         }
         else {
            return done(null,false,{message:" password incorrect"});

         }
        }catch(error){
            return done(error);

        }
    }
      passport.use(new LocalStratergy({usernameField:'email'},authenticateUser));
      passport.serializeUser((user,done)=> done(null,user._id))
    passport.deserializeUser((id, done) =>{
        return done(null,  getUserById(id))})
}

module.exports = initialize;