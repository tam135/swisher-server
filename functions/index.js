const express = require("express");
const app = express();
const functions = require('firebase-functions');

const { db } = require('./util/admin');

const { 
  getAllSwishes, 
  postOneSwish, 
  getSwish,
  commentOnSwish,
  likeSwish,
  dislikeSwish,
  deleteSwish 
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

app.delete('/swish/:swishId', FBAuth, deleteSwish)
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

exports.createNotificationOnLike = functions.region('us-east1').firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    db.doc(`/swishes/${snapshot.data().swishId}`).get()
      .then(doc => {
        if(doc.exists) {
          return db.doc(`/notifications/${snapshot.get.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            swishId: doc.id
          })
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err)
        return;
      })
  })