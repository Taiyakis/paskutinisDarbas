"use strict";
var soap = require('soap');
var http = require('http');
var express = require('express');
var xml = require('fs').readFileSync('prisijungimas.wsdl', 'utf8');

var atsakymas = "";
var service = {
	ManoService : {
		uzklausosPort : {
			zinutes: function (args) {
				if (args.passwords == null || args.username == null) {
					atsakymas = "Pamirsote ivesti *username arba (slaptazodi)";
				} else if (args.username == "admin@gmail.com" && args.passwords == "admin") {
					atsakymas = "Sveiki, prisijunge " + args.username;
				} else {
					atsakymas = "Klaidingai suvesti duomenys";
				}
				return { atsakymas }
			}
		}
	}
};


var server = http.createServer(function(request,response) {
	response.end("404?: Not Found: " + request.url);
});

//server.listen(777);
//soap.listen(server, '/login', service, xml);

var app = express();
var router = express.Router();
var bodyParser = require('body-parser');

app.use(express.static('public'))
app.use(bodyParser());
app.use('/', router);

app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.listen(777, function(){
	soap.listen(app, '/login', service, xml);
});