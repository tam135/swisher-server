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

exports.createNotificationsOnComment = functions
  .region('us-east1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/swishes/${snapshot.data().swishId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
      });
  })

exports.onUserImageChange = functions
  .region('us-east1')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if(change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      let batch = db.batch();
      return db
        .collection("swishes")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const swish = db.doc(`/swishes/${doc.id}`);
            batch.update(swish, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  })

exports.onSwishDelete = functions
  .region("us-east1")
  .firestore.document("/swishes/{swishId}")
  .onDelete((snapshot, context) => {
    const swishId = context.params.swishId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("swishId", "==", swishId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("swishId", "==", swishId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db.collection("notifications").where("swishId", "==", swishId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err))
  })




