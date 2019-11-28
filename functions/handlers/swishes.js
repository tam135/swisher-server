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