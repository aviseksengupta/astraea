var express = require('express');
var mysql = require('mysql');
var md5 = require('MD5');
var app = express();

var client = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'avisek123',
	port: 3306,
	database: 'demo'
	});

var registerUser = function(req, res){
	console.log("Register user function called with the following parameters: "+req.query.userid+","+ req.query.name+","+ req.query.email+","+ md5(req.query.password));
	client.connect(function(err){
		if(err)
		{
			console.log("Error connection to database server");
			return;
		}
		console.log("Connected to the database");
	});
	var sql = "INSERT INTO users VALUES ("+req.query.userid+",'"+ req.query.name+"','"+ req.query.email+"','"+ md5(req.query.password)+"')";
//	console.log(sql);
	client.query(sql);
	client.end(function(err){});
	res.send("Done");
}
		
var callback = function(req, res) {
	res.send("Hello World");
}

var expressapp = app.get('/', callback);

var registerapp = app.get('/registerUser', registerUser);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
