// 
// A collection of functions related to special admin actions that can be triggered from an admin phone number*/
//
var AdminActions = function() {

  var self = this;

  var TWILIO_NUMBER = process.env.TWILIO_NUMBER;
  var MY_NUMBER     = process.env.MY_NUMBER;
  
  //fires off a test alert to all the registered users
  self.adminTestAlerts = function(g, res, client, sender, action)
  {
    //Query for all users and send them alerts.
    console.log("adminTestAlerts " + action );
    var region = action.charAt(2);//in test alert the 2nd character is the region so.. like this is alert region '⚠2'️ (2 because unicode)
    var findQueryString = "SELECT * FROM users WHERE region = " + region;
    console.log(findQueryString);
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      var phoneNumber = g.cryptoHelper.decrypt(row.phone_number);
      console.log(phoneNumber);
      g.twilio.sendMessage({
        to: phoneNumber,
        from: TWILIO_NUMBER,
        body: '⚠️ Overdose nearby, please be careful: http://health.baltimorecity.gov/Fentanyl ⚠️',
        mediaUrl: "http://www.mike-legrand.com/BadBatchAlert/uplift.jpg"  
      }, function (err) {
        if (err) {
          return next(err);
        }
      });
    }).on('error', function() {
      console.log("nobody in region " + region + " to alert.")
    });
 
  };

  self.adminHelloWorld = function(g, res, client, sender, action)
  {
    console.log("adminHelloWorld");
    g.twilio.sendMessage({
      to: MY_NUMBER,
      from: TWILIO_NUMBER,
      body: '👋 Hello World 👋'
    }, function (err) {
      if (err) {
        return next(err);
      }
    });
  };

  self.encryptUsers = function(g, res, client, sender, action)
  {
    console.log("encryptUsers");
    var findQueryString = "SELECT * FROM users";
    console.log(findQueryString);
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      var cryptoNumber = g.cryptoHelper.encrypt(row.phone_number);
      console.log(cryptoNumber);
    });
  }


  //Special admin actions, like mass text etc.
  self.doAdminAction = function(g, res, client, sender, action)
  {
    if (sender != MY_NUMBER) return false;//not admin sorry buddy.

    if (action.startsWith("⚠️")) {//Alert Emoji
      self.adminTestAlerts(g, res, client, sender, action);
    } else if (action == "👋") {
      self.adminHelloWorld(g, res, client, sender, action);
    } else if (action == "Crypto") {
      self.encryptUsers(g, res, client, sender, action);
    } else {
      return false;
    }

    var body = "Admin Action Sent."
    var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);

    return true;
  };

};

module.exports = AdminActions;