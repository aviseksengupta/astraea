var express = require('express');
var mysql = require('mysql');
var md5 = require('MD5');
var app = express();
var bodyParser = require('body-parser');
var guid = require('Guid');
var uId = require('uid');
app.use(bodyParser.json());

var connectToDB = function(){
	var client = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'caprediem',
		port: 3306,
		database: 'demo'
		});
	return client;
};

//Webservice - register new user
var registerUserWS = function(req, res){
	var client = connectToDB();
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

//Webservice - show details of a user
var loginUserWS = function(req, res){
	var client = connectToDB();

	var sql = "SELECT COUNT(*) as usercount FROM users WHERE email = '"+ req.body.request.email+"' and password = '"+md5(req.body.request.password)+"'";
	client.query(sql, function(err, rows, fields){
		if(err) throw err;
		var userCount = rows[0].usercount;
		if(userCount == 1)
			res.send("Successful");
		else 
			res.send("Failure");
	});
	client.end(function(err){});
}	

//Webservice - forgot password

var forgotPasswordWS = function(req, res){
	var client = connectToDB();
	var sql = "INSERT INTO passwordreset VALUES (?,?,?,curdate(), 0)";
	var user = getUserDetails(req.body.email);
	client.query(sql, [uId.uid(), user.userid, guid.create()], function(err){
		if(err) throw err;
	});
}

var getUserDetails = function(email) {
	var client = connectToDB();
	var sql = "SELECT userid, name, email from users where email = ?";
	var user = null;
	client.query(sql, [email], function(err, rows, fields){
		if(err) throw err;
		if(rows.length <= 0)
			return null;
		user.userid = rows[0].userid;
		user.name = rows[0].name;
		user.email = rows[0].email;
	}
	);

	return user;
}



var registerapp = app.get('/registerUser', registerUserWS);
var registerapppost = app.post('/registerUser', registerUserWS);
var loginapp = app.post('/login', loginUserWS);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
