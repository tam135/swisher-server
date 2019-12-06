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
          createdAt: doc.data().createdAt
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
    createdAt: new Date().toISOString()
  };

  db.collection("swishes")
    .add(newSwish)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.log(err);
    });
};

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

