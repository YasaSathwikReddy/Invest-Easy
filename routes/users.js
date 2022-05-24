const clientController = require('../controllers/client')
const investorController = require('../controllers/investor')

const express = require('express')

const router = express.Router()

//  
router.get('/client', (req, res) => res.render('user', {userType: 'Client'}))
router.get('/investor', (req, res) => res.render('user', {userType: 'Investor'}))

// Login page
router.get('/client/login', (req, res) => res.render('login', {userType: 'Client'}))
router.get('/investor/login', (req, res) => res.render('login', {userType: 'Investor'}))

// Registration page
router.get('/client/register', (req, res) => res.render('register', {userType: 'Client'}))
router.get('/investor/register', (req, res) => res.render('register', {userType: 'Investor'}))

// Register handle
router.post('/client/register', clientController.register)
router.post('/investor/register', investorController.register)

// Edit user profile
router.get('/client/profileEdit', clientController.profileEdit)
router.get('/investor/profileEdit', investorController.profileEdit)

// Profile edit handle
router.post('/client/profileEdit', clientController.profileEditHandler)
router.post('/investor/profileEdit', investorController.profileEditHandler)

// Displaying Investors to Client:
router.get('/client/angel', clientController.displayAngel)
router.get('/client/crowd', clientController.displayCrowd)
router.get('/client/seed', clientController.displaySeed)

// Handling sent request from client to investor:
router.post('/client/angel', clientController.requestAngel)
router.post('/client/crowd', clientController.requestCrowd)
router.post('/client/seed', clientController.requestSeed)

// Displaying sent request and showing the info
router.get('/client/sentRequests', clientController.sentRequests)

// Login Handle
router.post('/client/login', clientController.login)
router.post('/investor/login', investorController.login)

// Logout handle
router.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

module.exports = router