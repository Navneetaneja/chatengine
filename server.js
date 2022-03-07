const express=require('express');
const PORT=5000;
const database=require('./config/mongoose');
const passport = require('passport');
const passportlocal = require('./config/passport-local');
const User = require('./model/user');
const session = require('express-session');
const cookieparser=require('cookie-parser');
const app=express();

const chatserver=require('http').createServer(app);
const io=require('socket.io')(chatserver,{cors:{origin:'*'}});
const chats=require('./model/chats');

app.use(session({
    name: 'login',
    secret: 'xyz',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    }
}))

app.use(cookieparser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticationUser);

var error=null;

app.set('view engine','ejs');
app.set('views',__dirname+'/views');

app.use(express.static('./style'));
app.use(express.urlencoded({extended:true}));


io.on('connection',function(socket){
    console.log("token",socket.id);
    socket.on('message',(data)=>{
        var arr=data.split("-");
        chats.create({
            message:arr[0],
            sender:arr[1],
            senderId:arr[2]
        })
        // console.log(arr);
        socket.broadcast.emit('message',data);
        socket.emit('message',data);
    })
});

app.get('/', passport.checkAuthentication, function (req, res) {
    chats.find({},null,{sort:{createdOn:-1}},function(err,data){
        // console.log(data);
        return res.render('chat',{chatdata:data});
    })
})

app.get('/signin', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    error=null;
    return res.render('login',{error:error});
})

app.get('/signup', function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return res.render('signup',{error:error});
})

app.get('/signout',function(req,res){
    req.logOut();
    error=null;
    return res.redirect('/signin');
})

app.post("/login", passport.authenticate('local', { failureRedirect: "/signin" }), function (req, res) {
    error=null;
    return res.redirect('/');
})

app.post('/createuser', function (req, res) {

    if (req.body.password !== req.body.confirm_password) {
        console.log("password not matched");
        error="Passwords Not Matched !!";
        return res.redirect('back');
    }

    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return;
        }
        if (!user) {

            User.create(req.body, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                else
                {
                    error=null;
                    console.log(data);
                    return res.redirect('/signin');
                }
            });
        }
        else {
            error="User Already Exists";
            return res.redirect('/signup');
        }
    })

})

app.get('/*',function(req,res){
    res.redirect('/signin');
})



chatserver.listen(PORT,function(err){
    if(err){
        console.log(err);
        return;
    }
    console.log("Server is running at PORT",PORT);
})