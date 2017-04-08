//handles all voice commands.
var TwimlResponse = require('twilio').TwimlResponse;

var VoiceActions = function() {
  var self = this;

  self.doVoiceActions = function(request, response) {  
    var phone = request.body.From;
    var input = request.body.RecordingUrl || request.body.Digits;
    var twiml = new TwimlResponse();
    var q1Responses = ["van", " report", "info", "leave"];

    // helper to append a new "Say" verb with alice voice
    function say(text) {
      twiml.say(text, { voice: 'alice'});
    }

    // respond with the current TwiML content
    function respond() {
      response.type('text/xml');
      response.send(twiml.toString());
    }

    var survey = [
        {text:"what is your name", type:'boolean'},
        {text:"where do you live", type: 'text'},
        {text:"Are you a robot", type: 'number'}
    ];

     //This method controls 1 and 2 of nextcall script, does the 1(help command and 2(van command)
     var voiceHelp = {question1:"Thanks for calling Bad Batch Alert service. Press 1 or say ‘help’ for a list of options.", type:'number'}
           answer: ["Help. If you would like to know where the Baltimore Needle exchange van is at any time, press 2 or say ‘van’. If you need to make an anonymous call to emergency services, press 3 or say ‘report’. If you would like to learn more about the Bad Batch Alert service, press 4 or say ‘info’. If you would like to stop receiving overdose alerts, press 5 or say ‘leave’. If you would like to hear this message again, press 1 or say ‘help’." ]
                };

    var voiceVan = {question2:"Please press two for more options", type:'number'}
           answer: [
            "On Monday from 9:30 AM to 11:30 AM needle exchange van 1 is at Monroe and Ramsey and van 2 is at Greenmount and Preston.",
            "On Monday from 12:45 PM to 3:30 PM the needle exchange van is at Fulton and Baker.",
            "On Monday from 6 PM to 8 PM the needle exchange van is at Baltimore and Conkling in Highlandtown.",
            "On Tuesday from 9:30 AM to 11:30, needle exchange van 1 is at Montford and Biddle, and van 2 is at Pratt and Carey.",
            "On Monday from 12:45 PM to 3:30 PM needle exchange van 1 is at Freemont and Riggs and van 2 is at Barclay and 23rd.",
            "On Wednesday from 6:00 PM to 8:00 PM the needle exchange van is at Baltimore and Conkling in Highlandtown.",
            "On Wednesday from 8:30 PM to 10:00 PM the needle exchange van is at Freemont and Laurens.",
            "On Thursday from 9:30 AM to 11:30 AM needle exchange van 1 is at Pontiac and 9th Ave. and van 2 is at North and Rosedale.",
            "On Thursday from 12:45 PM to 3:30 PM needle exchange van 1 is at Milton and Monument and van 2 is at Monroe and Ramsey.",
            "On Thursday from 7:00 PM to 10:00 PM the needle exchange van is at Baltimore and Gay.",
            "On Friday from 9:30 AM to 11:30 AM needle exchange van 1 is at Park Heights and Spaulding and van 2 is at North and Gay.",
            "On Friday from 12:45 PM to 3:30 PM the needle exchange van is at Fulton and Baker.",
            "On Friday from 6:00 PM to 8:00 PM the needle exchange van is at Montford and Biddle.",
            "On Friday from 8:30 PM to 10:00 PM the needle exchange van is at Monroe and Ramsey.",
            "On Saturday from 12:00 PM to 4:00PM the needle exchange van is at Fremont and Riggs."
            ]
                    };

    var _count = 0;
    function advanceSurvey(info, callback) {
      callback(null, _count);
      _count++;
    }

    // Find an in-progess survey if one exists, otherwise create one
    advanceSurvey({
        phone: phone,
        input: input,
        survey: survey
    }, function(err, questionIndex) {
        var question = survey[questionIndex];

        if (err) {
            say('Terribly sorry, but an error has occurred. Goodbye.');
            return respond();
        }

        // If question is null, we're done!
        if (!question) {
            say('Thank you for taking this survey. Goodbye!');
            return respond();
        }

        // Add a greeting if this is the first question
        if (questionIndex === 0) {
            twiml.play('http://www.mike-legrand.com/BadBatchAlert/Info.mp3');
        }

        // Otherwise, ask the next question
        say(question.text);

        // Depending on the type of question, we either need to get input via
        // DTMF tones or recorded speech
        if (question.type === 'text') {
            say('Please record your response after the beep. '
                + 'Press any key to finish.');
            twiml.record({
                transcribe: true,
                transcribeCallback: '/voice/' + surveyResponse._id
                    + '/transcribe/' + questionIndex,
                maxLength: 60
            });
        } else if (question.type === 'boolean') {
            say('Press one for "yes", and any other key for "no".');
            twiml.gather({
                timeout: 10,
                numDigits: 1
            });
        } else {
            // Only other supported type is number
            say('Enter the number using the number keys on your telephone.' 
                + ' Press star to finish.');
            twiml.gather({
                timeout: 10,
                finishOnKey: '*'
            });
        }

        // render TwiML response
        respond();
    });
  };
 
};


module.exports = VoiceActions;
