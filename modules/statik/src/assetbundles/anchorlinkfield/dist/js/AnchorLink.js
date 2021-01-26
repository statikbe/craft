;(function ($, window, document, undefined) {

    var pluginName = "StatikAnchorLink", defaults = {};

    // Plugin constructor
    function Plugin(element, options) {
        this.element = element;

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init(options.id, options.namespace);
    }

    Plugin.prototype = {

        init: function (id, namespace) {
            var _this = this;

            $(function () {

                let field = $('#' + namespace); // fields-anchorLinkTest fields-contentBuilder-blocks-811-fields-blockTitle
                let copyBtn = field.parents('.js-copy-container').find('.js-copy-title'); //$('#fields-' + id + '-field .js-copy-title');

                if (copyBtn) {
                    copyBtn[0].addEventListener('click', function () {

                        // create temp input to set the value
                        var $temp = $("<input>");
                        $("body").append($temp);

                        // get the input value
                        var $value = field.val();

                        // create slug form value
                        var $slugified = '#' + slugify($value);

                        // set the value in the temp input
                        $temp.val($slugified).select();

                        // copy this value
                        document.execCommand("copy");

                        // remove temp input
                        $temp.remove();

                        // Show success message
                        Craft.cp.displayNotice(Craft.t('app', 'Anchor link copied to clipboard.'));
                    });
                }

            });
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
    };

    function slugify(string) {
        var $slugified = 'test';

        // ajax to php function
        $.ajax({
            url: "/actions/statik/slugify/create-slug-from-string",
            data: { string: string},
            async: false,
        }).done(function (response) {
            $slugified = response;
        });

        return $slugified;
    }

})(jQuery, window, document);
