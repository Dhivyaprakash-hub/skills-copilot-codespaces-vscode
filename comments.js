// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect("mongodb://localhost:27017/comments", function(err, database) {
  if(err) throw err;
  db = database;
});

http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("URL path: " + urlObj.pathname);
  console.log("URL search: " + urlObj.search);
  console.log("URL query: " + urlObj.query["q"]);
  if (urlObj.pathname.indexOf("comment") != -1) {
    console.log("comment route");
    if (req.method === "POST") {
      console.log("POST comment route");
      req.on('data', function (data) {
        console.log("post data: " + data);
        var jsonData = JSON.parse(data);
        console.log("json data: " + jsonData);
        db.collection("comments").insert(jsonData, function(err, records) {
          if (err) throw err;
          console.log("Record added as " + records[0]._id);
          res.writeHead(200);
          res.end("");
        });
      });
    } else if (req.method === "GET") {
      console.log("GET comment route");
      var query = urlObj.query["q"];
      if (query) {
        console.log("query: " + query);
        db.collection("comments").find(query).toArray(function(err, items) {
          if (err) throw err;
          console.log("item: " + items);
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(items));
        });
      } else {
        res.writeHead(200);
        res.end("");
      }
    }
  } else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(80);
console.log('Server running on port 80');
