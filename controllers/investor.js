const User = require('../models/User')

const bcrypt = require('bcryptjs')
const passport = require('passport')
const mongoose = require('mongoose')

const register = (req, res) => {
    const { name, email, password, password2, phoneNumber, fundingType, minAmount, maxAmount, domainPreferences, contactMode, description, address1, address2, city, state, zip } = req.body
    let errors = []

    // Check required fields
    if(!name || !email || !password || !password2 || !phoneNumber || !fundingType || !minAmount || !maxAmount || !domainPreferences || !contactMode || !description || !address1 || !address2 || !city || !state || !zip) {
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
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            phoneNumber,
            fundingType,
            minAmount, 
            maxAmount, 
            domainPreferences, 
            contactMode, 
            description,
            address1,
            address2,
            city,
            state,
            zip,
            userType: 'Investor'
        })
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(client => {
                if(client) {
                    // Client exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        phoneNumber,
                        fundingType,
                        minAmount, 
                        maxAmount, 
                        domainPreferences, 
                        contactMode, 
                        description,
                        address1,
                        address2,
                        city,
                        state,
                        zip,
                        userType: 'Investor'
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                        phoneNumber,
                        fundingType,
                        capabilities: {
                            minAmount, 
                            maxAmount
                        }, 
                        domainPreferences, 
                        contactMode, 
                        description,
                        userType: 'Investor',
                        address: {
                            address1,
                            address2,
                            city,
                            state,
                            zip
                        }
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
                                    res.redirect('/users/investor/login')
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

    const { name, email, password, newPassword, newPassword2, phoneNumber, fundingType, capabilities, domainPreferences, contactMode, description, address } = req.user

    res.render('profileEdit', { name, email, password, newPassword, newPassword2, phoneNumber, fundingType, minAmount:capabilities.minAmount, maxAmount:capabilities.maxAmount, domainPreferences, contactMode, description, address1:address.address1, address2:address.address2, city:address.city, state:address.state, zip:address.zip, userType:'Investor', logout:true })
}

const profileEditHandler = async (req, res) => {
    let errors = []

    const { name, email, password, newPassword, newPassword2, phoneNumber, fundingType, minAmount, maxAmount, domainPreferences, contactMode, description, address1, address2, city, state, zip } = req.body
    
    const user = await User.findOne({ email:req.user.email })

    user.name = name
    user.phoneNumber = phoneNumber
    user.description = description
    user.fundingType = fundingType
    user.minAmount = minAmount
    user.maxAmount = maxAmount
    user.domainPreferences = domainPreferences
    user.contactMode = contactMode
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
                    res.redirect('/users/investor/profileEdit')
                }
            } else {
                req.flash('error_msg', 'Wrong Password!')
                res.redirect('/users/investor/profileEdit')
            }
        })
    } else {
        await user.save()

        req.flash('success_msg', 'Successfully saved changes!')
        res.redirect('/users/investor/profileEdit')
    }

}

const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/investorDashboard',
        failureRedirect: '/users/investor/login',
        failureFlash: true
    })(req, res, next)
}

module.exports = {
    register,
    profileEdit, profileEditHandler,
    login,
}