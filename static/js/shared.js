'use strict';

exports.collectContentPre = (hook, context, cb) => {
  if (context.cls && context.cls.indexOf('ttl') > -1) {
    context.cc.doAttrib(context.state, 'ttl::ttl');
  }

  return cb();
};
