'use strict'

var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = {};

exports.loadSettings = function (hook_name, context) {
    settings = context.settings.ep_title_limit;
};

exports.clientVars = function (hook, context, callback) {
    return callback({"ep_title_limit": settings});
};

exports.eejsBlock_body = function (hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_title_limit/templates/modal.ejs");
  
    return cb();
};
exports.eejsBlock_styles = function (hookName, args, cb) {
    var style = eejs.require('ep_title_limit/templates/styles.ejs', {}, module);
    args.content += style;

    return cb();
};
