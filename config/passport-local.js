const passport=require('passport');
const localStrategy=require('passport-local').Strategy;

const user=require('../model/user');

passport.use(new localStrategy({
    usernameField:'email'
},function(email,password,done){
    user.findOne({email:email},function(err,user){
        if(err)
        {
            console.log(err);
            return;
        }
        if(!user || user.password!==password){
            console.log("Invalid user");
            return done(null,false);
        }
        return done(null,user);
    })
}

));

passport.serializeUser(function(user,done){
    done(null,user.id);
})
passport.deserializeUser(function(id,done){
    user.findById(id,function(err,user){
        if(err){
            console.log(err);
            return;
        }
        return done(null,user);
    })
})

passport.checkAuthentication=function(req,res,next){
    if(req.isAuthenticated())
    return next();
    return res.redirect("/signin");
}
passport.setAuthenticationUser=function(req,res,next){
    if(req.isAuthenticated())
    {
        res.locals.user=req.user;
    }
    next();
}

module.exports=passport;

