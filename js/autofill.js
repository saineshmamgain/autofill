var options_default = {
    onSelect: function (label, value) {
    },
    onChange: function (label, value) {
    },
    onFocusIn: function () {
    },
    render:function(objects){
        var dataAttributes='';
        var li='';
        $(objects).each(function(key,value){
            $.each(value,function(key,value){
                dataAttributes+=' data-'+key+'="'+value+'" ';
            });
            li+='<li class="autofill-list"'+dataAttributes+'>'+value.label+'</li>';
            dataAttributes='';
        });
        return li;
    },
    minScroll:6,
    minScrollHeight:'100px'
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
    var dataAttributes='';
    $list.attr({
        id: listId,
        'data-target': currentInputId,
        class: 'autofill-show'
    });
    $list.css({
        width: $currentInput.width() + parseInt($currentInput.css('padding-left'), 10) + parseInt($currentInput.css('padding-right'), 10),
        position: 'absolute',
        top: (options.top)?options.top:position.top + $currentInput.outerHeight(),
        left: -99999
    });
    $('#' + currentInputId).on('keyup', function (event) {
        var query = $(this).val();
        if (query.length) {
            var result=$.grep(autoCompleteData, function (object) {
                try {
                    if (object.label.search(new RegExp(query, 'i')) !== -1) {
                        $(event.target).trigger('onChange',[query,object,options]);
                        return object;
                    }
                } catch (e) {
                    $('#' + listId).css('left', -99999);
                }
            });
            if(options.render || options_default.render){
                if($.isFunction(options.render)){
                    li=options.render(result);
                }else{
                    li=options_default.render(result);
                }
            }
        }else{
            if(options.render || options_default.render){
                if($.isFunction(options.render)){
                    li=options.render(autoCompleteData);
                }else{
                    li=options_default.render(autoCompleteData);
                }
            }
        }
        $('#' + listId).html(li).css('left', (options.left)?options.left:position.left);
        if ($('#' + listId).find('li').length >= ((options.minScroll)?options.minScroll:options_default.minScroll)) {
            $('#' + listId).css({
                height: (options.minScrollHeight)?options.minScrollHeight:options_default.minScrollHeight,
                'overflow-y': 'scroll'
            });
        }
    }).on('focus', function (event) {
        li = '';
        $(this).val('');
        if(options.render || options_default.render){
            if($.isFunction(options.render)){
                li=options.render(autoCompleteData);
            }else{
                li=options_default.render(autoCompleteData);
            }
        }
        $('#' + listId).html(li).css('left', (options.left)?options.left:position.left);
        if ($('#' + listId).find('li').length >= ((options.minScroll)?options.minScroll:options_default.minScroll)) {
            $('#' + listId).css({
                height: (options.minScrollHeight)?options.minScrollHeight:options_default.minScrollHeight,
                'overflow-y': 'scroll'
            });
        }
        $(event.target).trigger('onFocusIn',[options]);
        $(event.target).trigger('onChange',['',{},options]);
    });
    $currentInput.after($list);
    $('#' + listId).html(li);
    $(document).on('click', function (event) {
        var parent=($(event.target).parent('li') && $(event.target).parent('li')[0]!==undefined)?$(event.target).parent('li')[0]:event.target;
        if (((event.target.tagName.toLowerCase())==='li' || $(parent).tagName.toLowerCase()==='li') && ($(event.target).parent('ul').data('target')) == currentInputId) {
            var target=((event.target.tagName.toLowerCase())==='li')?event.target:parent;
            console.log(target);
            $(target).trigger('onSelect', [$(target).text(), $(target).data(), $(target).parent('ul'), $(target).parent('ul').data('target'), options]);
        }else{
            if($(event.target).attr('id')!==currentInputId){
                $('#'+listId).trigger('close');
            }
        }
    });
};
$(document).on('onSelect', 'li', function (event, label, object, parentList, targetInputId, options) {
    $('#' + targetInputId).val(label);
    $(parentList).css('left', -99999);
    if ($.isFunction(options.onSelect)) {
        options.onSelect(object);
    }
});
$(document).on('onFocusIn',function (event,options) {
    if($.isFunction(options.onFocusIn)){
        options.onFocusIn();
    }
});
$(document).on('onChange',function (event,query,objects,options) {
    if($.isFunction(options.onChange)){
        var exactMatch;
        var reg = new RegExp('\^' + query + '\$', "gi");
        exactMatch=$(objects).filter(function (key,value) {
            return reg.test(value.label);
        }).get();
        options.onChange(query,objects,(exactMatch[0])?exactMatch[0]:{});
    }
});
$(document).on('close',function(event){
    $(event.target).css('left', -99999);
});