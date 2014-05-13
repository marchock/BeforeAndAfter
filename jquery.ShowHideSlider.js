// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

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
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
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
					var me = this;

					this.sliderControls = {
						start: false,
						sWidth: 0
					};

					this.dragElement = $(this.element).find(".slider-button");
					this.bottomImage = $(this.element).find("img")[1];
					this.mask = $(this.element).find(".slider");

					this.resizeImage($(window).width());

					this.setupEvents();

				},

				eventStart: function (e) {
                    var id = e.target.getAttribute("class");

                    switch(id) {
                        case "slider-button":
                          this.sliderControls.start = true;
                          break;
                        case "drag-area":
                          this.newPosition(e);
                          break;
                    }
                    
				},

                eventMove: function (e) {
                    if (this.sliderControls.start) {
                        console.log("MOUSE || TOUCH  ---- MOVE", e.clientX)

                        var l = e.clientX / (this.sliderControls.sWidth / 100) ;

                        console.log("left", l)


                        this.dragElement[0].style.left = l + "%";
                        this.mask[0].style.width = l + "%";
                    }
                },

                eventEnd: function (e) {
                    console.log("MOUSE || TOUCH  ---- END")
                    this.sliderControls.start = false;
                },

                newPosition: function (e) {
                    console.log(e)
                    var l = e.clientX / (this.sliderControls.sWidth / 100) ;

                    console.log(this.dragElement, this.mask)
                    this.dragElement.animate({ "left": l + "%" }, 300 );
                    this.mask.animate({ "width": l + "%" }, 300 );
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
					$( window ).resize(function() {
						me.resizeImage($(window).width())
					});
				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});

				// chain jQuery functions
				return this;
		};

})( jQuery, window, document );