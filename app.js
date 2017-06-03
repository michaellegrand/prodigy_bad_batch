// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// [START config]
var pg            = require('pg');
var format        = require('util').format;
var express       = require('express');
var twilio        = require('twilio') (process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var TwimlResponse = require('twilio').TwimlResponse;
var bodyParser    = require('body-parser').urlencoded({extended: false});
var CryptoHelper  = require('./cryptoHelper');
var AdminActions  = require('./adminActions');
var UserActions   = require('./userActions');
var VoiceActions  = require('./voiceActions');
var WebAdmin      = require('./webAdmin');


var app      = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var G = {
  twilio:           twilio,
  adminActions:     new AdminActions(),
  userActions:      new UserActions(),
  voiceActions:     new VoiceActions(),
  cryptoHelper:     new CryptoHelper(),
};


//Trying global clients instead of 1 per message.
pg.defaults.ssl = true;
var appClient;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
    console.log('App client Connected to db');
    appClient = client;
});

var userClient;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
    console.log('User client Connected to db');
    userClient = client;
});

var historyClient;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
    console.log('History client Connected to db');
    historyClient = client;
});

var webAdminClient;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
    console.log('WebAdmin client Connected to db');
    webAdminClient = client;
});


function doAction(res, sender, body)
{
  var messageHandled = G.adminActions.doAdminAction(G, res, userClient, sender, body);
  if (messageHandled) return;

  insertUser(res, sender, body, function() {
    storeMessageHistory(G, res, userClient, sender, body, function(messageHistory) {
      G.userActions.doUserAction(G, res, userClient, sender, body, messageHistory);
    });
  });
}

function insertUser(res, sender, body, callback)  {

  var cryptoSender = G.cryptoHelper.encrypt(sender);
  var date = new Date();
  var timestamp = date.toGMTString();
  var insertQueryString = "INSERT INTO users (phone_number, message_body, timestamp) VALUES ('" + cryptoSender + "', '" + body + "', '" + timestamp + "')";
  var insertQuery = appClient.query(insertQueryString);
  insertQuery.on('error', function() {
    console.log("It's cool we're already in here.");
    if (callback) callback();
  });
  insertQuery.on('end', function() {
    console.log("New User Added.");
    if (callback) callback();
  });

}

//storing history as a single string separated by the '*' character.
//only keep last 5 messages.
//trying to stay with free db.
function storeMessageHistory(g, res, userClient, sender, body, callback) {
  var divider = '*';
  var historyLength = 5;
  var cryptoSender = G.cryptoHelper.encrypt(sender);
  var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
  var findQuery = historyClient.query(findQueryString);
  findQuery.on('row', function(row) {
    console.log(JSON.stringify(row));
    var messageHistory = (body + divider + row.message_body).split(divider);
    messageHistory = messageHistory.slice(0, historyLength);
    
    if (callback) callback(messageHistory);

    var newBody = messageHistory.join(divider);

    var queryString = "UPDATE users SET message_body = '" + newBody + "' WHERE phone_number = '" + cryptoSender + "'";
    var udpateQuery = historyClient.query(queryString);
    udpateQuery.on('end', function() {
      console.log("message history updated to " + newBody);
    });
  });
}

// [START receive_call]
app.post('/call/receive', bodyParser, function (req, res) {
  
  var sender = req.body.From;
  var body   = "phone call";
  console.log ('SENDER:' + sender + ', BODY:' + body);
  insertUser(res, sender, body);

  G.voiceActions.doVoiceActions(req, res);
 
});

// [START receive_sms]
app.post('/sms/receive', bodyParser, function (req, res) {
  var sender = req.body.From;
  var body   = req.body.Body;
  console.log ('SENDER:' + sender + ', BODY:' + body);
  doAction(res, sender, body);
});

// Voice to text test
app.post('/watson/receive', function (test) {
  console.log("inside watson call");
  console.log(test);
});

//Login test
app.post('/webadmin/receive', function (req, res) {
  
 var body = "";
 req.on('data', function (chunk) {
   body += chunk;
 });
 req.on('end', function () {
  console.log(body);
  var jsonBody = JSON.parse(body);
  var username = jsonBody.username;
  var password = jsonBody.password;
  var findQueryString = "SELECT * FROM admin WHERE username = '" + username + "' and password = '" + password + "'" ;
  var findQuery = webAdminClient.query(findQueryString);
  findQuery.on('row', function(row) {
    console.log("found row");
    console.log(JSON.stringify(row));
    var payload = {
      err:null,
      token:"authtoken",
    }
    res.status(200)
      .contentType('text/json')
      .send(payload);
  });

  findQuery.on('end', function(result) {
    console.log('end got called' + result);
    if (result.rowCount > 0) return;
    console.log("did not find user/pass")
    var payload = {
      err:1,
      tonek:null
    }
    res.status(200)
      .contentType('text/json')
      .send(payload);
    });
  });


});



// Start the server
var server = app.listen(process.env.PORT || '8080', function () {
  console.log('Bad Batch Alert listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});




// [END app]
