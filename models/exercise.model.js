const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema ({
    username: {
        type: String, 
        required: true 
    },
    exercise: [{
        description: {type: String, required: true },
        duration: {type: Number, required: true },
        date: {type: String, required: true }
    }]
},{
    timestamps:true,
});




const exerciseModel = mongoose.model('exerciseModel', exerciseSchema);

module.exports = exerciseModel;