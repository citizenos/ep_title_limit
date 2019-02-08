'use strict'

var _ = require('ep_etherpad-lite/static/js/underscore');

var collectContentPre = function(hook, context){
  if(context.cls && context.cls.indexOf('ttl') > -1){
    context.cc.doAttrib(context.state, "ttl::ttl");
  }
};

exports.collectContentPre = collectContentPre;
