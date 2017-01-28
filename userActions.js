// 
// A collection of functions that the user can initiate by texting different messages.*/
//
var UserActions = function() {
  var self = this;
  var commands =["near","join","help","map","leave","report","resources","i am"];

  //registers a new user
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
	
  //list commands that a user can send
  self.userHelp = function(g, res, client, sender, action)
  {
    console.log("userHelp");
    var body  = commands.join(", ");
    var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);
  };
	
	 //David, gives user number for detox location info// 
  self.userDetox = function(g, res, client, sender, action)
  {
    console.log("userDetox");
    var body  = "call 410-433-5175 for 24 hour service.";
    var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
     res.status(200)
    .contentType('text/xml')
    .send(resp);
  }
  
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
    var cryptoSender = g.cryptoHelper.encrypt(sender);
    console.log("userSetRegion");
    var region = parseInt(action);
    var findQueryString = "SELECT FROM users WHERE phone_number = '" + cryptoSender + "'";
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
  //tells the user the nearest medical center avaiable for the user
  //changes to make:!!! "If your're location has changed text near + region number e.g
  //near2" send a map of the region "resources for your set region below"
  self.userNear = function(g, res, client, sender, action)
    {
      console.log("userNear");
      var body  = "Has your location changed? Text y(Yes) or n(No)";
      if (body.toLowerCase() == 'y') {
      //suggestion - change boolean test to 'y' to newRegion
      var body  = "Text near + your region number e.g., near2, to receive a list of resources in that region";
     var newRegion = action[4];
     self.resourceByregion(newRegion);
      else
      //description - if user responds with "n" return a list for the nearest medical center or clinic
      // avaiable for the user based on user's original location in database
      var cryptoSender = g.cryptoHelper.encrypt(sender);
           var findQueryString = "SELECT * FROM users WHERE phone_number = '" + cryptoSender + "'";
     var findQuery = client.query(findQueryString);
     //question - what going on in the line below. How is 'row' being used in function(row)
     findQuery.on('row', function(row) {
     var region = row.region;
     //question - should the clsoing bracket and parantheses end at the line above or will that
     //prevent the function resourceByregion from accesing the variable region in that scope?
     var body  = "Here are your options: " + resourceByregion; //question - am i correctly calling this function?
     
     var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
     res.status(200)
     .contentType('text/xml')
     .send(resp);
     });
   };
  
  self.resourceByregion = function(region)
  {
      if (region == 1) {
        body = "Location: Downtown Baltimore, Mercy \n443-567-0055";
      } else if (region == 2) {
        body = "Location: Downtown Baltimore, Johns Hopkinks \n207-456-9887";
      } else if (region == 3) {
        body = "Location: Downtown Baltimore, St. Benny Hospital \n410-761-9081";
      } else if (region == 4) {
        body = "Location: Downtown Baltimore, Jonhny Long Center \n207-456-9887";
      } else if (region == 5) {
        body = "Location: Downtown Baltimore, Hospital1 \n207-666-9887";
      } else if (region == 6) { 
        body = "Location: Downtown Baltimore, Hospital2 \n207-999-9887";
      } else if (region == 7) {
        body = "Location: Downtown Baltimore, Hospital3 \n207-777-9887";
      } else if (region == 8) {
        body = "Location: Downtown Baltimore, Hospital4 \n207-000-9887";
      } else if (region == 9) {
        body = "Location: Downtown Baltimore, Hospital5 \n207-222-9887";
      }
    
      var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
      res.status(200)
          .contentType('text/xml')
          .send(resp);
    });
  };
 //David, gives user number for detox location info// 
  self.userDetox = function(g, res, client, sender, action)
  {
    console.log("userDetox");
    var body  = "call 410-433-5175 for 24 hour service.";
    var resp  = '<Response><Message><Body>' + body + '</Body></Message></Response>';
     res.status(200)
    .contentType('text/xml')
    .send(resp);
  }
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
  
  //userNeedles will show you where and when the need fan will show up at certain times/
  self.userNeedle = function (g,res,client,sender,action)
  {
    console.log("userNeedle");
    var d = new Date();
    console.log(d);
    var n = d.getDay();
    console.log(n);
    var vanlocation = [];
  
    if (n == 1){ 
      vanlocation = ['Monroe & Ramsey; Greenmount & Preston','Fulton & Baker','Baltimore & Conkling Highlandtown','Milton & Monument'];
    } else if(n == 2){
      vanlocation = ['Montford & Biddle; Pratt & Carey','Freemont & Riggs Barclay & 23rd'];
    } else if(n == 3){
      vanlocation = ['Baltimore & Conkling (Highlandtown)','Freemont & Laurens'];
    } else if (n == 4){
     vanlocation = ['Pontiac & 9th Ave. North & Rosedale','Milton & Monument; Monroe & Ramsey','Baltimore & Gay (The Block)'];
    } else if (n == 5){
      vanlocation = ['Park Heights & Spaulding; North & Gay','Fulton & Baker','Montford & Biddle','Monroe & Ramsey'];
    } else if (n == 6){
      vanlocation = ['Fremont and Riggs'];
    }

    //send message
    var body = ' These are your current needle van location' + vanlocation.join(', ');
    console.log(body);
    var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
    res.status(200)
        .contentType('text/xml')
        .send(resp);

  };
 
  self.doUserAction = function(g, res, client, sender, body)
  {
    if (body.toLowerCase() == "map") {
      self.userMap(g, res, client, sender, body);
    } 
    }else if (body >= '0' && body <= '9') {
      self.userSetRegion(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('i am')) {
      self.userSetName(g, res, client, sender, body);
    } else if (body.toLowerCase().startsWith('resources')) {
      self.userResources(g, res, client, sender, body);
    }	else if (body.toLowerCase().startsWith('near') {
      self.resourceByregion(body[4]);
    } else if (body.toLowerCase().startsWith('report')) {
      self.userReport(g, res, client, sender, body);
    } else if (body.toLowerCase() == 'leave') {
      self.userLeave(g, res, client, sender, body);
    } else if (body.toLowerCase() == 'needle') {
      self.userNeedle(g, res, client, sender, body);
    } else if (body.toLowerCase() == 'commands') {
      self.userHelp(g, res, client, sender, body);
    } else if (body.toLowerCase()=='detox'){
      self.userDetox(g, res, client, sender, body);
    } else {
      self.userJoin(g, res, client, sender, body);
    }
  };

};


module.exports = UserActions;
