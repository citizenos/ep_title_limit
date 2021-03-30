'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');

// Our ttl attribute will result in a ttl class
/**
 * aceAttribsToClasses
 *
 * @param hook
 * @param context
 * @returns {[string]}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_aceattribstoclasses
 */
exports.aceAttribsToClasses = (hook, context) => {
    console.log('ep_title_limit.aceAttribsToClasses', arguments);

    if (context.key.indexOf('ttl:') !== -1) {
        return ['ttl'];
    }
    if (context.key === 'ttl') {
        return ['ttl'];
    }
};

const _hideInfoModal = () => {
    console.log('ep_title_limit._hideInfoModal', arguments);

    $('#ttl_modal').hide();
    $('#ttl_modal').removeClass('popup-show');
};

// display and position info modal
const _displayInfoModal = () => {
    console.log('ep_title_limit._displayInfoModal', arguments);

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

/**
 * aceCreateDomLine
 *
 * @param name
 * @param context
 * @returns {[{extraOpenTags: string, extraCloseTags: string, cls}]|*[]}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_acecreatedomline
 */
exports.aceCreateDomLine = (name, context) => {
    console.log('ep_title_limit.aceCreateDomLine', arguments);

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

let lastVersion = '';
// Wrap over limit text with marker and display info modal
let doInsertTitleLimitMark = function () {
    console.log('ep_title_limit.doInsertTitleLimitMark', arguments);

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
        // documentAttributeManager.setAttributesOnRange(
        //     [0, maxLength + 1],
        //     [0, line.text.length], [['ttl', 'ttl']]
        // );
        _displayInfoModal();
    }
};


/**
 * aceInitialized
 *
 * @param hook
 * @param context
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_aceinitialized
 */
// Once ace is initialized, we set ace_doInsertTitleLimitMark and bind it to the context
exports.aceInitialized = (hook, context) => {
    console.log('ep_title_limit.aceInitialized', arguments);

    const editorInfo = context.editorInfo;
    editorInfo.ace_doInsertTitleLimitMark = _(doInsertTitleLimitMark).bind(context);
    setInterval(function () {
        console.log('ep_title_limit.aceInitialized.setInterval - do work!', arguments);

        context.editorInfo.ace_callWithAce(function (ace) {
            var activeLine = ace.ace_caretLine();
            if (activeLine === 0) {
                ace.ace_doInsertTitleLimitMark();
            }
        }, 'insertTitleLimitMark', true);
    }, 1000);
};

exports.aceEditorCSS = () => ['ep_title_limit/static/css/ep_title_limit.css'];
