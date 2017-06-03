try{
    jQuery.fn.autofill = function (options) {
        var $=jQuery;
        var options_default = {
            onSelect: function (object) {
            },
            onChange: function (query, objects,exactMatch) {
            },
            onFocusIn: function () {
            },
            render: function (objects) {
                var dataAttributes = '';
                var li = '';
                $(objects).each(function (key, value) {
                    $.each(value, function (key, value) {
                        dataAttributes += ' data-' + key + '="' + value + '" ';
                    });
                    li += '<li class="autofill-list"' + dataAttributes + '>' + value.label + '</li>';
                    dataAttributes = '';
                });
                return li;
            },
            minScroll: 6,
            minScrollHeight: '100px'
        };
        if (undefined === options) {
            options = options_default;
        }
        var check = true;
        var $currentInput = $(this);
        var currentInputId;
        if ($currentInput.attr('id')) {
            currentInputId = $currentInput.attr('id');
        } else {
            currentInputId = 'autofiil_input_' + (new Date()).getTime();
            $currentInput.attr('id', currentInputId);
        }
        var autoCompleteData;
        $(document).on('autofillDataReceived', '#' + currentInputId, function (e, autoCompleteData) {
            var position = $currentInput.position();
            var $list = $('<ul>');
            var listId = 'autofill_list_' + currentInputId;
            var li = '';
            var cache = [];
            $list.attr({
                id: listId,
                'data-target': currentInputId,
                class: 'autofill-show'
            });
            $list.css({
                width: $currentInput.width() + parseInt($currentInput.css('padding-left'), 10) + parseInt($currentInput.css('padding-right'), 10),
                position: 'absolute',
                top: (options.top) ? options.top : position.top + $currentInput.outerHeight(),
                left: -99999
            });
            if (check) {
                $('#' + currentInputId).on('keyup', function (event) {
                    var query = $(this).val();
                    if (query.length) {
                        var result;
                        if (cache[query] === undefined) {
                            result = $.grep(autoCompleteData, function (object) {
                                try {
                                    if (object.label.search(new RegExp(query, 'i')) !== -1) {
                                        $(event.target).trigger('onChange', [query, object, options]);
                                        return object;
                                    }
                                } catch (e) {
                                    $('#' + listId).css('left', -99999);
                                }
                            });
                            cache[query] = result;
                        } else {
                            result = cache[query];
                            $(event.target).trigger('onChange', [query, result, options]);
                        }
                        if (options.render || options_default.render) {
                            if ($.isFunction(options.render)) {
                                li = options.render(result);
                            } else {
                                li = options_default.render(result);
                            }
                        }
                    } else {
                        if (options.render || options_default.render) {
                            if ($.isFunction(options.render)) {
                                li = options.render(autoCompleteData);
                            } else {
                                li = options_default.render(autoCompleteData);
                            }
                        }
                    }
                    $('#' + listId).html(li).css('left', (options.left) ? options.left : position.left);
                    if ($('#' + listId).find('li').length >= ((options.minScroll) ? options.minScroll : options_default.minScroll)) {
                        $('#' + listId).css({
                            height: (options.minScrollHeight) ? options.minScrollHeight : options_default.minScrollHeight,
                            'overflow-y': 'scroll'
                        });
                    }else{
                        $('#' + listId).css({
                            height: 'auto',
                            'overflow-y': 'unset'
                        });
                    }
                }).on('focus', function (event) {
                    li = '';
                    $(this).val('');
                    if (options.render || options_default.render) {
                        if ($.isFunction(options.render)) {
                            li = options.render(autoCompleteData);
                        } else {
                            li = options_default.render(autoCompleteData);
                        }
                    }
                    $('#' + listId).html(li).css('left', (options.left) ? options.left : position.left);
                    if ($('#' + listId).find('li').length >= ((options.minScroll) ? options.minScroll : options_default.minScroll)) {
                        $('#' + listId).css({
                            height: (options.minScrollHeight) ? options.minScrollHeight : options_default.minScrollHeight,
                            'overflow-y': 'scroll'
                        });
                    }else{
                        $('#' + listId).css({
                            height: 'auto',
                            'overflow-y': 'unset'
                        });
                    }
                    $(event.target).trigger('onFocusIn', [options]);
                    $(event.target).trigger('onChange', ['', {}, options]);
                });
                $currentInput.after($list);
                $('#' + listId).html(li);
                $(document).on('click', function (event) {
                    if ((event.target.tagName.toLowerCase()) === 'li' && ($(event.target).parent('ul').data('target')) == currentInputId) {
                        $(event.target).trigger('onSelect', [$(event.target).text(), $(event.target).data(), $(event.target).parent('ul'), $(event.target).parent('ul').data('target'), options]);
                    } else {
                        if ($(event.target).attr('id') !== currentInputId) {
                            $('#' + listId).trigger('close');
                        }
                    }
                });
            }
        });
        if (options.source && options.ajax !== undefined && options.ajax === true) {
            check = false;
            $.ajax({
                url: options.source,
                type: 'GET',
                success: function (response) {
                    check = true;
                    autoCompleteData = response;
                    $('#' + currentInputId).trigger('autofillDataReceived', [autoCompleteData]);
                },
                error: function () {
                    check = false;
                    throw new Error('There was an error fetching data from server.');
                }
            });
        } else {
            if (options.source !== undefined) {
                check = true;
                autoCompleteData = JSON.parse(options.source);
                $('#' + currentInputId).trigger('autofillDataReceived', [autoCompleteData]);
            } else {
                check = true;
                autoCompleteData = $currentInput.data('autofill');
                $('#' + currentInputId).trigger('autofillDataReceived', [autoCompleteData]);
            }
        }
        $(document).on('onSelect', 'li', function (event, label, object, parentList, targetInputId, options) {
            $('#' + targetInputId).val(label);
            $(parentList).css('left', -99999);
            if ($.isFunction(options.onSelect)) {
                options.onSelect(object);
            }
        });
        $(document).on('onFocusIn', function (event, options) {
            if ($.isFunction(options.onFocusIn)) {
                options.onFocusIn();
            }
        });
        $(document).on('onChange', function (event, query, objects, options) {
            if ($.isFunction(options.onChange)) {
                var exactMatch;
                var reg = new RegExp('\^' + query + '\$', "gi");
                exactMatch = $(objects).filter(function (key, value) {
                    return reg.test(value.label);
                }).get();
                options.onChange(query, objects, (exactMatch[0]) ? exactMatch[0] : {});
            }
        });
        $(document).on('close', function (event) {
            $(event.target).css('left', -99999);
        });
    };
}catch (e){
    console.error(e);
}