const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber : {
        type: Number,
        required: true
    },
    userType: { // client, investor
        type: String,
        required: true
    },
    startupName: String, // Client
    domain: String, // Client
    companyAge: Number, // Client
    fundingType: { 
        type: String,
        required: true
    },
    capabilities: { // Investor
        minAmount: Number,
        maxAmount: Number
    },
    domainPreferences: [String], // Investor
    contactMode: String, // Investor
    description: String, // Client
    requests: [{
        type: {
            clientId: {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            requestStatus: Boolean
        }
    }], // Investor
    sentRequests: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }], // Client
    address: {
        type: {
            address1: String,
            address2: String,
            city: String,
            state: String,
            zip: String
        },
        required: true
    }
})

module.exports = mongoose.model('MiniUser', userSchema)