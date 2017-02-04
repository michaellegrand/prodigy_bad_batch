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
        var body = "?? You are all set to receive alerts in region " + region;
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
        var body = "?? You're signed up as: " + name;
        var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);
      });
    });
  };

  self.userResources = function(g, res, client, sender, action)
  {
    console.log("userResources");
    var body  = "Text resources + your region number e.g., resources2, to receive a list of resources in that region";
    var resourceRegion = action.charAt('resources'.length);
    if (resourceRegion == '1') {
      body = 'Union Memorial';
    } else if (resourceRegion == '2'){
      body = 'JHMI'
    };
    var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
    res.status(200)
    .contentType('text/xml')
    .send(resp);
  };

  
  //tells the user the nearest medical center avaiable for the user
  self.userNear = function(g, res, client, sender, action)
  {
    console.log("userNear");
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      var region = row.region;
      var body  = "Here are your options: ";
      if (region == 1) {
        body = "Mercy Medical Center \n345 St. Paul Place \nBaltimore, MD 21202 (410) 332-9000";
      } else if (region == 2) {
        body = "Union Memorial Hospital \n201 E University Pkwy,\n Baltimore, MD 21218 (410) 554-2000";
      } else if (region == 3) {
        body = "Greater Baltimore Medical Center \n6701 N Charles St, \nTowson, MD 21204 (443) 849-2000";
      } else if (region == 4) {
        body = "University of Maryland Rehabilitation and Orthopaedic Institute \n2200 Kernan Dr, \nBaltimore MD, 21207 (410) 448-2500";
      } else if (region == 5) {
        body = "UM Medical Center ER \n22 S. Greene Street, \nBaltimore MD, 21201 ((410) 328-8667)";
      } else if (region == 6) { 
        body = "UMMC Midtown Campus ER \n827 Linden Ave, \nBaltimore MD, 21201 ((410) 255-8000)";
      } else if (region == 7) {
        body = "ChoiceOne Urgent Care Dundalk \n1730 Merritt Blvd, \nBaltimore MD, 20222 ((410) 650-4731)";
      } else if (region == 8) {
        body = "University of Maryland Faculty Physicians Inc \n5890 Waterloo Rd, \nColumbia MD, 21045 ((667) 214-2100)";
      } else if (region == 9) {
        body = "UM Baltimore Washington Medical Center ER \n301 Hospital Drive, \nBaltimore MD, 21060 ((410) 787-4000)";
      }
    
      var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
      res.status(200)
          .contentType('text/xml')
          .send(resp);
    });
  };

  //userReport will text the user's message to the admin phone number and will tell the user that it has been sent /
  self.userReport = function(g, res, client, sender, action)
  { 
    var MY_NUMBER  = process.env.MY_NUMBER;
    var TWILIO_NUMBER = process.env.TWILIO_NUMBER;
    g.twilio.sendMessage({
      to: MY_NUMBER,
      from: TWILIO_NUMBER,
      body: action
    }, function (err) {
      if (err) {
        return next(err);
      }
    }); 

    var body  = "Your report has been sent.";
    var resp  = '<Response><Message><Body>' + body  + '</Body>' + '</Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);
  };
 
  self.doUserAction = function(g, res, client, sender, body)
  {
    if (body.toLowerCase() == "map") {
      self.userMap(g, res, client, sender, body);
    } else if (body >= '0' && body <= '9') {
      self.userSetRegion(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('i am')) {
      self.userSetName(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('resources')) {
      self.userResources(g, res, client, sender, body);
    } else if (body.toLowerCase() == 'near') {
      self.userNear(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('report')) {
      self.userReport(g, res, client, sender, body);
    } else {
      self.userJoin(g, res, client, sender, body);
    }
  };

};
