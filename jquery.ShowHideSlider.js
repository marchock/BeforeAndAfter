// ****************************************************************************
// ****************************************************************************

//http://codepen.io/ace/pen/BqEer


// animate slider back to centre when user is not interacting 

// option to move slider with hover state

// option to click and show image clicked on or animate to the position selected 

// create event triggers 


// ****************************************************************************
// ****************************************************************************



/*global window, document, setTimeout, clearTimeout, navigator, jQuery */

;(function ($, window, document, undefined) {

    "use strict";

    // Create the defaults once
    var pluginName = "ShowHideSlider",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {

            this.sliderControls = {
                btnSS: false, // button slider selected
                ww: 0,      // window width
                ad: "left", // animation direction
                pp: 50, // position percentage
                newPP: 0, // new position percentage
                spX: 0, // start position X
                spY: 0 // start position Y
            };

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

                this.sliderControls.btnSS = true;
                break;

            case "drag-area":

                /* 
                 * DESKTOP - e.clientX
                 *
                 * MOBILE - e.originalEvent.touches[0].clientX
                 *
                 * get x or y coordinates when user interacts with interface
                 */
                this.sliderControls.spY = e.clientY || e.originalEvent.touches[0].clientY;
                this.sliderControls.spX  = e.clientX || e.originalEvent.touches[0].clientX;

                /* MOBILE FIX
                 * user tap interaction 
                 */
                this.userTap = true;
                break;
            }
        },

        /**
         * Event mouse move || touch move
         *
         * 
         */
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

            if (this.sliderControls.btnSS) {

                /* MOBILE FIX
                 *
                 * prevent browser from scrolling up or down when 
                 * user is dragging left to right.
                 */
                e.preventDefault();

                // calculate the percentage
                l = x / (this.sliderControls.ww / 100);

                // update elements position
                this.updateElements(l);

                // keep track of the current position
                this.sliderControls.pp = l;
            }

            /* MOBILE FIX
             * user tap interaction
             * if a user drags finger then it is not a tap
             */
            if ((this.sliderControls.spY - 20) < y || (this.sliderControls.spY + 20) > y) {
                this.userTap = false;
            }

            this.showHideMessage(this.sliderControls.pp);
        },


        /**
         * Event mouse up || touch end
         *
         * 
         */
        eventEnd: function (e) {

            this.sliderControls.btnSS = false;

            if (this.userTap) {
                this.newPosition(e);
            }
        },

        /*
         * Show and hide message at a specified position 
         */
        showHideMessage: function (num) {
            // if position is between 45 to 55 percent then show message
            if (num > 45 && num < 55) {
                this.copy.removeClass("hide");
            } else {
                this.copy.addClass("hide");
            }
        },

        /*
         * Find new position for slider to animate to
         */
        newPosition: function () {
            // calculate new position 
            this.sliderControls.newPP = this.sliderControls.spX / (this.sliderControls.ww / 100);

            this.v = Math.abs(this.sliderControls.pp - this.sliderControls.newPP) / 10;

            // find which direction to animate
            this.sliderControls.ad = this.findDirection();
            this.animate();

        },

        /*
         * Find which direction to animate slider
         */
        findDirection: function () {
            var d = "";
            if (this.sliderControls.pp < this.sliderControls.newPP) {
                d = "right";
            } else {
                d = "left";
            }
            return d;
        },

        /*
         * animate slider
         * 
         * loop until slider reaches new percentage value
         */
        animate: function () {
            clearTimeout(this.animationTimer);
            var me = this;

            if (this.isAnimationComleted()) {

                this.animationTimer = setTimeout(function () {
                    me.sliderControls.pp = me.calPosition(me.sliderControls.ad);
                    me.updateElements(me.sliderControls.pp);
                    me.animate();
                }, 30);

            } else {
                this.sliderControls.pp = this.sliderControls.newPP;
            }
        },

        /*
         * If slider position is equal to new value then animation is 
         * completed
         *
         * return -  true or false
         */
        isAnimationComleted: function () {
            var b = false

            if (this.sliderControls.ad === "right") {
                if (this.sliderControls.pp <= this.sliderControls.newPP) {
                    b = true;
                }

            } else { // left
                
                if (this.sliderControls.pp >= this.sliderControls.newPP) {
                    b = true;
                }
            }
            return b;
        },

        /*
         * Calculate slider position 
         */
        calPosition: function (direction) {
            var v;
            if (direction === "right") {

                v = this.sliderControls.pp + this.v;

            } else { // left
                
                v = this.sliderControls.pp - this.v;
            }
            return v
        },

        /*
         * Update elements position 
         */
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

        /*
         * Resize elements when widow is resized 
         */
        resizeImage: function (num) {
            this.bottomImage.width = num;
            this.element.style.width = num + "px";
            this.element.style.height = this.bottomImage.height + "px";
            this.sliderControls.ww = num;
        },

        /*
         * Set-up events on first load 
         */
        setupEvents: function () {
            var me = this,
                isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
                start = isMobile ? "touchstart" : "mousedown",
                move = isMobile ? "touchmove" : "mousemove",
                end = isMobile ? "touchend" : "mouseup";

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
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });

        // chain jQuery functions
        return this;
    };

})(jQuery, window, document);