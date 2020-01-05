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
  getUserDetails,
  markNotificationsRead

} = require("./handlers/users");

const FBAuth = require('./util/fbAuth');

// Swishes route
app.get('/swishes', getAllSwishes);
app.post('/swish', FBAuth, postOneSwish);
app.get('/swish/:swishId', getSwish);

app.delete('/swish/:swishId', FBAuth, deleteSwish)
app.get('/swish/:swishId/like', FBAuth, likeSwish);
app.get('/swish/:swishId/dislike', FBAuth, dislikeSwish)
app.post('/swish/:swishId/comment', FBAuth, commentOnSwish)

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails)
app.post('/notifications', FBAuth, markNotificationsRead)


exports.api = functions.region('us-east1').https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('us-east1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/swishes/${snapshot.data().swishId}`)
      .get()
      .then(doc => {
        if(
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
          ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            swishId: doc.id
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  });
exports.deleteNotificationOnDislike = functions
  .region('us-east1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  })
//3:38:47
exports.createNotificationOnComment = functions
  .region("us-east1")
  .firestore.document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/swishes/${snapshot.data().swishId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            swishId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

