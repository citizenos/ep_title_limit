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
};
//display and position info modal
var displayInfoModal = function () {
    var padOuter = $('iframe[name="ace_outer"]').contents().find("body");
    var padInner = padOuter.find('iframe[name="ace_inner"]').contents().find("body");
    var modal = $("#ttl_modal");
    var line = padInner.children()[0];
    var top = $(line).position().top + $(line).height() + $('#editbar').height();

    $(modal).off();
    $(modal).on('click', function () {
        hideInfoModal();
    });
    $(modal).show();
    $(modal).css({
        "position": "relative",
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
    if (cs.type === 'idleWorker' || cs.type === 'idleWorkTimer' || cs.type === 'insertTitleLimitMark') {
        return;
    }

    var firstLine = context.rep.lines.atIndex(0);
    var maxLength = window.clientVars.ep_title_limit.maxLength;
    
    setTimeout(function() {            
        context.editorInfo.ace_callWithAce(function(ace){
            var activeLine = ace.ace_caretLine();
            if (activeLine === 0) {
                ace.ace_doInsertTitleLimitMark();
            }
            },'insertTitleLimitMark' , true);
    }, 200);

  
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
    if (_checkLineForAttr(rep, 0, 'ttl')){
        documentAttributeManager.setAttributesOnRange([0, 0], [0, line.text.length], [['ttl', false]]);
    }

    if (line.text.trim().length > maxLength) {
        documentAttributeManager.setAttributesOnRange([0, maxLength+1], [0, line.text.length], [['ttl', 'ttl']]);
        displayInfoModal();
    } else {
        documentAttributeManager.setAttributesOnRange([0, 0], [0, line.text.length], [['ttl', false]]);
        hideInfoModal();
    }
}


// Once ace is initialized, we set ace_doInsertTitleLimitMark and bind it to the context
exports.aceInitialized = function aceInitialized(hook, context){
  var editorInfo = context.editorInfo;
  editorInfo.ace_doInsertTitleLimitMark = _(doInsertTitleLimitMark).bind(context);
}
