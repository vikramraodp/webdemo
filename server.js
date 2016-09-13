var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , fs = require('fs');

var jsreport = require('jsreport');
var bodyParser = require('body-parser');
var request = require('sync-request');

var app = express()
app.set('port', process.env.PORT || 7000);
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))

app.use(express.static(__dirname + '/public'))

var errorHandler = function(err, req, res, next){
   console.log(err.stack);
   res.send(500);
};

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Virginia Demo - Web', action: 'reject' }
  )
})

app.use(errorHandler);

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var monologue_svc = function(text, seed) {
  var res = request('POST', 'http://api.virginia.net.in/monologue', {
    json: { monologue: text, seed: seed }
  });
  var result = JSON.parse(res.getBody('utf8'));
  return result;
}

var generate_report_string = function(text) {
  var pat_info = monologue_svc(text,'pat_registration');
  var clinical_info = monologue_svc(text,'clinicalv2');

  var report_string = '';

  for(var i = 0; i < pat_info.out.length; i++) {
    report_string += pat_info.out[i].for;
    report_string += '=';
    report_string += encodeURIComponent(pat_info.out[i].match);
    report_string += '&';
  }

  for(var i = 0; i < clinical_info.out.length; i++) {
    report_string += clinical_info.out[i].for;
    report_string += '=';
    report_string += encodeURIComponent(clinical_info.out[i].match);
    report_string += '&';
  }

  report_string =  report_string.slice(0, -1);
  return report_string;
}

app.get('/report', function (req, res) {
  var index = req.url.indexOf('?');
  var query = req.url.substr(index+1);
  var generate_url = 'http://localhost:' + app.get('port') + '/generate';
  if(query.length > 0) {
    generate_url += '?' + query;
  }

  jsreport.render({ template: { content: "blank", phantom: { url: generate_url },  engine: "jsrender", recipe: "phantom-pdf" } }).then(function(out) {
    out.stream.pipe(res);
  }).catch(function(e) {
    res.end(e.message);
  });
})

app.post('/report', function (req, res) {
    var data = generate_report_string(req.body.text);
    data = '/report?' + data;
    var result  = { url: data};
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
})

app.get('/generate', function (req, res) {

  var age_unit = req.query.age_unit;
  if(age_unit) {
    if(!age_unit.endsWith("s")) {
      age_unit += "s";
    }
  }

  var gender = req.query.gender;
  if(gender) {
    gender = gender.capitalize();
  }

  res.render('report',
    { first_name : req.query.first_name,
      last_name: req.query.last_name,
      age: req.query.age,
      gender: gender,
      address: req.query.address,
      signs_symptoms: req.query.symptoms,
      current_medication: req.query.medication,
      findings: req.query.findings,
      patient_history: req.query.patienthistory,
      family_history: req.query.familyhistory,
      procedures: req.query.procedures,
      lab_events: req.query.labevents,
      age_unit: age_unit
    }
  )
})

app.listen(app.get('port'),
  function(){
    console.log("Virginia Web Demo server running on port " + app.get('port'));
});
