var Foobot = require('./../');

require('dotenv').config();

var FoobotClient = Foobot.v2;

var restify = require('restify');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'unit_test',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
  });

var options = {
  apiKey: process.env.FOOBOT_API_KEY,
  //authToken: process.env.FOOBOT_AUTH_TOKEN,
  //log: log
}
var client = new FoobotClient(options);

//var nock = require('nock');
//nock.recorder.rec();

// client
//   .dataPointsByPeriod(process.env.FOOBOT_UUID, "0", "0")
//   .spread(function(obj, req, res) {
//     console.log(obj);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })

// client
//   .dataPointsByRange(process.env.FOOBOT_UUID, "2016-05-10T18:00:00+02:00", "2016-05-10T20:00:00+02:00", "3600", "true", "true")
//   .spread(function(obj, req, res) {
//     console.log(obj);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })

// client
//   .identity(process.env.FOOBOT_USERNAME)
//   .spread(function(obj, req, res) {
//     console.log(obj);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })

// client
//   .login(process.env.FOOBOT_USERNAME, process.env.FOOBOT_PASSWORD)
//   .spread(function(obj, req, res) {
//     console.log(obj);
//     console.log(client.authToken);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })

// client
//   .login(process.env.FOOBOT_USERNAME, process.env.FOOBOT_PASSWORD)
//   .spread(function(obj, req, res) {
//     console.log(obj);
//     console.log(client.authToken);
//     console.log('limit', client.apiKeyLimitRemaining);
//     client
//       .identity(process.env.FOOBOT_USERNAME)
//       .spread(function(obj, req, res) {
//         console.log(obj);
//         console.log('limit', client.apiKeyLimitRemaining);
//       })
//       .catch(function(err) {
//         console.log(err);
//       })
//   })
//   .catch(function(err) {
//     console.log(err);
//   })
