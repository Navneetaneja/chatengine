const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost:27017/ChatDB');

const db=mongoose.connection;

db.on('error',console.error.bind('error','Error connecting to MongoDB'));

db.once('open',function(){
    console.log("Database Connected Successfully !")
});

