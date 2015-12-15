var express = require('express');
var mysql = require('mysql');
var md5 = require('MD5');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());


var registerUserWS = function(req, res){
	var client = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'avisek123',
		port: 3306,
		database: 'demo'
		});
	console.log("Register user function called with the following parameters: "+req.body.request.userid+","+ req.body.request.name+","+ req.body.request.email+","+ md5(req.body.request.password));
	client.connect(function(err){
		if(err)
		{
			console.log("Error connection to database server");
			return;
		}
		console.log("Connected to the database");
	});
	console.log(req.body);
	var sql = "INSERT INTO users VALUES ("+req.body.request.userid+",'"+ req.body.request.name+"','"+ req.body.request.email+"','"+ md5(req.body.request.password)+"')";
	client.query(sql);
	client.end(function(err){});
	res.send("Done");
}

var registerapp = app.get('/registerUser', registerUserWS);
var registerapppost = app.post('/registerUser', registerUserWS);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
