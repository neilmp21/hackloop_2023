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
    upvotedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User', // Assuming your user model is named 'User'
        },
    ],
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