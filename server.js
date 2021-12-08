'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./assets/connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');


const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.set('view engine', 'pug');
// ----------------use----------------
fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());



// -------db_access------
myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  // ----routes-----
  routes(app, myDataBase);

  // ----user gestonaire-----
  auth(app, myDataBase);
  let currentUsers = 0;
  io.on('connection', (socket) => {
    ++currentUsers;
    io.emit('user count', currentUsers);
    console.log('A user has connected');
  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});


// ----------port_setting--------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
