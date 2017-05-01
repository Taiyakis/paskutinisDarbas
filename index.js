var express = require('express');
var app = express();
var soap = require('soap');
var url = 'http://localhost:777/login?wsdl';
var bodyParser = require('body-parser');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var session = require('express-session');
var methodOverride = require('method-override');

//kintamieji

var vardas, pastas, slaptas, who, slaptazodis;
var tema;
var destytojas;
var klausimaS;
var pamNr;
var valid = false;
var registerName, registerPastas;
var connection;
var arPrisijunges;


app.use(express.static('public'))
app.use(bodyParser());
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({secret:"1f6a5sf16a5s1d65sadsasd", resave:false,saveUninitialized:true}));
app.use('/', router);

app.get("/tikrintiSesija", function(req, res) {
	if("undefined" === typeof ssn){
		console.log("Vartotojas neprisijunges");
		arPrisijunges = false;
		res.json(arPrisijunges);
	} else {
		arPrisijunges = true;
		res.json(arPrisijunges);
	}
});
app.get("/uzdarytiSesija", function(req, res) {
	valid == false;
	ssn = undefined;
	res.redirect('login.html');
});

app.get("/donereg", function(req,res) {
	doneRegister(res);
});
app.get("/pamokos", function(req,res) {
	pamokos(res);
	console.log("" + valid);
});
app.get("/vartotojai", function(req,res) {
	tikrinti(res);
});

app.get("/login", function(req,res) {
	res.redirect('/login.html');
});

app.get("/spauzdintiPamoka", function(req, res) {
	console.log("Gautos pamokas value: " + pamokosValue);
	vienaPamoka(res , pamokosValue);
});

app.post("/login", function(req,res) {
	prisijungimas(req,res);
	console.log(valid);
});

app.post("/pasirinktaPamoka", function(req, res) {
	pamokosValue = req.body.test;
	console.log(pamokosValue);
	res.redirect('/spresti.html');
});

app.post("/pakeisti", function(req,res) {
	pakeistiVarda(req);
	res.redirect('/paskyra.html');
});

app.post("/register", function(req,res) {
	who = req.body.optradio;
	if("undefined" === typeof who) {
		console.log("Role = " + who);
		
	} else {
		console.log("Role = " + who);
		res.redirect('registerpart2.html');
	}
});

app.post("/pridetiPamoka", function(req,res) {
	res.redirect('/pridetipam.html');
});

app.post("/registerpart2", function(req,res) {
	registracijosvalid = true;
	vardas = req.body.username;
	pastas = req.body.email;
	slaptas = req.body.passwords;
	slaptas2 = req.body.passwords2;
	
	if("" == vardas || "" == pastas || "" == slaptas || "" == slaptas2) {
		console.log("TRUKSTA INFO");
		registracijosvalid = false;
	}
	if(slaptas != slaptas2){
		registracijosvalid = false;
	}
	
	if(registracijosvalid){
		registruotis(res, req);
		//res.redirect('/registerdone.html');
	}
});

app.put("/paskyra/:id/vedit", function(req, res) {
	var vardas = req.body.vardas;
	var iD = req.params.id;
	console.log("PUT methodas " + iD + " " + vardas);
	pakeistiVardaPUT(iD, vardas);
	res.redirect('../../paskyra.html');
});


app.put("/paskyra/:id/pedit", function(req, res) {
	var slaptazodis = req.body.slaptazodis;
	var iD = req.params.id;
	console.log("PUT methodas " + iD + " " + slaptazodis);
	pakeistiSlaptazodiPUT(iD, slaptazodis);
	res.redirect('../../paskyra.html');
});

app.put("/pamoka/:pamokosID/edit", function(req,res) {
	var klausimas = req.body.klausimas;
	var paveikslelis = req.body.paveikslelis;
	var atsakymas = req.body.atsakymas;
	var pamID = req.params.pamokosID;
	console.log("pakeista " + pamID + " " + klausimas + " " + paveikslelis + " " + atsakymas);
	pakeistiPamoka(pamID, klausimas, paveikslelis, atsakymas, res);
});

app.post("/pamoka/insert/:autorius", function(req, res) {
	var nr = req.body.nr;
	var klausimas = req.body.klausimas;
	var paveikslelis = req.body.paveikslelis;
	var atsakymas = req.body.atsakymas;
	var autorius = req.params.autorius;
	var tema = req.body.tema;
	var ProgKalba = req.body.KalbaP;
	console.log(autorius +" prideta pam" + " " + klausimas + " " + paveikslelis + " " + atsakymas + " " + nr + " " + tema + " " + ProgKalba);
	pridetiNaujaKlausima(nr, klausimas, paveikslelis, atsakymas, autorius, tema, ProgKalba, ssn.aiD);
	res.redirect('../../home.html');
});

app.delete("/pamoka/:id/delete", function(req, res) {
	var id = req.params.id;
	istrintiKlausima(res, id);
});

app.post("/irasytiPam", function(req,res) {
	tema = req.body.tema;
	KalbaP = req.body.progkalba;
	autorius = ssn.usernamas;
	sesijosid = ssn.aiD;
	pamokosNumeris = req.body.pamNr;
	//console.log(tema + " " + KalbaP + " " + autorius + " " + sesijosid + " " + pamokosNumeris);
	pridetiKlausima(res, tema, KalbaP, autorius, sesijosid, pamokosNumeris)
	res.redirect('/home.html');
});

function pridetiKlausima(res, temaN, KalbaPN, autoriusN, sesijosidN, pamokosNumerisN){
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
				tema: temaN,
				ProgKalba: KalbaPN, 
				autorius: autoriusN,
				sesijosID: sesijosidN,
				pamokosNr: pamokosNumerisN
			};
			var query = connection.query('INSERT INTO pamokostable SET ?', post, function(err, result) {
				if(!!error) {
					console.log('Irasymo klaida temos');
				} else {
					query.sql;
				}
			});
			connection.end();
		}
	});
}

