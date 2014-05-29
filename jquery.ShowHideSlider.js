// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.

/*global window, document*/

;(function ($, window, document, undefined) {

    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "ShowHideSlider",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.settings).

            this.sliderControls = {
                start: false,
                sWidth: 0
            };

            // start position on first load
            this.leftPosition = 50;


            this.dragElement = $(this.element).find(".slider-button");
            this.bottomImage = $(this.element).find("img")[1];
            this.mask = $(this.element).find(".slider");
            this.copy = $(this.element).find(".slider-copy");

            this.setupEvents();
            this.resizeImageOnFirstLoad();
        },

        /**
         * Event mouse down || touch start
         *
         * 
         */
        eventStart: function (e) {

            var id = e.target.getAttribute("class");

            switch (id) {

            case "slider-button":
                /* MOBILE FIX
                 *
                 * prevent browser from scrolling up or down when 
                 * user is dragging left to right.
                 */
                e.preventDefault();

                // if user interaction in on "slider-button" then interact
                this.sliderControls.start = true;
                break;

            case "drag-area":

                /* 
                 * DESKTOP - e.clientX
                 *
                 * MOBILE - e.originalEvent.touches[0].clientX
                 *
                 * get x or y coordinates when user interacts with interface
                 */
                this.yTracking = e.clientY || e.originalEvent.touches[0].clientY;
                this.xTracking  = e.clientX || e.originalEvent.touches[0].clientX;

                /* MOBILE FIX
                 * user tap interaction 
                 */
                this.userTap = true;
                break;
            }
        },

        eventMove: function (e) {

            /* 
             * DESKTOP - e.clientX
             *
             * MOBILE - e.originalEvent.touches[0].clientX
             *
             * get x or y coordinates when user interacts with interface
             */
            var x = e.clientX || e.originalEvent.touches[0].clientX,
                y = e.clientY || e.originalEvent.touches[0].clientY,
                l;

            if (this.sliderControls.start) {

                /* MOBILE FIX
                 *
                 * prevent browser from scrolling up or down when 
                 * user is dragging left to right.
                 */
                e.preventDefault();

                // calculate the percentage
                l = x / (this.sliderControls.sWidth / 100);

                // update elements position
                this.updateElements(l);

                // keep track of the current position
                this.leftPosition = l;
            }

            /* MOBILE FIX
             * user tap interaction
             * if a user drags finger then it is not a tap
             */
            if ((this.yTracking-5) < y || (this.yTracking + 5) > y) {
                this.userTap = false;
            }

            this.showHideMessage(this.leftPosition);
        },

        eventEnd: function (e) {

            this.sliderControls.start = false;

            if (this.userTap) {
                this.newPosition(e);
            }

        },

        showHideMessage: function (num) {
            if (num > 45 && num < 55) {
                this.copy.removeClass("hide");
            } else {
                this.copy.addClass("hide");
            }
        },

        newPosition: function (e) {

            var l = this.xTracking / (this.sliderControls.sWidth / 100);
            this.newLeft = l
            this.v = Math.abs(this.leftPosition - l) / 10;

            if (this.leftPosition < this.newLeft) {
                this.animateRight();
            } else {
                this.animateLeft();
            }

        },

        animateRight: function () {
            clearTimeout(this.animationTimer);
            var me = this;

            if (this.leftPosition <= this.newLeft) {

                this.animationTimer = setTimeout(function () {
                    me.leftPosition = me.leftPosition + me.v;
                    me.updateElements(me.leftPosition);
                    me.animateRight();
                }, 30)

            } else {
                this.leftPosition = this.newLeft;
            }

        },

        animateLeft: function () {
            clearTimeout(this.animationTimer);
            var me = this;

            if (this.leftPosition >= this.newLeft) {

                this.animationTimer = setTimeout(function () {
                    me.leftPosition = me.leftPosition - me.v;
                    me.updateElements(me.leftPosition);
                    me.animateLeft();
                }, 30)

            } else {
                this.leftPosition = this.newLeft;
            }

        },

        updateElements: function (num) {
            this.dragElement[0].style.left = num + "%";
            this.mask[0].style.width = num + "%";
        },

        resizeImageOnFirstLoad: function () {
            var me = this;
            setTimeout(function () {
                me.resizeImage($(window).width());
            }, 200);
        },


        resizeImage: function (num) {
            this.bottomImage.width = num;
            this.element.style.width = num + "px";
            this.element.style.height = this.bottomImage.height + "px";
            this.sliderControls.sWidth = num;
        },

        setupEvents: function (num) {
            var me = this;

            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
            var start = isMobile ? "touchstart" : "mousedown";
            var move = isMobile ? "touchmove" : "mousemove";
            var end = isMobile ? "touchend" : "mouseup";

            /**
             * Event mouse down || touch start
             *
             */
            $(this.element).bind(start, function (e) {
                me.eventStart(e);
            });

            /**
             * Event mouse move || touch move
             *
             */
            $(this.element).bind(move, function (e) {
                me.eventMove(e);
            });

            /**
             * Event mouse up || touch end
             *
             */
            $(this.element).bind(end, function (e) {
                me.eventEnd(e);
            });


            /**
             * Event resize
             *
             */
            $(window).resize(function() {
                me.resizeImage($(window).width());
            });
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        this.each(function() {
            if ( !$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );