const User = require('../models/User')

const bcrypt = require('bcryptjs')
const passport = require('passport')
const mongoose = require('mongoose')

const register = (req, res) => {
    const { name, email, password, password2, phoneNumber, startupName, domain, companyAge, description, fundingType, address1, address2, city, state, zip } = req.body
    let errors = []

    // Check required fields
    if(!name || !email || !password || !password2 || !phoneNumber || !startupName || !domain || !companyAge || !description || !fundingType || !address1 || !address2 || !city || !state || !zip) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    // Check passwords match
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    // Check pass length
    if(password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if(errors.length > 0) {
        res.render('register', { errors, name, email, password, password2, phoneNumber, startupName, domain, companyAge, description, fundingType, address1, address2, city, state, zip, userType: 'Client' })
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(client => {
                if(client) {
                    // Client exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', { errors, name, email, password, password2, phoneNumber, startupName, domain, companyAge, description, fundingType, address1, address2, city, state, zip, userType: 'Client' })
                } else {
                    const newUser = new User({ name, email, password, startupName, phoneNumber, domain, companyAge, description, fundingType,
                        address: {
                            address1,
                            address2,
                            city,
                            state,
                            zip
                        },
                        userType: 'Client'
                    })

                    // Hashed Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err

                            // Set password to hashed
                            newUser.password = hash
                            // Save Client
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are successfully registered. You can login!')
                                    res.redirect('/users/client/login')
                                })
                                .catch(error => console.log(error))
                        })
                    })
                }
            })
    }
}

const profileEdit = (req, res) => {
    if(typeof req.user === 'undefined') {
        res.redirect('/')
    }

    const { name, email, password, newPassword, newPassword2, phoneNumber, startupName, domain, companyAge, description, fundingType, address } = req.user

    res.render('profileEdit', { name, email, password, newPassword, newPassword2, phoneNumber, startupName, domain, companyAge, description, fundingType, address1:address.address1, address2:address.address2, city:address.city, state:address.state, zip:address.zip, userType:'Client', logout:true })
}

const profileEditHandler = async (req, res) => {
    
    let errors = []
    const { name, email, password, newPassword, newPassword2, phoneNumber, startupName, domain, companyAge, description, fundingType, address1, address2, city, state, zip } = req.body
    
    const user = await User.findOne({ email:req.user.email })

    user.name = name
    user.startupName = startupName
    user.phoneNumber = phoneNumber
    user.domain = domain
    user.companyAge = companyAge
    user.description = description
    user.fundingType = fundingType
    user.address = {
        address1,
        address2,
        city,
        state,
        zip
    }

    if(newPassword !== '') {
        bcrypt.compare(password, user.password, (err, isMatch) =>{
            if(err) console.log(err)

            if(isMatch) {
                if(newPassword !== newPassword2) {
                    errors.push({ msg: 'Passwords do not match' })
                }
            
                // Check pass length
                if(newPassword.length < 6) {
                    errors.push({ msg: 'Password should be atleast 6 characters' })
                }

                if(errors.length === 0) {
                    // Hashed Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            if(err) throw err
        
                            // Set password to hashed
                            user.password = hash
                            // Save Client
                            user.save()
                                .then(user => {
                                    req.flash('success_msg', 'Successfully saved changes!')
                                    res.redirect('/users/client/profileEdit')
                                })
                                .catch(error => console.log(error))
                        })
                    })
                } else {
                    req.flash('error_msg', 'New Passwords are not matching!')
                    res.redirect('/users/client/profileEdit')
                }
            } else {
                req.flash('error_msg', 'Wrong Password!')
                res.redirect('/users/client/profileEdit')
            }
        })
    } else {
        await user.save()

        req.flash('success_msg', 'Successfully saved changes!')
        res.redirect('/users/client/profileEdit')
    }

}

const displayAngel = async (req, res) => {
    const investors = await User.find({ userType:'Investor', fundingType:'Angel Funding' })
    res.render('findingInvestor', { investors, fund:'Angel', logout:true })
}

const displayCrowd = async (req, res) => {
    const investors = await User.find({ userType:'Investor', fundingType:'Crowd Funding' })
    res.render('findingInvestor', { investors, fund:'Crowd', logout:true  })
}

const displaySeed = async (req, res) => {
    const investors = await User.find({ userType:'Investor', fundingType:'Seed Funding' })
    res.render('findingInvestor', { investors, fund:'Seed', logout:true  })
}

const requestAngel = async (req, res) => {

    const investor = await User.findOne({ email:req.body.email })

    investor.requests.push({ clientId:req.user.id, requestStatus:false })
    await investor.save()

    const client = await User.findOne({ email: req.user.email })
    client.sentRequests.push(investor.id)
    await client.save()

    req.flash('success_msg', 'Request sent Successfully!')
    res.redirect('/users/client/angel')
}

const requestCrowd = async (req, res) => {

    const investor = await User.findOne({ email:req.body.email })

    investor.requests.push({ clientId:req.user.id, requestStatus:false })
    await investor.save()

    const client = await User.findOne({ email: req.user.email })
    client.sentRequests.push(investor.id)
    await client.save()

    req.flash('success_msg', 'Request sent Successfully!')
    res.redirect('/users/client/crowd')
}

const requestSeed = async (req, res) => {

    const investor = await User.findOne({ email:req.body.email })

    investor.requests.push({ clientId:req.user.id, requestStatus:false })
    await investor.save()

    const client = await User.findOne({ email: req.user.email })
    client.sentRequests.push(investor.id)
    await client.save()

    req.flash('success_msg', 'Request sent Successfully!')
    res.redirect('/users/client/seed')
}

const sentRequests = async (req, res) => {
    if(typeof req.user === 'undefined') res.redirect('/')

    const investors = []

    for(let i = 0; i < req.user.sentRequests.length; i++) {
        const investor = await User.findById(req.user.sentRequests[i])
        for(let j = 0; j < investor.requests.length; j++) {
            const client = await User.findById(investor.requests[j].clientId)
            if(client.email === req.user.email) {
                if(investor.requests[j].requestStatus === true)
                    investors.push(investor)
            }
        }
    }

    res.render('acceptedRequests', {investors, logout:true})

}

const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/clientDashboard',
        failureRedirect: '/users/client/login',
        failureFlash: true
    })(req, res, next)
}

module.exports = { 
    register, 
    profileEdit, profileEditHandler, 
    displayAngel, displayCrowd, displaySeed,
    requestAngel, requestCrowd, requestSeed,
    sentRequests,
    login,
}