// 
// A collection of functions that the user can initiate by texting different messages.*/
//
var UserActions = function() {

  var self = this;

  //fires off a test alert to all the registered users
  self.userJoin = function(g, res, client, sender, action)
  {
    console.log("userJoin");
    var body  = "Thank you for registering. Text the word 'map' to set your location. Find out more at BadBatchAlert.com";
    var media = "http://www.mike-legrand.com/BadBatchAlert/logoSmall150.png";
    var resp  = '<Response><Message><Body>' + body + '</Body><Media>' + media + '</Media></Message></Response>';
    res.status(200)
      .contentType('text/xml')
      .send(resp);
  };

  self.userMap = function(g, res, client, sender, action)
  {
    console.log("userMap");
    var body  = "Text the number for your location.";
    var media = "http://www.mike-legrand.com/BadBatchAlert/regions_01.jpg";
    var resp  = '<Response><Message><Body>' + body  + '</Body><Media>' + media + '</Media></Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);
  };

  self.userSetRegion = function(g, res, client, sender, action)
  {
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    console.log("userSetRegion");
    var region = parseInt(action);
    var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      //if they texted us a number. Set it as their region.
      var insertQueryString = "UPDATE users SET region = " + region + " WHERE phone_number = '" + cryptoSender + "'";
      var insertQuery = client.query(insertQueryString);
      insertQuery.on('end', function() {
        var body = "👍 You are all set to receive alerts in region " + region;
        var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);
      });
    });
  };

  self.userSetName = function(g, res, client, sender, action)
  {
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    console.log("userSetName");
    var name = action.substring(5);
    var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      //if they texted us a number. Set it as their region.
      var insertQueryString = "UPDATE users SET name = '" + name + "' WHERE phone_number = '" + cryptoSender + "'";
      var insertQuery = client.query(insertQueryString);
      insertQuery.on('end', function() {
        var body = "👌 You're signed up as: " + name;
        var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);
      });
    });
  };
  //sends a list of resources in that region
  self.userResources = function(g, res, client, sender, action)
  {
  console.log("userResources");
  var body  = "Text resources + your region number e.g., resources2, to receive a list of resources in that region";
  var resourceRegion = action.charAt('resources'.length);
  if (resourceRegion == '1'){
      body = 'Union Memorial'
  };else if (resourceRegion == '2'){
      body = 'JHMI'
  };
  var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
  res.status(200)
  .contentType('text/xml')
  .send(resp);
  };
    
  self.doUserAction = function(g, res, client, sender, body)
  {
    if (body.toLowerCase() == "map") {
      self.userMap(g, res, client, sender, body);
    } else if (body == '1' || body =='2' || body =='3' || body=='4' || body == '5' || body == '6' || body == '7' || body == '8' || body == '9') {
      self.userSetRegion(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('i am')) {
      self.userSetName(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('resources') {
      self.userResources(g, res, client, sender, body);
    } else {
      self.userJoin(g, res, client, sender, body);
    }
  };

};


module.exports = UserActions;
