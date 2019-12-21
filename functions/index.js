const express = require("express");
const app = express();
const functions = require('firebase-functions');

const { 
  getAllSwishes, 
  postOneSwish, 
  getSwish,
  commentOnSwish,
  likeSwish,
  dislikeSwish 
} = require("./handlers/swishes");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,

} = require("./handlers/users");

const FBAuth = require('./util/fbAuth');

// Swishes route
app.get('/swishes', getAllSwishes);
app.post('/swish', FBAuth, postOneSwish);
app.get('/swish/:swishId', getSwish);

// TODO: delete swish route
app.get('/swish/:swishId/like', FBAuth, likeSwish);
app.get('/swish/:swishId/dislike', FBAuth, dislikeSwish)
// TODO: unlike a swish
app.post('/swish/:swishId/comment', FBAuth, commentOnSwish)

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);









exports.api = functions.https.onRequest(app);
