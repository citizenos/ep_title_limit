'use strict';

/**
 *
 * @param hook
 * @param context
 * @param cb
 * @returns {*}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_collectcontentpre
 */
exports.collectContentPre = (hook, context, cb) => {
  if (context.cls && context.cls.indexOf('ttl') > -1) {
    context.cc.doAttrib(context.state, 'ttl::ttl');
  }

  return cb();
};
