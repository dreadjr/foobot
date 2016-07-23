'use strict';

var nock = require('nock');
var sinon = require('sinon');
var Promise = require('bluebird');
var _ = require('lodash');
var respect = require('respect');

var chai = require('chai');
chai.use(respect.chaiPlugin());

var assert = chai.assert;
var should = chai.should();
var expect = chai.expect;


describe('v2', function () {

  var bunyan = require('bunyan');
  var restify = require('restify');
  var Foobot = require('./../');
  var FoobotClient = Foobot.v2;

  process.env.FOOBOT_API_KEY = 'API_KEY';
  process.env.FOOBOT_AUTH_TOKEN = 'AUTH_TOKEN';
  process.env.FOOBOT_USERNAME = 'USERNAME';
  process.env.FOOBOT_PASSWORD = 'PASSWORD';

  var log = bunyan.createLogger({
    name: 'unit_test',
    level: process.env.LOG_LEVEL || 'trace',
    serializers: restify.bunyan.serializers,
    stream: process.stdout
  });

  var options = {
    apiKey: process.env.FOOBOT_API_KEY,
    authToken: process.env.FOOBOT_AUTH_TOKEN,
    //log: log
  }

//  var client = new FoobotClient(options); // OR
  var client = FoobotClient.createClient(options);

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.enableNetConnect();
  });

  describe('login', function () {
    let request, response;

    before(function () {
      request = {
        password: process.env.FOOBOT_PASSWORD
      };

      response = true;

      nock('https://api.foobot.io:443', {
        "encodedQueryParams":true,
        reqheaders: {
          'X-API-KEY-TOKEN': process.env.FOOBOT_API_KEY
        }
      })
      .post('/v2/user/' + process.env.FOOBOT_USERNAME + '/login/', request)
      .reply(200, true, {
        'content-type': 'application/json;charset=UTF-8',
        date: 'Sat, 23 Jul 2016 05:01:12 GMT',
        server: 'nginx/1.11.1',
        vary: 'Accept-Encoding,Accept-Encoding',
        'x-api-key-limit-remaining': '147',
        'x-auth-token': process.env.FOOBOT_AUTH_TOKEN,
        'transfer-encoding': 'chunked',
        connection: 'keep-alive'
      });

    });

    it('should get x-auth-token', function () {
      return client.login(process.env.FOOBOT_USERNAME, process.env.FOOBOT_PASSWORD)
        .spread(function (result, req, res) {
          expect(result).to.eql(response);
          expect(client.authToken).to.eql(process.env.FOOBOT_AUTH_TOKEN);
          expect(res.headers['x-auth-token']).to.eql(process.env.FOOBOT_AUTH_TOKEN);
        });
    });
  });

  describe('identity', function () {
    let request, response;

    before(function () {
      request = {};

      response = [
        {
          "uuid":"uuid",
          "userId":1234,
          "mac":"AAAA1114A1A1",
          "name":"Foobot"
        }
      ];

      nock('https://api.foobot.io:443', {
        "encodedQueryParams":true,
        reqheaders: {
          'X-API-KEY-TOKEN': process.env.FOOBOT_API_KEY
        }
      })
      .get('/v2/owner/' + process.env.FOOBOT_USERNAME + '/device/')
      .reply(200, response, {
        'content-type': 'application/json;charset=UTF-8',
        date: 'Sat, 23 Jul 2016 05:01:12 GMT',
        server: 'nginx/1.11.1',
        vary: 'Accept-Encoding,Accept-Encoding',
        'x-api-key-limit-remaining': '146',
        'transfer-encoding': 'chunked',
        connection: 'keep-alive'
      });

    });

    it('should get owner device list', function () {
      return client.identity(process.env.FOOBOT_USERNAME)
        .spread(function (result, req, res) {
          expect(result).to.eql(response);
        });
    });
  });

  describe('data points', function () {
    let requestByPeriod, requestByRange, responseByPeriod, responseByRange;

    before(function () {
      requestByPeriod = {
        uuid: "uuid",
        period: "0",
        averageBy: "0"
      };

      requestByRange = {
        uuid: "uuid",
        start: "2016-05-10T18:00:00+02:00",
        end: "2016-05-10T20:00:00+02:00",
        averageBy: "3600",
        forceAggregated: "true",
        getNegativesValues: "true"
      };

      responseByPeriod = {
          "uuid": requestByPeriod.uuid,
          "start": 1469252281,
          "end": 1469252281,
          "sensors": ["time", "pm", "tmp", "hum", "co2", "voc", "allpollu"],
          "units": ["s", "ugm3", "C", "pc", "ppm", "ppb", "%"],
          "datapoints": [
              [1469252281, 11.200001, 24.426, 53.777, 703, 195, 21.2]
          ],
          "sCompatibility": "foobot"
      };
      responseByRange = {
          "uuid": requestByRange.uuid,
          "start": 1462903200,
          "end": 1462910400,
          "sensors": ["time", "pm", "tmp", "hum", "co2", "voc", "allpollu"],
          "units": ["s", "ugm3", "C", "pc", "ppm", "ppb", "%"],
          "datapoints": [
              [1462903200, 5.25, 21.355331, 42.071167, 555.25, 154.24998, 9.42857],
              [1462906800, 5.4625015, 21.450668, 42.231663, 562.4167, 156, 9.891072],
              [1462910400, 5.511539, 21.632692, 42.313614, 560.9231, 155.69232, 9.896155]
          ],
          "sCompatibility": "foobot"
      };

      nock('https://api.foobot.io:443', {
        "encodedQueryParams":true,
        reqheaders: {
          'X-API-KEY-TOKEN': process.env.FOOBOT_API_KEY
        }
      })
      .get('/v2/device/uuid/datapoint/0/last/0/')
      .reply(200, responseByPeriod, {
        'content-type': 'application/json;charset=UTF-8',
        date: 'Sat, 23 Jul 2016 05:42:42 GMT',
        server: 'nginx/1.11.1',
        vary: 'Accept-Encoding,Accept-Encoding',
        'x-api-key-limit-remaining': '142',
        'content-length': '259',
        connection: 'keep-alive'
      });

      nock('https://api.foobot.io:443', {
        "encodedQueryParams":true,
        reqheaders: {
          'X-API-KEY-TOKEN': process.env.FOOBOT_API_KEY
        }
      })
      .get('/v2/device/uuid/datapoint/2016-05-10T18:00:00+02:00/2016-05-10T20:00:00+02:00/3600/')
      .query({"forceAggregated":"true","getNegativesValues":"true"})
      .reply(200, responseByRange, {
        'content-type': 'application/json;charset=UTF-8',
        date: 'Sat, 23 Jul 2016 05:53:53 GMT',
        server: 'nginx/1.11.1',
        vary: 'Accept-Encoding,Accept-Encoding',
        'x-api-key-limit-remaining': '134',
        'content-length': '409',
        connection: 'keep-alive'
      });

    });

    it('should get data points by period', function () {
      return client.dataPointsByPeriod(requestByPeriod.uuid, requestByPeriod.period, requestByPeriod.averageBy)
        .spread(function (result, req, res) {
          expect(result).to.eql(responseByPeriod);
        });
    });

    it('should get data points by range', function () {
      return client.dataPointsByRange(requestByRange.uuid, requestByRange.start, requestByRange.end, requestByRange.averageBy, requestByRange.forceAggregated, requestByRange.getNegativesValues)
        .spread(function (result, req, res) {
          expect(result).to.eql(responseByRange);
        });
    });
  });

});
