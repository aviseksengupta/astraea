var express = require('express');
var mysql = require('mysql');
var md5 = require('MD5');
var app = express();
var bodyParser = require('body-parser');
var guid = require('guid');
var nodemailer = require('nodemailer');

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
var sendMail = function(mailid, mailsubject, body){
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
	        auth: {
		        user: 'aviseksengupta@gmail.com',
			pass: 'AuthId1201@viseK'
		    }
	});
	
	var mailOptions = {
		from: 'aviseksengupta@gmail.com',
		to: mailid, 
		subject: mailsubject, 
		text: body, 
		html: '<b>Hello world</b>'
	};
	
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			return console.log(error);
		        }
	        console.log('Message sent: ' + info.response);
	});
}	

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
	var sql = "INSERT INTO users VALUES (NULL,'"+ req.body.request.name+"','"+ req.body.request.email+"','"+ md5(req.body.request.password)+"')";
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
	var respond= function(user){ 
		console.log("Inside the respond function: user is "+user+" and user id is "+user.userid);
		if(user == null)
			res.send("Email not associated to any user");
		else
		{
			var forgotpasswordid = 500;//uid(10);
			var forgotpwdguid = guid.create();
			var sql = "INSERT INTO passwordreset VALUES (NULL,'"+user.userid+"','"+forgotpwdguid+"',curdate(), 0)";
			client.query(sql,  function(err){
			if(err) throw err;
			});
			console.log("uid "+forgotpasswordid+" guid "+forgotpwdguid+" email "+req.body.request.email);
			sendMail(req.body.request.email, "Password Reset", "Hi, You requested your password to be reset. Please follow the link below to do the same.\nhttp://localhost/resetPassword/"+forgotpwdguid);
			res.send("Email has been sent to you\n");
		}
	}
	getUserDetails(req.body.request.email, respond);
	//console.log(uId);
}

var getUserDetails = function(email, respond) {
	var client = connectToDB();
	var sql = "SELECT userid, name, email from users where email = ?";
	client.query(sql, [email], function(err, rows, fields){
	//	if(err) 
	//		throw err;
		if(rows.length <= 0)
			return null;
		var userid = rows[0].userid;
		var name = rows[0].name;
		var email = rows[0].email;

		var user = {userid: userid, name: name, email: email};
		respond(user);
	}
	);
}

var registerapp = app.get('/registerUser', registerUserWS);
var registerapppost = app.post('/registerUser', registerUserWS);
var loginapp = app.post('/login', loginUserWS);
var forgotpasswordapp = app.post('/forgotpassword', forgotPasswordWS);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
