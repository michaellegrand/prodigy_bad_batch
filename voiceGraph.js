var voiceGraph = {
    "id": "registration",
    "children": [
        {
            "id": "welcome",
            "children": [
                {
                    "id": "help",
                    "children": [
                        {
                            "id":"van"
                            "children": [
                                {
                                    "id": "help"
                                }
                            ]
                        }
                        {
                            "id":"report"
                            "children": [
                                {
                                    "id": "help"
                                }
                            ]
                        },
                        {
                        
                            "id":"info"
                            "children": [
                                {
                                    "id": "help"
                                }
                            ]
                        },
                        {
                            "id":"leave"
                            "children": [
                                {
                                    "id" : "confirmLeave"
                                    "children" :[
                                        {
                                            "id" : "help"
                                        }           
                                    ]
                                },
                                {
                                    "id" : "confirmCancel" 
                                    "children": [
                                        {
                                            "id": "help"
                                        }
                                    ]  
                                }  
                            ]
                        }
                    ]
                }
            ]
        }, {
            "Id": 3,
            "Label": "C"
        }, {
            "Id": 4,
            "Label": "D",
            "Child": [
                {
                    "Id": 8,
                    "Label": "H"
                }, {
                    "Id": 9,
                    "Label": "I"
                }
            ]
        }
    ]
};
