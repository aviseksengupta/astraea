var express = require('express');
var app = express();
var expressapp = app.get('/', callback);

var callback = function (req, res) {
  res.send('Hello World!');
}

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