function istrintiKlausima(res, pamokID) {
	console.log('Istrinti pagal id = ' + pamokID);
	
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
			connection.query('DELETE FROM pamokostable WHERE pamokosID = ?',[pamokID], function(error, result) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log('Pakeistas klausimas: '+ result.changedRows);
				res.redirect('../../home.html');
			}
			});
			connection.end();
		}
	});
}

function pridetiNaujaKlausima(nrN, klausimasN, paveikslelisN, atsakymasN, autoriusN, temaN, kalbaN, sessionID){
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
				pamokosNr: nrN,
				klausimas: klausimasN,
				paveikslelis: paveikslelisN,
				atsakymas: atsakymasN,
				autorius: autoriusN,
				tema: temaN,
				ProgKalba: kalbaN,
				sesijosID: sessionID
			};
			console.log(post);
			
			var query = connection.query('INSERT INTO pamokostable SET ?', post, function(err, result) {
				if(!!error) {
					console.log('Irasymo klaida klausimo');
				} else {
					console.log('Klausimas pridetas');
					query.sql;
				}
			});
			connection.end();
		}
	});
}


function pakeistiPamoka(id, klausimas, paveikslelis, atsakymas, res){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	
	console.log(id + "  "+ klausimas);
	var naujasKlausimas = klausimas;
	var naujasPaveikslelis = paveikslelis;
	var naujasAtsakymas = atsakymas;
	var pamokosId = id;
	
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query('UPDATE pamokostable SET klausimas = ?, atsakymas = ?, paveikslelis = ? WHERE pamokosID = ?',[naujasKlausimas, naujasAtsakymas, naujasPaveikslelis, pamokosId], function(error, result) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log('Pakeistas klausimas: '+ result.changedRows);
				res.redirect('../../home.html');
			}
			});
			connection.end();
		}
	});
}

function vienaPamoka(res, pamokosValue) {
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	
	pamID = pamokosValue;
	
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query("SELECT * FROM pamokostable WHERE pamokosNr = " + pamID, function(error, rows, fields) {
			if(!!error) {
				console.log('Error in the query' + error);
			} else {
				console.log(rows);
				res.json(rows);
			}
			});
			connection.end();
		}
	});
}

function registruotis(res, req){
	var irasymas = true;
	registerName = vardas;
	registerPastas = pastas;
	
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
				
				for(var i = 0; i<rows.length; i++){
					if(rows[i].email == pastas){
						irasymas = false;
					}
				}
					
				if(irasymas){
					console.log('Insertas pavyko');
					var post = {
						name: vardas,
						email: pastas,
						passwords: slaptas,
						role: who
					};
					var query = connection.query('INSERT INTO vartotojai SET ?', post, function(err, result) {});
					query.sql;
					res.redirect('/registerdone.html');
				} else {
					console.log("Jau egzistuoja toks vartotojas");
				}
			}
			connection.end();
			});
			
		}		
	});
}

function doneRegister(res) {
	//var stringas = [rgs.registerName, rgs.registerPastas];
	var stringas = [registerName, registerPastas];
	res.json(stringas);
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
			connection.query("SELECT * FROM vartotojai WHERE ID = " + ssn.aiD, function(error, rows, fields) {
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

function pakeistiSlaptazodiPUT(id, slaptazodis){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	
	console.log(id + "  "+ slaptazodis);
	var sesijosId = id;
	var norimasSlaptazodis = slaptazodis;
	
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query('UPDATE vartotojai SET passwords = ? WHERE ID = ?',[norimasSlaptazodis, sesijosId], function(error, result) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log('Pakeistas Vardas '+ result.changedRows);
			}
			});
			connection.end();
		}
	});
}


function pakeistiVardaPUT(id, vardas){
	connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'vartotojasdb'
	});
	
	console.log(id + "  "+ vardas);
	var sesijosId = id;
	var norimasVardas = vardas;
	
	connection.connect(function(error) {
		if(!!error) {
			console.log('Error');
		} else {
			console.log('Connected');
			connection.query('UPDATE vartotojai SET name = ? WHERE ID = ?',[norimasVardas, sesijosId], function(error, result) {
			if(!!error) {
				console.log('Error in the query');
			} else {
				console.log('Pakeistas Vardas '+ result.changedRows);
			}
			});
			connection.end();
		}
	});
}

function prisijungimas(req, res) {
	vardas = req.body.username;
	slaptazodis = req.body.passwords;
	
	ssn = req.session;
	
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
				for(var j = 0; j < rows.length; j++) {
					if(vardas == rows[j].email && slaptazodis == rows[j].passwords && valid == false) {
						console.log(vardas + " " + rows[j].email + " ------ " + slaptazodis + " " + rows[j].passwords);
						ssn.aiD = rows[j].ID;
						ssn.usernamas = rows[j].name;
						valid = true;
					}
				}
				if(valid == true){
					console.log("" + ssn.aiD);
					Soapas(valid);
					res.redirect('/home.html');
				} else {
					Soapas(valid);
					res.redirect('/login.html');
				}	
			}
			});
			connection.end();
		}
	});
}

function Soapas(reiksme) {
	var validus = reiksme;
	
	soap.createClient(url, function(error, client) {
		if (error) {
			throw error;
		}
			
		var loginDuomenys = {
			kintamasis: validus
		}
			
		client.describe().ManoService.uzklausosPort;
		client.zinutes(loginDuomenys,function(err,res){
				if (err) throw err;
					console.log(res);
				return res;
		});
	});
}


app.listen(3000);
