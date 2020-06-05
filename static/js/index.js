'use strict'

var _ = require('ep_etherpad-lite/static/js/underscore');
var Changeset = require("ep_etherpad-lite/static/js/Changeset");

// Our ttl attribute will result in a ttl class
exports.aceAttribsToClasses = function aceAttribsToClasses(hook, context){
  if(context.key.indexOf("ttl:") !== -1){
    return ['ttl' ];
  }
  if(context.key === 'ttl'){
    return ['ttl' ];
  }
}

var hideInfoModal = function () {
    $("#ttl_modal").hide();
    $("#ttl_modal").removeClass('popup-show');
};
//display and position info modal
var displayInfoModal = function () {
    var padOuter = $('iframe[name="ace_outer"]').contents().find("body");
    var padInner = padOuter.find('iframe[name="ace_inner"]');
    var modal = $("#ttl_modal");
    var line = padInner.contents().find("body").children()[0];
    var top = $(line).offset().top + $(line)[0].offsetHeight + parseInt(padInner.css('padding-top')) + $('#editbar').height();;

    $(modal).off();
    $(modal).on('click', function () {
        hideInfoModal();
    });
    $(modal).show();
    $(modal).addClass('popup-show');
    $(modal).css({
        "top": top
    });
}

exports.aceCreateDomLine = function(name, context){
  var cls = context.cls;
  var ttl = /(?:^| )ttl:([A-Za-z0-9]*)/.exec(cls);

  if (ttl && ttl[1]){
    var modifier = {
      extraOpenTags: '',
      extraCloseTags: '',
      cls: cls
    };
    return [modifier];
  }
  return [];
};

exports.aceEditEvent = function(hook, context, cb){
    var cs = context.callstack;
    if (['setBaseText', 'handleClick', 'handleKeyEvent'].indexOf(cs.type) >=0 && context.rep.selEnd[0] === 0) {

      setTimeout(function() {
          context.editorInfo.ace_callWithAce(function(ace){
              var activeLine = ace.ace_caretLine();
              if (activeLine === 0) {
                  ace.ace_doInsertTitleLimitMark();
              }
              },'insertTitleLimitMark' , true);
      }, 100);
    }

  return;
}

function _checkLineForAttr (rep, line, attr) {
    var alineAttrs = rep.alines[line];
    var hasAttr = false;
    if (alineAttrs) {
        var opIter = Changeset.opIterator(alineAttrs);
        while (opIter.hasNext()) {
            var op = opIter.next();
            var r = Changeset.opAttributeValue(op, attr, rep.apool);
            if (r) {
                hasAttr = true;
            }
        }
    }

    return hasAttr;
}
// Wrap over limit text with marker and display info modal
function doInsertTitleLimitMark () {
    var maxLength = window.clientVars.ep_title_limit.maxLength;
    var rep = this.rep,

    documentAttributeManager = this.documentAttributeManager;

    var line = rep.lines.atIndex(0);
    var text = line.text;
    text = text.replace(/(^\*)/, '');
    if (_checkLineForAttr(rep, 0, 'ttl')){
        documentAttributeManager.setAttributesOnRange([0, 0], [0, line.text.length], [['ttl', false]]);
    }

    if (text.trim().length > maxLength) {
        documentAttributeManager.setAttributesOnRange([0, maxLength+1], [0, line.text.length], [['ttl', 'ttl']]);
        displayInfoModal();
    } else {
        documentAttributeManager.setAttributesOnRange([0, 0], [0, line.text.length], [['ttl', false]]);
        hideInfoModal();
    }
}


// Once ace is initialized, we set ace_doInsertTitleLimitMark and bind it to the context
exports.aceInitialized = function (hook, context){
  var editorInfo = context.editorInfo;
  editorInfo.ace_doInsertTitleLimitMark = _(doInsertTitleLimitMark).bind(context);
}

exports.aceEditorCSS = function () {
  return ['ep_title_limit/static/css/ep_title_limit.css'];
}
