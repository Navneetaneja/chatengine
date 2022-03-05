const mongoose=require('mongoose');

const chatSchema=new mongoose.Schema({
    message:{
        type:String,
        required:true
    },
    sender:{
        type:String,
        required:true,
    },
    senderId:{
        type:Object,
        required:true
    }
},{
    timestamps:true
})

const chats=mongoose.model('chats',chatSchema);

module.exports=chats;