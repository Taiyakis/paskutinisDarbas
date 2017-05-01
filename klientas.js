

var soap = require('soap');
var url = 'http://localhost:777/login?wsdl';
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

//kintamieji

var vardas;

app.use(express.static('public'))
app.use(bodyParser());
app.use('/', router);

app.get("/", function(req,res){
	res.send("i am from / GET req");
});

app.post("/login", function(req,res) {
	vardas = req.body.username;
	spaltazodis = req.body.passwords;
	res.send("The Username and password: " + vardas + " Passwords: " + spaltazodis);
	console.log(Soapas());
});

http.createServer(app).listen(852);

function Soapas() {
	soap.createClient(url, function(error, client) {
		if (error) {
			throw error;
		}
			
		var loginDuomenys = {
			username: vardas,
			passwords: spaltazodis
		}
			
		client.describe().ManoService.uzklausosPort;
		client.zinutes(loginDuomenys,function(err,res){
				if (err) throw err;
				
				console.log(res);
				return res;
		});
	});
}
