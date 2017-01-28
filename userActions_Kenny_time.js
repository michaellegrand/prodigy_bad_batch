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
  //userNeedles will show you where and when the need fan will show up at certain times/
  Self.userNeedle = function (g,res,client,sender,action)
  {
    console.log("userNeedle");
    var d = new Date();
    var n = d.getDay();
    var vanlocation = 'van is not in service';
    var h = d.getHours();
    var m = d.getMinutes();
    if (n == 1){
      if ( ( h == 9 && m >30 ) || (h > 9 && h < 11) || ( h == 11 && m < 30) )  {
         vanlocation = 'Monroe & Ramsey; Greenmount & Preston';
    }else if (( h == 12 && m < 45 ) || (h > 12 && h < 15) || ( h == 15 && m < 30)){
        vanlocation = 'Fulton & Baker';
    }else if (( h == 18 ) || (h > 18 && h < 10 ) || ( h == 10 )){
        vanlocation= 'Baltimore & Conkling Highlandtown';
    }else if (( h == 20 && m >= 30 ) || (h > 10 && h < 22) || ( h == 22 )) {
        vanlocation ='Milton & Monument'};
      } 
    } else if(n == 2){
      if (( h == 9 && m >=30 ) || ( h > 9 && h < 11 ) || ( h == 11 && m < 30)) {
        vanlocation = 'Montford & Biddle; Pratt & Carey';
    }else if ((h == 12 && m < 45 ) || (h >12 && h < 15) || ( h == 15 && m <30 ) ){
        vanlocation = 'Freemont & Riggs Barclay & 23rd';
      }
    } else if(n == 3){
      if ((h == 18) || ( h > 18 && h < 10) || (h == 10)){
        vanlocation = 'Baltimore & Conkling (Highlandtown)';{
    } else if ((h == 10 && m < 30 ) || (h > 10 && h < 10) || (h == 10)){
          vanlocation = 'Freemont & Laurens';
        }
    } else if (n == 4){
        if ((h == 9 && m >= 30) || (h > 9 && h < 11) || (h == 11 && m < 30 )) {
          vanlocation = 'Pontiac & 9th Ave.; North & Rosedale';
    }else if ((h == 12 && m >= 45) || (h > 12 && h < 15) || (h == 15 && m < 30 )) {
          vanlocation ='Milton & Monument; Monroe & Ramsey';
    }else if ((h == 19) || (h > 19 && h < 22) || (h == 22 )){
         vanlocation='Baltimore & Gay (The Block)'; 
        }
    } else if (n == 5){
      if ((h == 9 && m >= 30 ) || (h > 9 && h < 11) || (h == 11 && m < 30 )){
        vanlocation='Park Heights & Spaulding; North & Gay';
    }else if ((h == 12 && m >= 45 ) || (h > 12 && h < 3) || (h == 3 && m < 30 )){
        vanlocation ='Fulton & Baker';
    }else if ((h == 18) ||  (h > 18 && h < 20) || (h == 20 )){
        vanlocation='Montford & Biddle';
    }else if ((h == 20 && m >= 30 ) || (h > 20 && h < 10) || (h == 10)){
        vanlocation='Monroe & Ramsey';
      }
    } else if (n == 6){
      if ((h == 12 ) || (h > 12 && h < 4 ) || (h == 4 )){
        vanlocation= 'Fremont & Riggs';
 
    }

    //send message
    var body = ' These are your current needle van location' + vanlocation.join(', ');
    var resp  = '<Response><Message><Body>' + body  + '</Body></Message></Response>';
    res.status(200)
          .contentType('text/xml')
          .send(resp);

  }
  //userReport will text the user's message to the admin phone number and will tell the user that it has been sent /
  self.userReport = function(g, res, client, sender, action)
  { 
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
    } else if (body.tolowerCase()=='join')
      self.userJoin(g, res, client, sender, body);
    } else if (body.tolowerCase()=='needle') {
      self.userNeedle(g, res, client, sender, body;
    }
  };

};
