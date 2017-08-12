//handles all voice commands.
var TwimlResponse = require('twilio').TwimlResponse;

var VoiceActions = function() {
  var self = this;

  self.doVoiceActions = function(request, response) {  
    var phone = request.body.From;
    var input = request.body.RecordingUrl || request.body.Digits;
    var twiml = new TwimlResponse();

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
