const express = require("express");
const app = express();
const functions = require('firebase-functions');

const { getAllSwishes, postOneSwish } = require('./handlers/swishes')
const { signup, login, uploadImage, addUserDetails } = require('./handlers/users')


const FBAuth = require('./util/fbAuth');


// Swishes route
app.get('/swishes', getAllSwishes)
app.post("/swish", FBAuth, postOneSwish);
app.post('/user', FBAuth, addUserDetails)

// Users routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)








exports.api = functions.https.onRequest(app);
