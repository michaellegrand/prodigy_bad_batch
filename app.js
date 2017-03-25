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

var app      = express();

var G = {
  twilio:           twilio,
  adminActions:     new AdminActions(),
  userActions:      new UserActions(),
  cryptoHelper:     new CryptoHelper(),
};


function doAction(res, client, sender, body)
{
  var messageHandled = G.adminActions.doAdminAction(G, res, client, sender, body);
  if (!messageHandled) {
    G.userActions.doUserAction(G, res, client, sender, body);
  }
}

// [START receive_call]
app.post('/call/receive', function (req, res) {
  var resp = new TwimlResponse();
  resp.say({voice:'woman'}, 'Welcome to Bad Batch Alert!');
  resp.gather({ timeout:30 }, function() {
    this.say('Press 1 to join');
  });
  resp.record({timeout:30, transcribe:true, transcribeCallback:"https://badbatchalertstaging.herokuapp.com/watson/receive"});



  res.status(200)
    .contentType('text/xml')
    .send(resp.toString());
});
// [END receive_call]

// [START receive_sms]
app.post('/sms/receive', bodyParser, function (req, res) {
  
  var sender = req.body.From;
  var body   = req.body.Body;
  console.log ('SENDER:' + sender + ', BODY:' + body);
 
  //connect to the db
  pg.defaults.ssl = true;
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;
    console.log('Connected to db');
    doAction(res, client, sender, body);
  });
});
// [END receive_sms]

// Voice to text test
app.post('/watson/receive', function (test) {
  console.log("inside watson call");
  console.log(test);
});


// Start the server
var server = app.listen(process.env.PORT || '8080', function () {
  console.log('Bad Batch Alert listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});



// [END app]
