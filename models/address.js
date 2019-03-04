const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const AddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    emailAddress: {
        type: String,
        required: true
    }
});

AddressSchema.index({userId: 1, emailAddress: 1}, {unique: true});

const Address = mongoose.model('Address', AddressSchema);

module.exports = {Address};
