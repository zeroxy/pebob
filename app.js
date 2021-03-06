
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cheerio = require('cheerio');
var CronJob = require('cron').CronJob;


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
  else if(id==='DSDS011')
         return 'Korean 1';
  else if(id==='DSDS012')
         return 'Korean 2';
  else if(id==='DSDS013')
         return 'Napolipoli';
  else if(id==='DSDS014')
         return 'asian picks';
  else if(id==='DSDS015')
         return '고슬고슬 비빈';
  else if(id==='DSDS016')
         return 'Chef`s Counter';
  else if(id==='DSDS017')
         return 'Xing Fu';
  else if(id==='DSDS018')
         return '우리미각면';
  else
         return "";                                                                                                                                                                                                             
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
        var menus = $('td span');
        var menuimgs = $('td img');
        if(menuimgs.length >0){
          menus.splice(0, 1);
          for (var i = 0 ; i < menuimgs.length; i++){
            lunchmenu.push({
              "f"  : "B1 "+store_name( menus[i*4].parent.parent.parent.parent.attribs.class.substring(0,7) ),
              "n"  : menus[i*4  ].children[0].data,
              "en" : menus[i*4+1].children[0].data,
              "c"  : Number(menus[i*4+2].children[0].data.replace(' kcal','').replace(',','')),
              "w"  : menus[i*4+3].children[0].data,
              "i"  : "http://www.sdsfoodmenu.co.kr:9106"+ menuimgs[i].attribs.src
            });
          }
        }
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
        var menus = $('td span');
        var menuimgs = $('td img');
        if(menuimgs.length >0){
          menus.splice(0, 1);
          for (var i = 0 ; i < menuimgs.length; i++){
            lunchmenu.push({
              "f"  : "B2 "+store_name( menus[i*4].parent.parent.parent.parent.attribs.class.substring(0,7) ),
              "n"  : menus[i*4  ].children[0].data,
              "en" : menus[i*4+1].children[0].data,
              "c"  : Number(menus[i*4+2].children[0].data.replace(' kcal','').replace(',','')),
              "w"  : menus[i*4+3].children[0].data,
              "i"  : "http://www.sdsfoodmenu.co.kr:9106"+ menuimgs[i].attribs.src
            });
          }
        }
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
app.use(function(err,req,res,next){
  console.log(err.stack);
  res.status(500).send('Something broke!');
});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var diningmenuJson;
app.get('/', function(req, res){
  res.send(diningmenuJson);
});
app.get('/sort', function(req, res){
  res.sendfile(path.join(__dirname, 'view.html'));
});
var job = new CronJob({
  cronTime: '00 */20 5-18 * * 1-6',
  onTick: function() {
    http.request({host: "pebob.herokuapp.com",path: "/sort"}, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {});
      res.on('end', function(){});
    }).end();
  },
  start: false,
  timeZone: 'Asia/Seoul'
});
var job2 = new CronJob({
  cronTime: '00 */10 5-19 * * 1-6',
  onTick: function() {
    dela.getlunchMenu(function(data){ diningmenuJson = data;});
  },
  start: false,
  timeZone: 'Asia/Seoul'
});

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'), app.get('ip'));
  dela.getlunchMenu (function(data){ diningmenuJson = data;});
  job.start();
  job2.start();
});
