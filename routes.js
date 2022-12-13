const express = require('express');
const router = express.Router();
const randToken = require('rand-token');
const socket = require('./socket');

let data = [];
// data store user's info, ex: 
/**
  { 
    token: // user verify,
    url: // user url,
    short: // shortened url
  }
*/

// handle reqeusts
router.post('/url', (req, res) => {
  const { token, url } = req.body;
  if (!url) {
    return socket.sendUser(token, { error: 'Please send url info' });
  }
  // generate shortened url
  const shortened = randToken.generate(Number(process.env.SHORTENED_LENGTH));

  // store user info
  data.push({
    token,
    url,
    short: shortened
  });

  // make response
  const response = {
    "shortenedURL": `${process.env.SERVER_LINK}/${shortened}`
  }

  // send data to user
  socket.sendUser(token, response);
});

router.post('/:url', (req, res) => {
  const { token } = req.body;
  const url = req.params.url;

  const userData = data.find(item => item.short == url);
  
  if (!userData) {
    return res.status(400).send({ error: "wrong url info" })
  }
  res.status(200).json({
    url: userData.url
  });
});

module.exports = router;