//handles all voice commands.
var TwimlResponse = require('twilio').TwimlResponse;


var _activeCalls = [];//all phone calls in progress.
var _activeCall;

var site = "http://www.badbatchalert.com/audio/";//the site where the audio lives  
var ext = ".wav";//the audio extension.

var audio = { //all the available messages we can play.
  help:         'help',
  registration:          'registration',
  registrationSucess:          'registrationSucess',
  registrationConfirm:        'registrationConfirm',
  roboVanSuffix:         'roboVanSuffix',
  report:         'report',
  registrationError:          'registrationError',
  info:        'info',
  leave:        'leave',
  welcome:         'welcome'
};

var HELP_STR = "If you would like to know where the Baltimore Needle Exchange Van is right now, Press 2. If you'd like to send an anonymous report to the Bad Batch Alert team, press 3.  If you would like to learn more about the Bad Batch alert service, press 4. If you would like to stop recieving overdose alerts, press 5. If you would like to hear this message again, press 1.";

function isZipCode(body)
{
  if (body.length !== 5) return false;
  if (isNaN(body)) return false;
  return true;
};

var VoiceActions = function() {
  var self = this;



  self.doVoiceActions = function(request, response, hasRegion, G, userClient) {  

    var phone = request.body.From;
    var input = request.body.RecordingUrl || request.body.Digits;
    var twiml = new TwimlResponse();
    //see if we have a call in progress. Find out where we were if so. Otherwise add us and start at the beginning.

    var initialMessage = hasRegion ? audio.help : audio.registration;
    _activeCall = {phone:phone, message:initialMessage, zip:undefined};
    var callFound = false;
    for(var i = 0; i < _activeCalls.length; i++) {
      var activeCall = _activeCalls[i];
      if (activeCall.phone === phone) {
        _activeCall = activeCall;
        callFound = true;
        console.log('found call');
        break;
      }
    }

    if (!callFound) {
      console.log("new call");
      _activeCalls.push(_activeCall);
    }

    console.log("input = " + input);
    var numDigits = 1;

    // Add a greeting if this is the first question
    //twiml.play('http://www.mike-legrand.com/BadBatchAlert/Info.mp3');
    if (_activeCall.message == audio.registration) {
      //user registration, set zipcode
      console.log('registration');

      if (input) {
        var zipvalid = isZipCode(input);
        if (zipvalid) {
          _activeCall.message = audio.registerZip2;
          _activeCall.zip = input;
          //twiml.say(input + ". If this zipcode is correct press 1 , if not press 2. To hear the zipcode again press three.", { voice: 'alice'});
         var url = site + audio.regisrtationConfirm + ext;
         console.log(url);
         twiml.play(url);
         twiml.record();
        } 
      } else {
        //twiml.say("Thanks for calling the bad batch alert service, to begin receiving overdose alerts in your area, please enter your 5 digit zipcode now.", { voice: 'alice'});
        var url = site + audio.regisrtation + ext;
        console.log(url);
        twiml.play(url);
        twiml.record();
        numDigits = 5;
      }
    } else if((_activeCall.message == audio.registerZip1 || _activeCall.message == audio.registerZip1) && input) {
      //after user has successfully registered a zipcode
      if (input == '1') {
        _activeCall.message = audio.help;
        //twiml.say(HELP_STR, { voice: 'alice'});
        var url = site + audio.help + ext;
        console.log(url);
        twiml.play(url);
        twiml.record();
      }
    } else if (_activeCall.message == audio.registerZip2 && input) {
      // confirm zipcode
      if (input == '1') {
        console.log("registerZip1");
        //twiml.say("Congratulations! You are all set to receive alerts at " + _activeCall.zip + ". If you like to hear more options, press 1 now.", { voice: 'alice'});
         var url = site + audio.regisrtationSuccess + ext;
         console.log(url);
         twiml.play(url);
         twiml.record();
        _activeCall.message = audio.help;
        G.userActions.userSetZipCode(G, null, userClient, phone, _activeCall.zip) 
      } else if (input == '2') {
        console.log('registration');
         //twiml.say("Thanks for calling the bad batch alert service, to begin receiving overdose alerts in your area, Enter your 5 digit zip code now.", { voice: 'alice'});
        var url = site + audio.registration + ext;
        console.log(url);
        twiml.play(url);
        twiml.record();
        _activeCall.message = audio.registration;
        numDigits = 5;
      } else if (input == '3') {
        console.log('registerZip2');
        _activeCall.message = audio.registerZip2;
        //twiml.say(input + ". If this zipcode is correct press 1 , if not press 2. To hear the zipcode again press 3.", { voice: 'alice'});
        var url = site + audio.registrationConfirm + ext;
        console.log(url);
        twiml.play(url);
        twiml.record();
      } else {
        console.log('not recognized');
        //twiml.say("Sorry, " + input + " is not an available option. To begin receiving overdose alerts in your area, please enter the 5 digits of your zip code", { voice: 'alice'});
        var url = site + audio.regisrtationError + ext;
        console.log(url);
        twiml.play(url);
        twiml.record();
        _activeCall.message = audio.registration;
        numDigits = 5;
      }
    } else if (_activeCall.message == audio.help && input) {
      //say help options
      switch(input) {
        case '2'://van
          var vanLocation =  G.userActions.userVan(G, null, userClient, phone, '');
          var message = vanLocation + ". To Hear more options, press 1 now.";
          _activeCall.message = audio.help;
          //twiml.say(message, { voice: 'alice'});
          var url = site + audio.roboVanSuffix + ext;
          console.log(url);
          twiml.play(url);
          twiml.record();
          break;
        case '3'://send message
          //twiml.say('Please record your message and we will get back to you. If this is a medical emergency, please call nine one one.', { voice: 'alice'});
          var url = site + audio.report + ext;
          console.log(url);
          twiml.play(url);
          twiml.record();
          break;
        case '4'://learn more/info
          //needs to get audio currently on live
          //twiml.say('Bad Batch Alert is an anonymous free text message service to help heroin users stay alive in Baltimore City. Find out more at Bad Batch Alert dot com. Press 1 for more options', { voice: 'alice'});
          var url = site + audio.info + ext;
          console.log(url);
          twiml.play(url);
          twiml.record();
          break;
        case '5'://stop alerts
          //twiml.say('Thank you for using the Bad Batch Alert service. You are no longer registered to receive alerts. Press 1 for more options.');
          G.userActions.userLeave(G, null, userClient, phone, '');
          var url = site + audio.leave + ext;
          console.log(url);
          twiml.play(url);
          twiml.record();
          break;
        default:
          _activeCall.message = audio.help;
          //twiml.say(HELP_STR, { voice: 'alice'});
          var url = site + audio.help + ext;
          console.log(url);
          twiml.play(url);
          twiml.record();
          break;
      }
    } else {
      _activeCall.message = audio.help;
      //twiml.say("Thank you for calling Bad Batch Alert, " + HELP_STR, { voice: 'alice'});
      var url = site + audio.welcome + ext;
      console.log(url);
      twiml.play(url);
      twiml.record();
    } 

    
    //var url = site + _activeCall.message + ext;
    //console.log(url);
    //twiml.play(url);

    // Depending on the type of question, we either need to get input via
    // DTMF tones or recorded speech
    twiml.gather({
      input:'dtmf speech',
      timeout: 15,
      numDigits: numDigits,
      bargeIn: true
    });
    

    // render TwiML response
    response.type('text/xml');
    response.send(twiml.toString());
  };
 
};


module.exports = VoiceActions;
