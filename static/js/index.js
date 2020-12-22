'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');
const Changeset = require('ep_etherpad-lite/static/js/Changeset');

// Our ttl attribute will result in a ttl class
exports.aceAttribsToClasses = (hook, context) => {
  if (context.key.indexOf('ttl:') !== -1) {
    return ['ttl'];
  }
  if (context.key === 'ttl') {
    return ['ttl'];
  }
};

const _hideInfoModal = () => {
  $('#ttl_modal').hide();
  $('#ttl_modal').removeClass('popup-show');
};
// display and position info modal
const _displayInfoModal = () => {
  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  const padInner = padOuter.find('iframe[name="ace_inner"]');
  const modal = $('#ttl_modal');
  const line = padInner.contents().find('body').children()[0];
  const lineOffsetTop = $(line).offset().top;
  const innerPaddingTop = parseInt(padInner.css('padding-top'));
  const ebHeight = $('#editbar').height();

  const top = lineOffsetTop + $(line)[0].offsetHeight + innerPaddingTop + ebHeight;

  $(modal).off();
  $(modal).on('click', () => {
    _hideInfoModal();
  });
  $(modal).show();
  $(modal).addClass('popup-show');
  $(modal).css({
    top,
  });
};

exports.aceCreateDomLine = (name, context) => {
  const cls = context.cls;
  const ttl = /(?:^| )ttl:([A-Za-z0-9]*)/.exec(cls);

  if (ttl && ttl[1]) {
    const modifier = {
      extraOpenTags: '',
      extraCloseTags: '',
      cls,
    };
    return [modifier];
  }
  return [];
};

const _checkLineForAttr = (rep, line, attr) => {
  const alineAttrs = rep.alines[line];
  let hasAttr = false;
  if (alineAttrs) {
    const opIter = Changeset.opIterator(alineAttrs);
    while (opIter.hasNext()) {
      const op = opIter.next();
      const r = Changeset.opAttributeValue(op, attr, rep.apool);
      if (r) {
        hasAttr = true;
      }
    }
  }

  return hasAttr;
};

let lastVersion = '';
// Wrap over limit text with marker and display info modal
let doInsertTitleLimitMark = function () {
  const maxLength = window.clientVars.ep_title_limit.maxLength;
  const rep = this.rep;
  const documentAttributeManager = this.documentAttributeManager;
  const line = rep.lines.atIndex(0);
  let text = line.text;
  text = text.replace(/(^\*)/, '');
  if (text.trim().length < maxLength || (text === lastVersion && text.trim().length < maxLength)) {
    _hideInfoModal();
    return;
  }
  lastVersion = text;
  if (text.trim().length > maxLength) {
    documentAttributeManager.setAttributesOnRange(
        [0, maxLength + 1],
        [0, line.text.length], [['ttl', 'ttl']]
    );
    _displayInfoModal();
  }
};


// Once ace is initialized, we set ace_doInsertTitleLimitMark and bind it to the context
exports.aceInitialized = (hook, context) => {
  const editorInfo = context.editorInfo;
  editorInfo.ace_doInsertTitleLimitMark = _(doInsertTitleLimitMark).bind(context);
};

exports.aceEditEvent = function (hook, context, cb) {
  const cs = context.callstack;
  const rep = context.rep;
  if (rep.selEnd && rep.selEnd[0] === 0 && (['setBaseText', 'handleClick'].indexOf(cs.type) >=0 || (cs.type === 'handleKeyEvent' && cs.observedSelection))) {
    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const padInner = padOuter.find('iframe[name="ace_inner"]').contents();
    if (!$('#editorloadingbox').is(':visible')) {
        setTimeout(function () {
          context.editorInfo.ace_callWithAce(function(ace){
            var activeLine = ace.ace_caretLine();
            if (activeLine === 0) {
                ace.ace_doInsertTitleLimitMark();
            }
          },'insertTitleLimitMark' , true);
        });
    }

    return cb();
  } else {
    return cb();
  }

}
exports.aceEditorCSS = () => ['ep_title_limit/static/css/ep_title_limit.css'];
