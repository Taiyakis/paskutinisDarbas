var express = require('express');
var app = express();

app.disable('x-powered-by');

app.use(express.static('public'))


app.get('/', function(request, response) {
	var blocks = 'Testas';
	response.send(blocks);
});

app.listen(8001, function() {
	console.log('Listening server on port 8001');
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})