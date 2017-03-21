var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');

//kintamieji

var vardas, pastas, slaptas, who;
var tema;
var destytojas;
var klausimaS;
var pamNr;

app.use(express.static('public'))
app.use(bodyParser());
app.use(bodyParser.json());
app.use('/', router);

var connection;

app.get("/pamokos", function(req,res) {
	pamokos(res);
});
app.get("/vartotojai", function(req,res) {
	tikrinti(res);
});

app.get("/login", function(req,res) {
	res.redirect('/login.html');
});

app.post("/register", function(req,res) {
	who = 2;
	console.log("Role = " + who);
	pamokos(res);
});
app.post("/pridetiPamoka", function(req,res) {
	res.redirect('/pridetipam.html');
});
app.post("/irasytiPam", function(req,res) {
	pamNr = req.body.pamokosNr;
	klausimaS = req.body.klausimas;
	destytojas = req.body.destytojas;
	tema = req.body.tema;
	console.log(pamNr + " " + klausimaS + " " + destytojas + " " + tema);
	pridetiKlausima(res);
	res.redirect('/home.html');
});

app.post("/registerpart2", function(req,res) {
	vardas = req.body.username;
	pastas = req.body.email;
	slaptas = req.body.passwords;
	console.log(vardas + " " + pastas + " " + slaptas);
	registruotis(res);
	res.redirect('/registerdone.html');
});

function registruotis(res){
	
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			var post = {
				name: vardas,
				email: pastas,
				passwords: slaptas,
				role: who
			};
			var query = connection.query('INSERT INTO vartotojai SET ?', post, function(err, result) {
				
			});
			query.sql;
			connection.end();
		}
	});
}
function pridetiKlausima(res){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			var post = {
				pamokosNr: pamNr,
				klausimas: klausimaS,
				autorius: destytojas,
				tema: tema
			};
			var query = connection.query('INSERT INTO pamokostable SET ?', post, function(err, result) {
				if(!!error) {
					consoloe.log('Irasymo klaida klausimo');
				} else {
					query.sql;
				}
			});
			connection.end();
		}
	});
}
function tikrinti(res){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query("SELECT * FROM vartotojai", function(error, rows, fields) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log(rows);
				res.json(rows);
			}
			});
			connection.end();
		}
	});
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) == index;
}

function pamokos(res){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query("SELECT * FROM pamokostable", function(error, rows, fields) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log(rows);
				res.json(rows);
			}
			});
			connection.end();
		}
	});
}


app.listen(3000);
