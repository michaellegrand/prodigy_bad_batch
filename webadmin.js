//handles actions from the admin website
var WebAdmin = function() {
  var self = this;

  var TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  var MY_NUMBER     = process.env.MY_NUMBER;


  var _usersLoggedIn = [];
  var _userClient;

  self.setUserClient = function(userClient)
  {
    _userClient = userClient;
  }

  self.init = function(app, webAdminClient, g)
  {

    //Login to admin db
    app.post('/webadmin/login', function (req, res) {
  
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

        //generate an auth token and store it.
        g.cryptoHelper.generateAuthtoken(function(authtoken) {
          _usersLoggedIn[authtoken] = row;//add to logged in users
          setTimeout(function(){delete _usersLoggedIn[authtoken];}, 1000*60*90);//wipe user after 90 minutes
          var payload = {
            err:null,
            token:authtoken,
          };
          res.status(200)
            .contentType('text/json')
            .send(payload);
        });
       
      });

      findQuery.on('end', function(result) {
        console.log('end got called' + result);
        if (result.rowCount > 0) return;
        console.log("did not find user/pass");
        var payload = {
          err:1,
          token:null
        };
        res.status(200)
          .contentType('text/json')
          .send(payload);
        });
      });


    });


    //unlock a nalox box. Just a test for now.
    app.post('/webadmin/unlockBox', function (req, res) {
  
      var body = "";
      req.on('data', function (chunk) {
        body += chunk;
      });
      req.on('end', function () {
        console.log(body);
        var jsonBody = JSON.parse(body);
        var boxId = jsonBody.boxId;
     
        g.twilio.sendMessage({
          to: "+14436834616",
          from: TWILIO_NUMBER,
          body: "1"
        }, function (err) {
          if (err) {
            console.log(err);
          }
        });

        var payload = {
          err:0
        };

        res.status(200)
          .contentType('text/json')
          .send(payload);
        });
    });

    //Get Users In Region
    app.post('/webadmin/getusersinregions', function (req, res) {
      var userCounts = [0,0,0,0,0,0,0,0,0];
     
      var findQueryString = "SELECT * FROM users";  
      var findQuery = webAdminClient.query(findQueryString);
      findQuery.on('row', function(row) {
        var regionString = row.regions;
        if (!row.regions) return;
        var regionArray = regionString.split(", ");
        for (var i = 0; i < regionArray.length; i++){
          var region = parseInt(regionArray[i]);
          userCounts[region-1] ++;
        }
      });

      findQuery.on('end', function(result) {
        console.log("Completed.");
        var payload = {
          userCounts:userCounts
        };
        res.status(200)
          .contentType('text/json')
          .send(payload);
      });
    });

    //Send test message
    app.post('/webadmin/sendtestmessage', function (req, res) {
      var body = "";
      req.on('data', function (chunk) {
         body += chunk;
      });
      req.on('end', function () {
        console.log(body);
        var jsonBody = JSON.parse(body);
        var regions = jsonBody.regions;
        var message = jsonBody.message;
        var authtoken = jsonBody.authtoken;
        if (!authtoken || !_usersLoggedIn.hasOwnProperty(authtoken)) {
          var payload = {
            err:"notLoggedIn"
          };
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }
        var row = _usersLoggedIn[authtoken];
        console.log(JSON.stringify(row));
        var phoneNumber = row.phone;

        if (!phoneNumber) {
          var payload = {
            err:"noPhoneNumber"
          };
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }


        //find all the users in the regions passed in.
        //text each user with the message.
        var region;
        for (var i = 0; i < regions.length; i++) {
          if (regions[i]) {
            region = i+1;
            break;
          }
        }
        var media = "http://www.badbatchalert.com/images/regions/region_" + region + ".jpg";
       
        g.twilio.sendMessage({
          to: phoneNumber,
          from: TWILIO_NUMBER,
          body: message,
          mediaUrl: media
        }, function (err) {
          if (err) {
            console.log(err);
          }
        });

        var payload = {
          err:null
        };
        res.status(200)
        .contentType('text/json')
        .send(payload);

      });
    });

    //Send real message
    app.post('/webadmin/sendrealmessage', function (req, res) {
      var body = "";
      req.on('data', function (chunk) {
         body += chunk;
      });
      req.on('end', function () {
        console.log(body);
        var jsonBody = JSON.parse(body);
        var regions = jsonBody.regions;
        var message = jsonBody.message;
        var authtoken = jsonBody.authtoken;
        if (!authtoken || !_usersLoggedIn.hasOwnProperty(authtoken)) {
          var payload = {
            err:"notLoggedIn"
          }
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }
        var row = _usersLoggedIn[authtoken];

        console.log(JSON.stringify(row));

        if (!row.access_level > 0) {
          var payload = {
            err:"accessDenied"
          }
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }

        //find all the users in the regions passed in.
        //text each user with the message.
        var region;
        for (var i = 0; i < regions.length; i++) {
          if (regions[i]) {
            region = i+1;
            break;
          }
        }
        
        if (!_userClient) {
          console.log("region not found");
          var payload = {
            err:"regionNotFound"
          }
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }
        
        var findQueryString = "SELECT * FROM users WHERE regions LIKE '%" + region + "%'";

        console.log(findQueryString);
        if (!_userClient) {
          console.log("user client not found");
          var payload = {
            err:"userClientNotFound"
          }
          res.status(200)
          .contentType('text/json')
          .send(payload);
          return;
        }

        var findQuery = _userClient.query(findQueryString);
        findQuery.on('row', function(row) {
          console.log(JSON.stringify(row));
          var phoneNumber = g.cryptoHelper.decrypt(row.phone_number);
          console.log(phoneNumber);
          g.twilio.sendMessage({
            to: phoneNumber,
            from: TWILIO_NUMBER,
            body: message
            //mediaUrl: "http://www.mike-legrand.com/BadBatchAlert/uplift.jpg"  
          }, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }).on('error', function() {
          console.log("nobody in region " + region + " to alert.")
        });

        var payload = {
         err:null
        }
        res.status(200)
        .contentType('text/json')
        .send(payload);
      });
    });
  };
};




module.exports = WebAdmin;
