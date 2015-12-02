/**
* sequenceJs - A programmable touring engine written on js/jQuery
* https://github.com/rosengate/sequencejs
* Author - http://github.com/eimihar
* License - MIT License
*/

/**
* Class : sequenceJs
* A sequence manager - main class for this engine
* @param Object jQuery
*/
var sequenceJs = function(jQuery)
{
	var $ = jQuery;
	this.$ = $;
	var instances = {};
	var defaultOptions = {};
	var defaultLabels = {};

	/*
	to-be implemented
	(function($)
	{
		$(window).resize(function()
		{

		});
	}).call(this, jQuery);*/

	/**
	* Set default options created on every created instance
	*/
	this.setOptions = function(options)
	{
		defaultOptions = options;
	}

	this.setLabels = function(labels)
	{
		defaultLabels = labels;
	}

	this.create = function(name, opts, lbls)
	{
		var options = defaultOptions;
		var labels = defaultLabels;

		if(opts)
			for(var key in opts)
				options[key] = opts[key];

		if(lbls)
			for(var key in lbls)
				labels[key] = lbls[key];

		var sequence = new sequenceClass(this, options, labels);
		instances[name] = sequence;
		return sequence;
	}

	this.get = function(name)
	{
		if(!instances[name])
			return this.create(name);

		return instances[name];
	}

	this.overlay = new function($)
	{
		this.element = function()
		{
			return $("#seqjs-overlay");
		}
		this.show = function()
		{
			this.element().show();
		}
		this.clear = function()
		{
			this.element().hide();
		}
	}(jQuery);

	this.tooltip = new function($)
	{
		this.referenceElement = function()
		{
			return $("#seqjs-tooltip-reference");
		}

		this.element = function()
		{
			return $("#seqjs-tooltip");
		}

		this.textElement = function()
		{
			return this.element().find("#seqjs-tooltip-text");
		}

		this.footerElement = function()
		{
			return this.element().find("#seqjs-tooltip-footer");
		}

		this.clear = function()
		{
			this.textElement().html('');
			this.footerElement().html('');

			this.element().css('margin-left', 'inherit').css('margin-top', 'inherit');
			this.element().css({top: 'auto', bottom: 'auto', right: 'auto', left: 'auto'});
		}

		this.setText = function(text)
		{
			this.textElement().html(text);

			return this;
		}

		/**
		* @param string position|bottom
		* @return void
		*/
		this.position = function(position)
		{
			var position = position ? position : 'right';
			var reference = this.referenceElement();

			var element = this.element();
			var width = function(){return element.outerWidth()+10;};

			switch(position)
			{
				case 'top':

				break;
				case 'left':
					this.element().css('top', 0).css('left', '-'+width()).css('left', '-'+width());
				break;
				case 'right':
					this.element().css('top', 0).css('right', '-'+width()).css('right', '-'+width());
				break;
				case 'bottom':
					this.element().css('top', reference.outerHeight()+10).css('left', 0);
				break;
			}
		}

		// center to middle of screen.
		this.center = function()
		{
			var reference = this.referenceElement();
			reference.css('left', 0).css('top', 0);
			reference.width('100%').height('100%');

			var element = this.element();
			var offsetLeft = element.outerWidth() / 2;
			var offsetTop = element.outerHeight() / 2;

			element.css('left', '50%').css('top', '50%');
			element.css('margin-left', '-'+offsetLeft+'px').css('margin-top', '-'+offsetTop+'px');
		}

		this.setButtons = function(buttons)
		{
			var footer = this.footerElement();

			for(var i = 0; i < buttons.length; i++)
				footer.append(buttons[i]);
		}

		this.referTo = function(element)
		{
			var width = element.outerWidth();
			var height = element.outerHeight();

			var x = element.offset().left;
			var y = element.offset().top;

			this.referenceElement().width(width).height(height).css('left', x).css('top', y);

		}
	}(jQuery);

	this.helper = new function($)
	{
		this.element = function()
		{
			return $("#seqjs-helper");
		}

		this.clear = function()
		{
			this.element().width(0).height(0);
		}

		// show on element.
		this.referTo = function(element)
		{
			// get width and height of the element.
			var width = element.outerWidth()+6;
			var height = element.outerHeight()+6;

			// position
			var x = element.offset().left-3;
			var y = element.offset().top-3;

			// resize and position
			this.element().width(width).height(height).css('left', x).css('top', y);
		}
	}(jQuery);

	this.elementFactory = new function(jQuery)
	{
		var $ = jQuery;
		var elements = {};

		this.createDiv = function(id)
		{
			var div = $('<div></div>');
			div.attr('id', id);

			return div;
		}

		this.createTooltip = function()
		{
			var reference = this.createDiv('seqjs-tooltip-reference');
			var tooltip = this.createDiv('seqjs-tooltip');
			tooltip.append(this.createDiv('seqjs-tooltip-text'));
			tooltip.append(this.createDiv('seqjs-tooltip-footer'));
			reference.append(tooltip);

			return reference;
		}

		this.createHelper = function()
		{
			return this.createDiv('seqjs-helper');
		}

		this.createOverlay = function()
		{
			return this.createDiv('seqjs-overlay');
		}

		this.has = function(id)
		{
			return $(id)[0] ? true : false;
		}

		this.get = function(id)
		{
			return $(id);
		}

		this.createAllElements = function()
		{
			// create all elements on body
			elements = {
				helper : this.createHelper(),
				overlay : this.createOverlay(),
				tooltip : this.createTooltip()
			};

			$('body').append(elements.overlay)
			.append(elements.helper)
			.append(elements.tooltip);
		}

		this.clearAllElements = function()
		{
			for(var key in elements)
				elements[key].remove();
		}
	}(jQuery);

	/**
	* A sequence class
	* Createable through sequenceJs::create
	* @param sequenceJs manager
	* @param Object options
	* @param Object labels
	*/
	var sequenceClass = function(manager, options, labels)
	{
		var $ = manager.$;
		var steps = [];
		var buttons = {};
		var manager = manager;
		this.labels = {};
		this.options = {};
		this.current = 0;

		// initiate full options and labels
		(function(options, labels)
		{
			this.options = {
				proceedable: true, // may proceed with next button
				skippable: true,
				scrollToElement: true,
				exitOnOverlayClick: true,
				overlayOpacity: 0.5,
				exitOnEsc: true,
				disableInteraction: true,
				onComplete: null,
				onSkip: null,
				onPrevious: null,
				onNext: null,
				callback: null
			};

			this.labels = {
				next: 'Next &rarr;',
				previous: '&larr; Previous',
				skip: 'Skip',
				done: 'Done'
			};

			// merge options.
			if(options)
				for(var key in options)
					this.options[key] = options[key];

			// merge labels
			if(labels)
				for(var key in labels)
					this.labels[key] = labels[key];

		}).call(this, options, labels);

		this.setOption = function(key, value)
		{
			this.options[key] = value;
		}

		this.setLabel = function(key, value)
		{
			this.labels[key] = value;
		}

		this.getLabel = function(key)
		{
			return this.labels[key];
		}

		this.hasLabel = function(key)
		{
			return this.labels[key] ? true : false;
		}

		/**
		* @param object step
		* - text (required)
		* - element
		* - position
		* - callback
		* - buttons
		* @return void
		*/
		this.addStep = function(step)
		{
			steps.push(new (function(step)
			{
				this.invoked = false;

				for(var key in step)
					this[key] = step[key];

			})(step));
		}

		this.addSteps = function(steps)
		{
			for(var i; i < steps.length; i++)
				this.addStep(step[i]);
		}

		/**
		* Execute the step index
		* @param int index
		* @return void
		*/
		this.execute = function(index)
		{
			this.reset();
			this.current = index;

			// clone global options 
			var step = {};
			for(var key in this.options)
				step[key] = this.options[key];

			// then merge step to the options
			for(var key in steps[index])
				step[key] = steps[index][key];

			// set tooltip text.
			manager.tooltip.setText(step.text);
			
			// tour buttons
			var buttons = [];
			if(!this.isDone() && step.skippable)
				buttons.push(buttonFactory.createSkipButton());

			if(this.isDone())
				buttons.push(buttonFactory.createDoneButton());

			if(index > 0)
				buttons.push(buttonFactory.createPreviousButton());
			
			if(index < (steps.length - 1) && step.proceedable === true)
				buttons.push(buttonFactory.createNextButton());

			// if buttons parameter passed
			if(step.buttons)
			{
				for(var name in step.buttons)
				{
					var buttonSetting = step.buttons[name];
					var element = buttonFactory.element(name);

					// set click
					if(buttonSetting.click)
					{
						var sequence = this;
						element.unbind('click').click(function()
						{
							buttonSetting.click.call(step, sequence);
						});
					}
				}
			}

			manager.tooltip.setButtons(buttons);

			// tooltip positioning
			// if has element, refer helper to the element, 
			// and refer the tooltip to the element.
			if(step.element && $(step.element))
			{
				var element = $(step.element);
				element.addClass('seqjs-relative');
				manager.helper.referTo(element);

				// refer to helper element.
				manager.tooltip.referTo(manager.helper.element());

				// position the tooltip
				if(step.position)
					manager.tooltip.position(step.position);
				else
					manager.tooltip.position();

				// equate with jquery object
				step.element = $(step.element);
			}
			else // only show tooltip on the middle of screen
			{
				manager.tooltip.center();
			}

			if(step.callback)
				step.callback.call(step, this);

			// mark this step as invoked
			steps[index].invoked = true;
		}

		this.isDone = function()
		{
			return (this.current+1) == steps.length;
		}

		var buttonFactory = new function(jQuery, sequence)
		{
			var $ = jQuery;
			var elements = {};
			var sequence = sequence;

			this.createSkipButton = function()
			{
				var button = this.createButton('skip').addClass('seqjs-button-skip');
				button.click(function()
				{
					sequence.skip();
				});

				return button;
			}

			this.createDoneButton = function()
			{
				var button = this.createButton('done').addClass('seqjs-button-done');
				button.click(function()
				{
					sequence.complete();
				});

				return button;
			}

			this.createNextButton = function()
			{
				var button = this.createButton('next').addClass('seqjs-button-next');
				button.click(function()
				{
					sequence.next();
				});
				return button;
			}

			this.createPreviousButton = function()
			{
				var button = this.createButton('previous').addClass('seqjs-button-previous');
				button.click(function()
				{
					sequence.previous();
				});

				return button;
			}

			this.element = function(name)
			{
				return elements[name];
			}

			this.createButton = function(name, label)
			{
				var label = label ? label : (sequence.hasLabel(name) ? sequence.getLabel(name) : name); // use name a the label, label is no where set.
				var button = $("<a href='javascript:void(0);'></a>");
				elements[name] = button;
				button.addClass('seqjs-button');
				button.html(label);
				return button;
			}
		}($, this);

		this.reset = function()
		{
			manager.helper.clear();
			manager.tooltip.clear();
			$(".seqjs-relative").removeClass('seqjs-relative');
		}

		this.previous = function()
		{
			if(this.options.onPrevious)
				this.options.onPrevious.call(this, steps[this.current]);
			
			this.execute(this.current-1);
		}

		this.next = function()
		{
			if(this.options.onNext)
				this.options.onNext.call(this, steps[this.current]);

			this.execute(this.current+1);
		}

		this.skip = function()
		{
			if(this.options.onSkip)
				this.options.onSkip.call(this, steps[this.current]);

			this.end();
		}

		this.complete = function()
		{
			if(this.options.onComplete)
				this.options.onComplete.call(this, steps[this.current]);

			this.end();
		}

		this.end = function()
		{
			this.reset();
			manager.overlay.clear();
			manager.elementFactory.clearAllElements();
		}

		this.start = function()
		{
			manager.elementFactory.createAllElements();
			this.execute(0);
			manager.overlay.show();
		}
	};
};