const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')
const User = require('../models/User')

// Welcome Page
router.get('/', checkAuth, (req, res) => res.render('welcome'))
router.get('/about', (req, res) => res.render('about'))

// Displaying Dashboards
router.get('/clientDashboard', ensureAuthenticated, (req, res) => {
    if(req.user.userType === 'Client') {

        const { name } = req.user

        res.render('clientDashboard', {name, logout:true})
    }
    else {
        req.flash('error', 'This mail is not registered')
        res.redirect('/users/client/login')
    }
    
})
router.get('/investorDashboard', ensureAuthenticated, async (req, res) => {
    if(req.user.userType === 'Investor') {

        const { name } = req.user

        const clients = []

        for(let i = 0; i < req.user.requests.length; i++) {
            if(req.user.requests[i].requestStatus === false){
                const client = await User.findById(req.user.requests[i].clientId)
                clients.push(client)
            }
        }

        res.render('investorDashboard', {name, clients, logout:true})
    }
    else {
        req.flash('error', 'This mail is not registered')
        res.redirect('/users/investor/login')
    }
})

// Handling accept request functionality:
router.post('/investorDashboard', async (req, res) => {
    if(req.user.userType === 'Investor') {

        const investor = await User.findById(req.user.id)

        for(let j = 0; j < investor.requests.length; j++) {
            const client = await User.findById(investor.requests[j].clientId)
            if(client.email === req.body.email) {
                console.log('accepted')
                investor.requests[j].requestStatus = true
                await investor.save()
            }
        }

        req.flash('success_msg', 'You accepted the client request successfully!')
        res.redirect('/investorDashboard')

    }
    else {
        req.flash('error', 'This mail is not registered')
        res.redirect('/users/investor/login')
    }
})

function checkAuth (req, res, next) {
    if(typeof req.user !== 'undefined') {
        if(req.user.userType === 'Client')
            res.redirect('/clientDashboard')
        if(req.user.userType === 'Investor')
            res.redirect('/investorDashboard')
    } else {
        next()
    }
}

module.exports = router