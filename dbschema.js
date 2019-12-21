let db = {
  swishes: [
    {
      userHandle: "user",
      body: "this is a swish body",
      createdAt: "2019-11-22T21:44:18.861Z",
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      swishId: 'asdfasdfasdf',
      body: 'nice one brah',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true | false',
      swishId: 'asdfasdfasdf',
      type: 'like | comment',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: 'N4ASDF3MM2KLXXCJ123',
    email: 'user@gmail.com',
    handle: 'user',
    createdAt: '2019-03-15T10:59:52.798Z',
    imageUrl: 'image.jpeg',
    bio: 'Hi im teddy',
    website: 'www.google.com',
    location: 'london, UK'
  },
  likes:[
    {
      userHandle: 'user1',
      swishId: 'h31d1ion23d1'
    },
    {
      userHandle: 'user2',
      swishId: '1231wxion1'
    }
  ]
}