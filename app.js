
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cheerio = require('cheerio');

var store_name = function (id){
       if(id==='DEPT001')                                                                                                                                                                                                      
         return 'Korean 1';                                                                                                                                                                                                     
  else if(id==='DEPT002')                                                                                                                                                                                                      
         return 'Korean 2';                                                                                                                                                                                                      
  else if(id==='DEPT003')                                                                                                                                                                                                      
         return '탕맛기픈';                                                                                                                                                                                                      
  else if(id==='DEPT004')                                                                                                                                                                                                      
         return '가츠엔';                                                                                                                                                                                                      
  else if(id==='DEPT005')                                                                                                                                                                                                      
         return 'Western';                                                                                                                                                                                                      
  else if(id==='DEPT006')                                                                                                                                                                                                      
         return 'Snapsnack';                                                                                                                                                                                                      
  else if(id==='DEPT007')                                                                                                                                                                                                      
         return 'TAKE OUT';                                                                                                                                                                                                      
  else                                                                                                                                                                                                                         
         return '';                                                                                                                                                                                                             
}
var dela = {
  getlunchMenu : function (cb){
    var options1 = {
      host: "www.sdsfoodmenu.co.kr",
      port: 9106,
      path: "/foodcourt/menuplanner/list?zoneId=ZONE01"
    };
    
    var options2 = {
      host: "www.sdsfoodmenu.co.kr",
      port: 9106,
      path: "/foodcourt/menuplanner/list?zoneId=ZONE02"
    };
    
    var lunchmenu=[];
    var html1 ="";
    var html2 ="";
    var req1 = http.request(options1, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        html1+=chunk;
      });
      res.on('end', function() {
        $=cheerio.load(html1);
        $('td').each(function(i,td){
          if(i!==0){
            var children = $(this).children();
            if(children.length==7){
              lunchmenu.push({
                "f":"B1 "+store_name(children[0].parent.parent.parent.parent.attribs.class.substring(0,7)),
                "n":children[0].children[0].data,
                "en":children[2].children[0].data,
                "c":children[4].children[0].data.substring(0,children[4].children[0].data.length-5),
                "w":children[6].children[0].data
              });
            }
          }
        });
        req2.end();
      });
    });
    var req2 = http.request(options2, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        html2+=chunk;
      });
      res.on('end', function() {
        $=cheerio.load(html2);
        $('td').each(function(i,td){
          if(i!==0){
            var children = $(this).children();
            if(children.length==7){
              lunchmenu.push({
                "f":"B2 "+store_name(children[0].parent.parent.parent.parent.attribs.class.substring(0,7)),
                "n":children[0].children[0].data,
                "en":children[2].children[0].data,
                "c":children[4].children[0].data.substring(0,children[4].children[0].data.length-5),
                "w":children[6].children[0].data
              });
            }
          }
        });
        cb(lunchmenu);
      });
    });
    req1.on('error', function(e) {
      console.log('problem with request1: ' + e.message);
    });
    req2.on('error', function(e) {
      console.log('problem with request2: ' + e.message);
    });
    req1.end();
  }
};

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  dela.getlunchMenu(function(data){ res.send(data);});
});
var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'), app.get('ip'));
});
