/**
 * Homaly (Horizontal Masonry Layout for Photo Gallery)
 * @version 1.0.0
 * @author lshung <ls@hung.vn>
 * https://github.com/lshung/homaly
 */

(function ($) {

    var homaly = function (opts, element) {
        if (!(this instanceof homaly)) {
            return new homaly(opts, this);
        }

        // Global variable
        me = this;
        me.wrapper_width = $(element).innerWidth();
        me.image_list = {};
        me.rows = [];
        me.opts = {
            item_selector: "div",
            img_selector: "img",
            img_loaded_class: "homaly_loaded",
            img_height: 200,
            img_spacing: 5,
            callback: function (elem) { }
        };
        $.extend(me.opts, opts);

        // Init
        me.init = function () {
            _getImageList();
            _applyInitCss();
            // Resize event
            // Use cached width to fix the problem that the resize event auto fires when scrolling on mobile
            var cachedWidth = $(window).width();
            $(window).resize(function () {
                var newWidth = $(window).width();
                if (newWidth !== cachedWidth) {
                    cachedWidth = newWidth;
                    if (me.resize_timeout) { clearTimeout(me.resize_timeout); }
                    me.resize_timeout = setTimeout(_onResize, 500);
                }
            });
            // Need imagesloaded plugin, otherwise use lazysizes for lazyloading
            if (typeof lazySizes != "undefined") {
                // If image link is broken then hide it
                $(me.opts.img_selector, element).on("error", function () {
                    $(this).css({ "display": "none", "width": 0, "max-width": 0 });
                    $(this).closest(me.opts.item_selector).css({ "padding": 0 });
                });
                // Lazyloaded event
                $(element)[0].addEventListener("lazyloaded", function (e) {
                    if (me.lazy_timeout) { clearTimeout(me.lazy_timeout); }
                    me.lazy_timeout = setTimeout(_run, 500);
                });
            }
            else if ($.fn.imagesLoaded) {
                // If image link is broken then hide it
                $(element).imagesLoaded(function (instance) {
                    $(instance["images"]).each(function (key, val) {
                        if (!val["isLoaded"]) {
                            $(val["img"]).css({ "display": "none", "width": 0, "max-width": 0 });
                            $(val["img"]).closest(me.opts.item_selector).css({ "padding": 0 });
                        }
                    });
                    _run();
                });
            }
            else {
                console.log("Homaly requires lazysizes or imagesloaded plugin to run properly.");
                _run();
            }
        }

        // Loop all images and store data in a list
        var _getImageList = function () {
            $(me.opts.img_selector, element).each(function (i, img) {
                me.image_list[i] = {
                    "obj": img,
                    "org_width": 0,
                    "assigned": false
                };
            });
        }

        // Apply initial style
        var _applyInitCss = function () {
            $(element).css({ "font-size": 0 });
            $(me.opts.item_selector, element).css({ "font-size": 0, "display": "inline-block", "box-sizing": "border-box", "padding": me.opts.img_spacing });
            $(me.opts.img_selector, element).css({ "height": me.opts.img_height });
        }

        // When resized, update wrapper width, empty rows, set assigned property to False
        var _onResize = function () {
            me.wrapper_width = $(element).innerWidth();
            me.rows = [];
            $.each(me.image_list, function (i) {
                me.image_list[i]["assigned"] = false;
            });
            _run();
        }

        // Main run
        var _run = function () {
            $(me.opts.img_selector, element).each(function (i, img) {
                // Get original width of images in the last row or newly lazyloaded
                if (!me.image_list[i]["assigned"]) {
                    _getOriginalWidth(i, img);
                }
            });
            _assign();
            _calculate();
        }

        // Get original width of image, need to reset style first
        var _getOriginalWidth = function (i, img) {
            $(img).closest(me.opts.item_selector).css({ "width": "" });
            $(img).css({ "width": "", "height": me.opts.img_height });
            $(img).removeClass(me.opts.img_loaded_class);
            me.image_list[i]["org_width"] = $(img).innerWidth();
        }

        // Assgin images to rows
        var _assign = function () {
            row_items = [];
            row_items_index = [];
            row_width = 0;

            $(me.opts.img_selector, element).each(function (i, img) {
                // Assign images only in the last row or newly lazyloaded
                if (!me.image_list[i]["assigned"]) {
                    image_width = me.image_list[i]["org_width"];
                    // If image width is zero then continue the loop (in case that image exists in DOM but has not lazyloaded)
                    if (image_width == 0) {
                        return;
                    }
                    // First image of a new row
                    if (row_width == 0) {
                        row_width = image_width;
                        row_items = [img];
                        row_items_index = [i];
                        return;
                    }
                    // Some next images
                    else if (row_width > 0 && row_width + image_width + 2 * me.opts.img_spacing < me.wrapper_width) {
                        row_width += image_width;
                        row_items.push(img);
                        row_items_index.push(i);
                        return;
                    }
                    // Cannot add an image anymore
                    else if (row_width > 0) {
                        // Assignment to this row is done
                        me.rows.push({ "item_count": row_items.length, "row_width": row_width, "items_index": row_items_index, "items": row_items, "finish": true });
                        // Set assigned property to True
                        $.each(row_items_index, function (k, v) {
                            me.image_list[v]["assigned"] = true;
                        });
                        // First image of a new row
                        row_width = image_width;
                        row_items = [img];
                        row_items_index = [i];
                    }
                }
            });
            // Last row, not sure it can add images anymore or not so do not set assigned property to True
            if (row_width > 0) {
                me.rows.push({ "item_count": row_items.length, "row_width": row_width, "items_index": row_items_index, "items": row_items, "finish": false });
            }
            // Remove all rows that are not finished, except the last row
            temp_rows = [];
            $(me.rows).each(function (key, val) {
                if (val["finish"] == true || key == me.rows.length - 1) {
                    temp_rows.push(me.rows[key]);
                }
            });
        };

        // Calculate images width after assignment is done
        var _calculate = function () {
            $(me.rows).each(function (key, val) {
                items_index = val["items_index"];
                row_width = val["row_width"];
                // Calculate target row width (without padding)
                target_width = me.wrapper_width - (items_index.length * 2 * me.opts.img_spacing); // Wrapper width minus real padding
                $(items_index).each(function (k, v) {
                    image_width_pixel_new = me.image_list[v]["org_width"] / row_width * target_width;
                    image_width_percent_new = (image_width_pixel_new + 2 * me.opts.img_spacing) / me.wrapper_width * 100;
                    // Apply style
                    $(me.image_list[v]["obj"]).closest(me.opts.item_selector).css("width", image_width_percent_new + "%");
                    $(me.image_list[v]["obj"]).css({ "width": "100%", "height": "auto" });
                    $(me.image_list[v]["obj"]).addClass(me.opts.img_loaded_class);
                });
            });
        }
    }

    $.fn.homaly = homaly;

})(jQuery)
