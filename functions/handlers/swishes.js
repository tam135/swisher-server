const { db } = require('../util/admin')

exports.getAllSwishes = (req, res) => {
  db.collection("swishes")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let swishes = [];
      data.forEach(doc => {
        swishes.push({
          swishId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          userImage: doc.data().userImage
        });
      });
      return res.json(swishes);
    })
    .catch(err => console.error(err));
};

exports.postOneSwish = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  const newSwish = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount:0,
    commentCount: 0
  };

  db.collection("swishes")
    .add(newSwish)
    .then(doc => {
      const resSwish = newSwish;
      resSwish.swishId = doc.id;
      res.json(resSwish);
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.log(err);
    });
};

// Fetch on swish
exports.getSwish = (req, res) => {
  let swishData = {};
  db.doc(`/swishes/${req.params.swishId}`)
    .get()
    .then((doc) => {
      if(!doc.exists) {
        return res.status(404).json({ error: 'Swish not found' })
      }
      swishData = doc.data();
      swishData.swishId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('swishId', '==', req.params.swishId)
        .get();
    })
      .then((data) => {
        swishData.comments = [];
        data.forEach((doc) => {
          swishData.comments.push(doc.data())
        });
        return res.json(swishData);
      })
      .catch(err => {
        console.error(err)
        return res.status(500).json({ error: err.code })
      });
}; 

// Comment on a swish
exports.commentOnSwish = (req,res) => {
  if(req.body.body.trim() === '') {
    return res.status(400).json({ comment: 'Must not be empty' })
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    swishId: req.params.swishId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/swishes/${req.params.swishId}`)
    .get()
    .then((doc) => {
      if(!doc.exists) {
        return res.status(404).json({ error: 'Swish not found'})
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1})
    })
    .then(() => {
      return db.collection('commments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: 'Something went wrong' });
    })
}

// Like a swish
exports.likeSwish = (req,res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('swishId', '==', req.params.swishId)
    .limit(1)
  
  const swishDocument = db.doc(`/swishes/${req.params.swishId}`);

  let swishData;

  swishDocument
    .get()
    .then(doc => {
      if(doc.exists) {
        swishData = doc.data();
        swishData.swishId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Swish not found' })
      }
    })
    .then(data => {
      if(data.empty) {
        return db
        .collection('likes')
        .add({
          swishId: req.params.swishId,
          userHandle: req.user.handle
        })
        .then(() => {
          swishData.likeCount++
          return swishDocument.update({ likeCount: swishData.likeCount})
        })
        .then(() => {
          return res.json(swishData);
        })
      } else {
        return res.status(400).json({ error: 'Swish already liked' })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err.code })
    })
}

exports.dislikeSwish = (req, res) => {
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('swishId', '==', req.params.swishId).limit(1)

  const swishDocument = db.doc(`/swishes/${req.params.swishId}`);

  let swishData;

  swishDocument.get()
    .then(doc => {
      if (doc.exists) {
        swishData = doc.data();
        swishData.swishId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Swish not foudn' })
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Swish not liked' })
      } else {
        return db.doc(`/likes/${data.docs[0].id}`).delete()
          .then(() => {
            swishData.likeCount--;
            return swishDocument.update({ likeCount: swishData.likeCount});
          })
          .then(() => {
            res.json(swishData)
          })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err.code })
    })
}

// Delete a swish
exports.deleteSwish = (req, res) => {
  const document = db.doc(`/swishes/${req.params.swishId}`);
  document.get()
    .then(doc => {
      if(!doc.exists) {
        return res.status(404).json({ error: 'Swish not found'});
      }
      if(doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized'});
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Swish deleted successfully'});
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

