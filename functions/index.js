const functions = require('firebase-functions');

const { getAllSwishes, postOneSwish } = require('./handlers/swishes')
const { signup, login } = require('./handlers/users')

const express = require('express');
const app = express();
const FBAuth = require('./util/fbAuth');



// Swishes route
app.get('/swishes', getAllSwishes)
app.post("/swish", FBAuth, postOneSwish);

// Users routes
app.post('/signup', signup)
app.post('/login', login)








exports.api = functions.https.onRequest(app);
