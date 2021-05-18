'use strict';

const Changeset = require('ep_etherpad-lite/static/js/Changeset');

/**
 * aceAttribsToClasses
 *
 * This hook is called during the attribute processing procedure,
 * and should be used to translate key, value pairs into valid HTML classes
 * that can be inserted into the DOM.
 * The return value for this function should be a list of classes,
 * which will then be parsed into a valid class string.
 *
 * @param hook
 * @param context
 * @returns {[string]}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_aceattribstoclasses
 */
exports.aceAttribsToClasses = (hook, context) => {
  // Our ep_title_limit_ttl attribute will result in a ep_title_limit_ttl class
  if (context.key.indexOf('ep_title_limit_ttl:') !== -1) {
    return ['ep_title_limit_ttl'];
  }
  if (context.key === 'ep_title_limit_ttl') {
    return ['ep_title_limit_ttl'];
  }
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

const _hideInfoModal = () => {
  const modal = $('#ep_title_limit_ttl_modal');
  modal.hide();
  modal.removeClass('popup-show');
};

// display and position info modal
const _displayInfoModal = () => {
  const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
  const padInner = padOuter.find('iframe[name="ace_inner"]');
  const modal = $('#ep_title_limit_ttl_modal');
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

let previousTitleText = '';
// Wrap over limit text with marker and display info modal
const doInsertTitleLimitMark = (context, skipAttributes) => {
  const maxLength = window.clientVars.ep_title_limit.maxLength;
  const rep = context.rep;
  const documentAttributeManager = context.documentAttributeManager;
  const line = rep.lines.atIndex(0);
  let text = line.text;
  text = text.replace(/(^\*)/, '');

  if (text === previousTitleText) {
    // NOTE! If the text has not changes, there is nothing to update in the UI!
    return;
  }

  if (text.trim().length < maxLength) {
    previousTitleText = text;
    if (!skipAttributes && _checkLineForAttr(rep, 0, 'ep_title_limit_ttl')) {
      documentAttributeManager.setAttributesOnRange(
          [0, 0],
          [0, line.text.length],
          [['ep_title_limit_ttl', false]]
      );
    }
    _hideInfoModal();
  } else {
    if (!skipAttributes) {
      documentAttributeManager.setAttributesOnRange(
          [0, maxLength + 1],
          [0, line.text.length], [['ep_title_limit_ttl', 'ep_title_limit_ttl']]
      );
    }
    previousTitleText = text;
    _displayInfoModal();
  }
};


// Triggers before any changes are made, enables plugins to change outcome
exports.aceKeyEvent = (hook, context) => {
  // Check for 'keydown' event only for mobiles to act the same way as desktop - https://github.com/citizenos/citizenos-fe/issues/535#issuecomment-805897450
  if (context.evt.type !== 'keydown') {
    return false;
  }

  // Desktop or better say NOT a virtual keyboard device (touch device).
  // We need to skip the "callWithAce" part as this will cause weird behavior on mobile - https://github.com/citizenos/citizenos-fe/issues/535
  if (context.evt.key !== 'Unidentified') {
    // Avoid race condition (callStack === null)
    setTimeout(() => {
      context.editorInfo.ace_callWithAce(() => {
        doInsertTitleLimitMark(context, false);
      }, 'insertTitleLimitMark', true);
    }, 0);
  } else { // Virtual keyboard device
    doInsertTitleLimitMark(context, true);
  }

  return false;
};

exports.aceEditorCSS = () => ['ep_title_limit/static/css/ep_title_limit.css'];
