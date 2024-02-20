const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    upvote:{
        type:Number,
        default:0
    },
    commentedBy:{
        type:String,
        default:"annonymous"
    },
    commentedAt:{
        type:Date,
        default:Date.now()
    }
    
    });

 const Comment = mongoose.model("Comment", commentSchema);
module.exports =Comment;