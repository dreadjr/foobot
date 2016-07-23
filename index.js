// var Client = require('./lib/client');
//
// require('pkginfo')(module, 'version');
//
// exports.Foobot = Client;

var FoobotV2Client = require('./src/v2');

require('pkginfo')(module, 'version');

module.exports = {
  v2: FoobotV2Client
};
