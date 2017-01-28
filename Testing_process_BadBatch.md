Testing_process_BadBatch.md

1.commit to production github which is automatically updated and deployed via heroku
2. Check error logs for app crashing
3. Check for syntax error first. Set literal(static) values to variables to test syntax of code.
3.5 See if code on github.com shows you were the error is.
4. commit and check deployment logs
5. if error still persists c/p code in closure compiler. this will help identify compiler errors(syntax, parse, any formatting errors or sometimes semantic errors)
6. recommit and push
7. Access application in heroku
8. view logs to see if application succesfully started up or crashed
9. if it's up syntax is right then test function logic
10. it that fails the implement console.log(variables/function ouput)


Deploying badbathcalertdev server via Heroku and Twillio sms program

1. signup for heroku account
2. signup for twillio sms service
3. download Heroku CLI tools
4. connect to Heroku via [cmd login tutorial](https://devcenter.heroku.com/articles/heroku-cli)
5. Change the number and values: heroku>settings>config vars>twillio number
5.5 connect github repo to heroku for continous deployment
6. Top right-hand corner more>viewlogs to view activity while testing functions
7. Overview>adminium to view database records
8. When [setting up twillio number](https://support.twilio.com/hc/en-us/articles/223136107-How-does-Twilio-s-Free-Trial-work-) provide the url to the heroku app e.g. https://badbatchalertdev.heroku.app/*sms/receive*
    Be sure to add sms/request and sms/receive at the end of the url so twillio know where to find the code that utilizes the api and processes the request.
