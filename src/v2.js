'use strict';

/*
import Promise from 'bluebird';
import restify from 'restify';
import assert from 'assert-plus';
*/

let restify = require('restify');
let assert = require('assert-plus');
let Promise = require('bluebird');
let debug = require('debug')('foobot:v2')
const querystring = require('querystring');

// https://api.foobot.io/apidoc/index.html
module.exports = class FoobotClient {
//class FoobotClient {

  constructor(options) {
    assert.object(options, 'options');
    assert.string(options.apiKey, 'options.apiKey');
    assert.optionalString(options.authToken, 'options.authToken');
    assert.optionalObject(options.log, 'options.log');
    assert.optionalString(options.url, 'options.url');

    let self = this;
    let url = options.url || 'https://api.foobot.io/';

    this.client = restify.createJsonClient({
      log: options.log,
      name: 'FoobotClient',
      // type: 'json',
      url: url,
      headers: {
        //'X-API-KEY-TOKEN': options.apiKey,
        //'X-AUTH-TOKEN': options.authToken
      },
      userAgent: 'node-foobot-client'
    });

    this.setApiToken(options.apiKey);

    if (options.authToken) {
      this.setAuthToken(options.authToken);
    }

    if (options.log) {
      this.log = options.log.child({component: 'FoobotClient'}, true);
    }

    this.url = options.url;
    this.apiKey = options.apiKey;
    this.authToken = options.authToken;

    this.post = function (path, object) {
      return Promise.promisify(this.client.post, { context: this.client, multiArgs: true })(path, object)
        .tap(function(result) {
          let req = result[0],
            res = result[1],
            obj = result[2];

          self.captureHeaders((res||{}).headers);
        })
        .spread(function(req, res, obj) {
          return [obj, req, res];
        });
    };

    this.get = function (path) {
      return Promise.promisify(this.client.get, { context: this.client, multiArgs: true })(path)
        .tap(function(result) {
          let req = result[0],
            res = result[1],
            obj = result[2];

          self.captureHeaders((res||{}).headers);
        })
        .spread(function(req, res, obj) {
          return [obj, req, res];
        });
    };
  }

  static createClient(options) {
    return new FoobotClient(options);
  }

  captureHeaders(headers) {
    if (!headers) {
      return;
    }

    let
      limit = headers['x-api-key-limit-remaining'];
      //authToken = headers['x-auth-token']

    if (limit) {
      this.setRemainingApiKeyLimit(limit);
    }

    // if (authToken) {
    //   setAuthToken(authToken);
    // }
  }

  setRemainingApiKeyLimit(value) {
    this.apiKeyLimitRemaining = value;
  }

  setApiToken(apiKey) {
    this.client.headers['X-API-KEY-TOKEN'] = apiKey;
    this.apiKey = apiKey;
  }

  setAuthToken(authToken) {
    this.client.headers['X-AUTH-TOKEN'] = authToken;
    this.authToken = authToken;
  }

  login(userName, password) {
    let self = this;
    assert.string(userName, 'userName');
    assert.string(password, 'password');

    let payload = {
      password: password
    };

    return this.post(`/v2/user/${userName}/login/`, payload)
      .tap(function(result) {
        let obj = result[0],
          req = result[1],
          res = result[2];

        if (obj === true) {
          self.setAuthToken(res.headers['x-auth-token']);
        }
      });
  }

  // GET /v2/owner/{userName}/device/
  identity(userName) {
    assert.string(userName, 'userName');

    return this.get(`/v2/owner/${userName}/device/`);
  }

  // GET /v2/device/{uuid}/datapoint/{start}/{end}/{averageBy}/
  dataPointsByRange(uuid, start, end, averageBy, forceAggregated, getNegativesValues) {
    assert.string(uuid, 'uuid');
    assert.string(start, 'start');
    assert.string(end, 'end');
    assert.string(averageBy, 'averageBy');
    assert.optionalString(forceAggregated, 'forceAggregated');
    assert.optionalString(getNegativesValues, 'getNegativesValues');

    let qs = querystring.stringify({ forceAggregated: forceAggregated || true, getNegativesValues: getNegativesValues });
    return this.get(`/v2/device/${uuid}/datapoint/${start}/${end}/${averageBy}/?${qs}`);
  }

  // GET /v2/device/{uuid}/datapoint/{period}/last/{averageBy}/
  dataPointsByPeriod(uuid, period, averageBy) {
    assert.string(uuid, 'uuid');
    assert.string(period, 'start');
    assert.string(averageBy, 'averageBy');

    return this.get(`/v2/device/${uuid}/datapoint/${period}/last/${averageBy}/`);
  }
}

//export default FoobotClient
