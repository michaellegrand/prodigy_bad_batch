var UserActions = function() 
{
  var self = this;
  var commands = ["van","near","join","help","map", "add", "leave","!", "i am", "share"];
  var commandDescriptions = ["Tells you where the Baltimore Needle Exchange Van is at any time.",
   "Tells you where the nearest available medical care center is.", 
   "Registers you with the Bad Batch alert service.",
   "Shows you a list of commands you can send.",
   "Shows you the Region Map, which has numbers that correspond to areas in the city. You can then text the number of the area in which you live, which determines the kind of overdose alerts you will get.",
   "Text 'add' followed by your region number to get alerts in multiple regions",
   "Removes you from the Bad Batch alert service. You can rejoin at any time by texting this number",
   "Text '!' followed by your message to anonymously send a message to someone who can help you.", 
   "Text 'I am' followed by your name to set your name in our database",
   "Text 'share' followed by a frined's number to tell that friend about the Bad Batch Alert service."];

   var regionZips = [ 
   /* region 1  */    [21217, 21211],
   /* region 2  */    [21211, 21218, 21210], 
   /* region 3  */    [21213, 21202, 21206],
   /* region 4  */    [21223,21229, 21230],
   /* region 5  */    [21231, 21202, 21201, 21230],
   /* region 6  */    [21224, 21205],
   /* region 7  */    [21224,21222],
   /* region 8  */    [21225, 21227, 21230],
   /* region 9  */    [21225, 21226]
                    ];
	
  //registers a new user
  self.userJoin = function(g, res, client, sender, action)
  {
    console.log("userJoin");
    var body  = "Thank you for registering. Text the word 'map' to set your location. Text the word 'help' to see a list of commands you can send. Find out more at BadBatchAlert.com";
    var media = "http://www.mike-legrand.com/BadBatchAlert/logoSmall150.png";
    var resp  = '<Response><Message><Body>' + body + '</Body><Media>' + media + '</Media></Message></Response>';
    res.status(200)
      .contentType('text/xml')
      .send(resp);
  };
  
  //list commands that a user can send
  self.userHelp = function(g, res, client, sender, action)
  {
    console.log("userHelp");
    if (commands.length != commandDescriptions.length){
      console.warn("Commands list and descriptions list don't match.");
      return;
    }
    var body = "";
    for (var i = 0; i < commands.length; i++){
     body = body + commands[i] + ": " + commandDescriptions[i] + '\n\n';
    }
    var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);
  };
  
  self.userLeave= function(g, res, client, sender, action)
  { 
    console.log("userLeave");
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    console.log(cryptoSender);
    var findQueryString = "DELETE FROM users WHERE phone_number = '" + cryptoSender + "'";
    console.log(findQueryString);
    var findQuery = client.query(findQueryString);
    var body= "Thanks for using Bad Batch. Text 'join' to continue recieving updates.";
    var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
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
    console.log("userSetRegion");
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    var region = action;
    var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      //if they texted us a number. Set it as their region.
      var insertQueryString = "UPDATE users SET regions = '" + region + "' WHERE phone_number = '" + cryptoSender + "'";
      var insertQuery = client.query(insertQueryString);
      insertQuery.on('end', function() {
        var body = "👍 You are all set to receive alerts in region " + region + ".\nTo add more regions, text the word 'add' followed by a region number.";
        var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);
      });
    });
  };

  self.userAddRegion = function(g, res, client, sender, action)
  {
    console.log("userAddRegion");
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    var region = action.charAt('add'.length + 1);
    console.log('region = ' + region);
    var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
    var findQuery = client.query(findQueryString);
    findQuery.on('row', function(row) {
      console.log(JSON.stringify(row));
      //if they texted us a number. Set it as their region.
      var regions = row.regions?row.regions:'';
      console.log('regions = ' + regions);
      if (regions.length == 0) {
        regionsArray = [];
      }  else {
        regionsArray = regions.split(', ');
      }

      var alreadyFound = false;
      console.log('checking for duplicates');
      for (var i = 0; i < regionsArray.length; i++) {
        if (regionsArray[i] == region) {
          alreadyFound = true;
          break;
        }
      }
      if (alreadyFound) {
        console.log('already found this region in your list');
        var body = "👍 You are all set to receive alerts in these regions " + regions;
        var resp = '<Response><Message><Body>' + body + '</Body></Message></Response>';
        res.status(200)
        .contentType('text/xml')
        .send(resp);
        return;
      }

      regionsArray.push(region);
      regions = regionsArray.length > 1 ?  regionsArray.join(', ') : regionsArray.join('');
      console.log ('regions after =' + regions);
      var insertQueryString = "UPDATE users SET regions = '" + regions + "' WHERE phone_number = '" + cryptoSender + "'";
      console.log(insertQueryString);
      var insertQuery = client.query(insertQueryString);
      insertQuery.on('end', function() {
        var body = "👍 You are all set to receive alerts in these regions " + regions;
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
	
  self.userDetox = function(g, res, client, sender, action)
  {
    console.log("userDetox");
    var body  = "call 410-433-5175 for 24 hour service.";
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
      var regions = row.regions; 
      var body  = "Here are your options: ";
      regions = regions ? regions:'';
      var regionsArray = regions.split(', ');
      for (var i = 0; i < regionsArray.length; i++) {
        if (i != 0) body = body + '\n\n';
        var region = regionsArray[i];
        if (region == 1) {
          body += "Region 1:\n Mercy Medical Center \n345 St. Paul Place \nBaltimore, MD 21202 (410) 332-9000";
        } else if (region == 2) {
          body += "Regions 2:\n Union Memorial Hospital \n201 E University Pkwy,\n Baltimore, MD 21218 (410) 554-2000";
        } else if (region == 3) {
          body += "Region 3:\n Greater Baltimore Medical Center \n6701 N Charles St, \nTowson, MD 21204 (443) 849-2000";
        } else if (region == 4) {
          body += "Region 4:\n University of Maryland Rehabilitation and Orthopaedic Institute \n2200 Kernan Dr, \nBaltimore MD, 21207 (410) 448-2500";
        } else if (region == 5) {
          body += "Region 5:\n UM Medical Center ER \n22 S. Greene Street, \nBaltimore MD, 21201 ((410) 328-8667)";
        } else if (region == 6) { 
          body += "Region 6:\n UMMC Midtown Campus ER \n827 Linden Ave, \nBaltimore MD, 21201 ((410) 255-8000)";
        } else if (region == 7) {
          body += "Region 7:\n ChoiceOne Urgent Care Dundalk \n1730 Merritt Blvd, \nBaltimore MD, 20222 ((410) 650-4731)";
        } else if (region == 8) {
          body += "Region 8:\n University of Maryland Faculty Physicians Inc \n5890 Waterloo Rd, \nColumbia MD, 21045 ((667) 214-2100)";
        } else if (region == 9) {
          body += "Region 9:\n UM Baltimore Washington Medical Center ER \n301 Hospital Drive, \nBaltimore MD, 21060 ((410) 787-4000)";
        }

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
  //userShare will allow the user's message to share their experience to others/
  self.userShare = function(g, res, client, sender, action)
  { 
    var MY_NUMBER  = process.env.MY_NUMBER;
    var TWILIO_NUMBER = process.env.TWILIO_NUMBER;
    var length = "share".length + 1;
    var number = body.substring(length);
    
    number = "+1" + number;
    number = number.replace("-" , "");
    number = number.replace("(" , "");
    number = number.replace(")" , "");
    var body  = "You have share Bad Batch to: . " + number;
    g.twilio.sendMessage({
      to: number,
      from: TWILIO_NUMBER,
      body: action
    }, function (err) {
      if (err) {
        return next(err);
      }
    }); 
    
    var resp  = '<Response><Message><Body>' + body  + '</Body>' + '</Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);
  
  //userNeedles will show you where and when the need fan will show up at certain times/
  self.userVan = function (g,res,client,sender,action)
  {
    console.log("userVan");
    //EST
    offset = -5.0
    clientDate = new Date();
    utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
    serverDate = new Date(utc + (3600000*offset));
    console.log(serverDate.toLocaleString());  
	  
    var n = serverDate.getDay();
    var h = serverDate.getHours();
    var m = serverDate.getMinutes();
    var vanLocation = 'The Van is not in service right now.';
    console.log('n:' + n + ', h:' + h + ', m:' + m); 
    if (n == 1) {
      if ( ( h == 9 && m >= 30) || ( h == 11 && m <= 30) || (h > 9 && h < 11) )  {
        vanLocation = 'Van 1 is at Monroe and Ramsey. Van 2 is at Greenmount and Preston until 11:30 AM';
      } else if (( h == 12 && m >= 45 ) || ( h == 15 && m <= 30) || (h > 12 && h < 15)){
        vanLocation = 'The van is at Fulton and Baker until 3:30 PM';
      } else if (( h >= 18) && ( h <= 20)) { 
        vanLocation = 'The van is at Baltimore and Conkling Highlandtown until 8:00 PM';
      } else if (( h == 20 && m >= 30) || (h > 20 && h < 22)) {
        vanLocation = 'The van is at Milton and Monument until 10:00 PM';
      }
    } else if (n == 2) {
      if (( h == 9 && m >= 30) || ( h == 11 && m <= 30) || (h > 9 && h < 11)) {
        vanLocation = 'Montford and Biddle; Pratt and Carey';
      } else if (( h == 12 && m >= 45 ) || ( h == 15 && m <= 30) || (h > 12 && h < 15)){
        vanLocation = 'The van is at Freemont and Riggs Barclay and 23rd until 3:30 PM';
      }
    } else if (n == 3) {
      if (( h >= 18) && ( h <= 20)){
        vanLocation = 'The van is at Baltimore and Conkling (Highlandtown) until 8:00 PM';
      } else if (( h == 20 && m >= 30) || (h > 20 && h < 22)) {
        vanLocation = 'The van is at Freemont and Laurens until 10:00 PM';
      }
    } else if (n == 4) {
      if (( h == 9 && m >= 30) || ( h == 11 && m <= 30) || (h > 9 && h < 11)) {
         vanLocation = 'Van1 is at Pontiac and 9th Ave. Van 2 is at North and Rosedale until 11:30 AM';
      } else if (( h == 12 && m >= 45 ) || ( h == 15 && m <= 30) || (h > 12 && h < 15)) {
         vanLocation = 'Van 1 is at Milton and Monument. Van 2 is at Monroe and Ramsey until 3:30 PM';
      } else if (h >= 19 && h <= 22 ) {
         vanLocation = 'The van is at Baltimore and Gay (The Block) until 10:00 PM'; 
      }
    } else if (n == 5){
      if (( h == 9 && m >= 30) || ( h == 11 && m <= 30) || (h > 9 && h < 11)) {
        vanLocation = 'Van 1 is at Park Heights and Spaulding. Van 2 is at North and Gay until 11:30 AM';
      } else if (( h == 12 && m >= 45 ) || ( h == 15 && m <= 30) || (h > 12 && h < 15)) {
        vanLocation ='The van is at Fulton and Baker until 3:30 PM';
      } else if (h >= 18 && h <= 20 ) {
        vanLocation = 'The van is at Montford and Biddle until 8:00 PM';
      } else if (( h == 20 && m >= 30) || (h > 20 && h < 22)) {
        vanLocation = 'The van is at Monroe and Ramsey until 10:00 PM';
      }
    } else if (n == 6){
      if (h >= 12 && h <= 16) {
        vanLocation= 'The van is at Fremont and Riggs until 4:00 PM';
      }
    }


    //send message
    var body = vanLocation;
    var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
    res.status(200)
          .contentType('text/xml')
          .send(resp);

  };

  self.userSetZipCode = function(g, res, client, sender, body) 
  {
    console.log("userSetZipCode");
    var zipCode = parseInt(body);
    var matchedRegionsArray = [];
    for (var i = 0; i < regionZips.length; i++) {
      var zips = regionZips[i];
      for (var j = 0; j < zips.length; j++) {
        var zip = zips[j];
        if (zip == zipCode) {
          matchedRegionsArray.push(i + 1);
        }
      }
    }
    if (matchedRegionsArray.length === 0) {
      var body = "Sorry, this service is only available in the Baltimore metro area. If you'd like to have your area added to the Bad Batch Alert Serivce, send an email to badbatchalert@gmail.com."
      var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
      res.status(200)
            .contentType('text/xml')
            .send(resp);
    }
    else {
      var regions = matchedRegionsArray.join(', '); 
      self.userSetRegion(g, res, client, sender, regions)
    }
  };

  self.isZipCode = function(body)
  {
    if (body.length !== 5) return false;
    if (isNaN(body)) return false;
    return true;
  };
 
  self.doUserAction = function(g, res, client, sender, body)
  {
    var command = body.toLowerCase();
    if (command == "map") {
      self.userMap(g, res, client, sender, body);
    } else if (self.isZipCode(body)) {
      self.userSetZipCode(g, res, client, sender, body);
    } else if (body.length == 1 && body >= '0' && body <= '9') {
      self.userSetRegion(g, res, client, sender, body);
    } else if (command.startsWith('add')) {
      self.userAddRegion(g, res, client, sender, body);
    } else if (command.startsWith('i am')) {
      self.userSetName(g, res, client, sender, body);
    } else if (command == 'near') {
      self.userNear(g, res, client, sender, body);
    } else if (command.startsWith('!')) {
      self.userReport(g, res, client, sender, body);
    } else if (command == 'leave') {
      self.userLeave(g, res, client, sender, body);
    } else if (command == 'van') {
      self.userVan(g, res, client, sender, body);
    } else if (command == 'help') {
      self.userHelp(g, res, client, sender, body);
    } else if (command == 'detox') {
      self.userDetox(g, res, client, sender, body);
    } else if (command == 'share') {
      self.userShare(g, res, client, sender, body);
    } else {
      self.userJoin(g, res, client, sender, body);
    }
  };

};


module.exports = UserActions;
