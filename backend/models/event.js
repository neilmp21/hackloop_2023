const mongoose = require('mongoose');
const { Schema } = mongoose;


const EventSchema = new Schema({
    image:{
        data:Buffer,
        type:String,
        //set: (v) => v === "" ? "https://images-cdn.ubuy.co.in/6551ea864782661a34425ae5-tree-of-life-wall-art-decor-metal.jpg" : v,
        default: "data:image/jpeg;base64,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",
    },
    Name:{
        type:String,
        
    },
    date:{
       type: Date,
       default:Date.now,

    },
    description:{
        type:String,
    },
    location:{
        type:String,
    }
});

module.exports = new mongoose.model("Event",EventSchema);
