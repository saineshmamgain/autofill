var options_default = {
    onSelect: function (label, value) {
    },
    onChange: function (label, value) {
    },
    onFocusIn: function () {
    }
};
$.fn.autofill = function (options) {
    if (undefined == options) {
        options = options_default;
    }
    var $currentInput = $(this);
    var currentInputId = $currentInput.attr('id');
    var autoCompleteData = $currentInput.data('autofill');
    var position = $currentInput.position();
    var $list = $('<ul>');
    var listId = 'autofill_list_' + currentInputId;
    var li = '';
    $list.attr({
        id: listId,
        'data-target': currentInputId,
        class: 'autofill-show'
    });
    $list.css({
        width: $currentInput.width() + parseInt($currentInput.css('padding-left'), 10) + parseInt($currentInput.css('padding-right'), 10),
        position: 'absolute',
        top: position.top + $currentInput.outerHeight(),
        left: -99999
    });
    if ($list.find('li').length >= 6) {
        $list.css({
            height: '130px',
            'overflow-y': 'scroll'
        });
    }
    $('#' + currentInputId).on('keyup', function (event) {
        li = '';
        var query = $(this).val();
        if (query.length) {
            $.grep(autoCompleteData, function (object) {
                try {
                    if (object.label.search(new RegExp(query, 'i')) !== -1) {
                        li += '<li class="autofill-list" data-value="' + object.value + '">' + object.label + '</li>';
                        $(event.target).trigger('onChange',[query,object,options]);
                    }
                } catch (e) {
                    $('#' + listId).css('left', -99999);
                }
            });
        }
        $('#' + listId).html(li).css('left', position.left);
    }).on('focus', function (event) {
        li = '';
        $(this).val('');
        $.each(autoCompleteData, function (key, object) {
            li += '<li class="autofill-list" data-value="' + object.value + '">' + object.label + '</li>';
        });
        $('#' + listId).html(li).css('left', position.left);
        $(event.target).trigger('onFocusIn',[options]);
    });
    $currentInput.after($list);
    $('#' + listId).html(li);
    $(document).on('click', function (event) {
        if ($(event.target).hasClass('autofill-list') && $(event.target).parent('ul').data('target') == currentInputId) {
            $(event.target).trigger('onSelect', [$(event.target).text(), $(event.target).data('value'), $(event.target).parent('ul'), $(event.target).parent('ul').data('target'), options]);
        }else{
            if($(event.target).attr('id')!==currentInputId){
                $('#'+listId).trigger('close');
            }
        }
    });
};
$(document).on('onSelect', '.autofill-list', function (event, label, value, parentList, targetInputId, options) {
    $('#' + targetInputId).val(label);
    $(parentList).css('left', -99999);
    if ($.isFunction(options.onSelect)) {
        options.onSelect(label, value);
    }
});
$(document).on('onFocusIn',function (event,options) {
    if($.isFunction(options.onFocusIn)){
        options.onFocusIn();
    }
});
$(document).on('onChange',function (event,query,object,options) {
    if($.isFunction(options.onChange)){
        var exactMatch;
        var reg = new RegExp('\^' + query + '\$', "gi");
        exactMatch=$(object).filter(function (key,value) {
            return reg.test(value.label);
        }).get();
        options.onChange(query,object,(exactMatch[0])?exactMatch[0]:{});
    }
});
$(document).on('close',function(event){
    $(event.target).css('left', -99999);
});
