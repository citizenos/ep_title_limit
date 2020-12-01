'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
let settings = {};

exports.loadSettings = (hook, context, cb) => {
  settings = context.settings.ep_title_limit;
  return cb();
};

exports.clientVars = (hook, context, callback) => callback({ep_title_limit: settings});

exports.eejsBlock_body = (hook, args, cb) => {
  args.content += eejs.require('ep_title_limit/templates/modal.ejs');

  return cb();
};
exports.eejsBlock_styles = (hook, args, cb) => {
  const style = eejs.require('ep_title_limit/templates/styles.ejs', {}, module);
  args.content += style;

  return cb();
};
