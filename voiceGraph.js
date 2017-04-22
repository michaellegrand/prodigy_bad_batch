var voiceGraph = {
	"id": "registration",
	"children": [{
			"id": "welcome",
			"children": [{
				"id": "help",
				"children": [{
						"id": "van",
						"children": [{
							"id": "help"
						}]
					}, {
						"id": "report",
						"children": [{
							"id": "help"
						}]
					},
					{

						"id": "info",
						"children": [{
							"id": "help"
						}]
					},
					{
						"id": "leave",
						"children": [{
								"id": "confirmLeave",
								"children": [{
									"id": "help"
								}]
							},
							{
								"id": "confirmCancel",
								"children": [{
									"id": "help"
								}]
							}
						]
					}
				]
			}]
		},
		{
			"Id": "registerZip",
			"children": [{
					"Id": "correctZip"
				},
				{
					"Id": "wrongZip"
				}
			]
		}
	]
}
