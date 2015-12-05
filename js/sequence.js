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
	var defaultButtonRegistry = {};

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

	this.configureButtons = function(registry)
	{
		defaultButtonRegistry = registry;
	}

	this.create = function(name, opts, lbls)
	{
		var options = defaultOptions;
		var labels = defaultLabels;
		var buttonRegistry = defaultButtonRegistry;

		if(opts)
			for(var key in opts)
				options[key] = opts[key];

		if(lbls)
			for(var key in lbls)
				labels[key] = lbls[key];

		var sequence = new sequenceClass(this, options, labels, buttonRegistry);
		instances[name] = sequence;
		return sequence;
	}

	this.get = function(name)
	{
		if(!instances[name])
			return this.create(name);

		return instances[name];
	}

	this.has = function(name)
	{
		return instances[name] ? true : false;
	}

	this.start = function(name)
	{
		if(this.has(name))
			this.get(name).start();
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

		this.onClick = function(callback)
		{
			// onbind any click.
			this.element().unbind('click');

			this.element().click(callback);
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
			var height = function(){return element.outerHeight()+10;};

			switch(position)
			{
				case 'top':
					this.element().css('top', '-'+height()+'px').css('left', 0);
				break;
				case 'left':
					this.element().css('top', 0).css('left', '-'+width()+'px').css('left', '-'+width()+'px');
				break;
				case 'right':
					this.element().css('top', 0).css('right', '-'+width()+'px').css('right', '-'+width()+'px');
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

		this.setButtons = function(buttons, order)
		{
			var footer = this.footerElement();

			if(!order)
			{
				for(var name in buttons)
					footer.append(buttons[name]);
			}
			else
			{
				for(var i = 0; i < order.length; i++)
				{
					if(buttons[order[i]])
						footer.append(buttons[order[i]]);
				}
			}


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

	var util = new function($)
	{
		this.shallowCopy = function(obj, destination)
		{
			var newObj = destination ? destination : {};

			for(var key in obj)
				newObj[key] = obj[key];

			return newObj;
		}
	}(jQuery);

	/**
	* A sequence class
	* Createable through sequenceJs::create
	* @param sequenceJs manager
	* @param Object options
	* @param Object labels
	*/
	var sequenceClass = function(manager, options, labels, buttonRegistry)
	{
		var $ = manager.$;
		var steps = [];
		var currentStepOption = null;
		var buttons = {};
		var manager = manager;
		var isRunning = false;
		this.labels = {};
		this.options = {};
		this.current = 0;

		// initiate full options and labels
		(function(options, labels)
		{
			// default sequence options
			this.options = {
				mandatory: false,
				proceedable: true, // may proceed with next button
				undoable: true, // may go backward
				skippable: true,
				buttonHideOnDisabled: false,
				scrollToElement: true,
				exitOnOverlayClick: false, // if not in a final step, will execute skip, else, will complete.
				overlayOpacity: 0.5,
				exitOnEsc: true,
				disableInteraction: true,
				onComplete: null,
				onSkip: null,
				onPrevious: null,
				onNext: null,
				onOverlayClick: null,
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

		this.setOptions = function(options)
		{
			for(var key in options)
				this.setOption(key, options[key]);
		}

		this.setLabel = function(key, value)
		{
			this.labels[key] = value;
		}

		this.setLabels = function(labels)
		{
			for(var key in labels)
				this.setLabel(key, labels[key]);
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
			var sequence = this;

			// clone global options 
			var option = currentStepOption = {};
			for(var key in this.options)
				option[key] = this.options[key];

			// then merge step option to global option
			for(var key in steps[index])
				option[key] = steps[index][key];

			// @mandatory if an alias for proceedable except on opposite flag. (true mandatory = false proceedable)
			if(option.mandatory === true)
				option.proceedable = false;

			// @exitOnOverlayClick
			if(option.exitOnOverlayClick === true)
			{
				manager.overlay.onClick(function()
				{
					if(sequence.isDone())
						sequence.complete();
					else
						sequence.skip();
				});
			}

			// @text set tooltip text.
			manager.tooltip.setText(option.text);
			
			// tour buttons
			var buttons = {};

			if(!option.buttons || (option.buttons && option.buttons.default === true))
			{
				if(this.isDone())
				{
					buttons['done'] = this.buttons.create('done');
				}
				else // skip
				{
					// @skippable
					if(option.skippable)
						buttons['skip'] = this.buttons.create('skip');
					else
						buttons['skip'] = this.buttons.create('skip', {disabled: true});
				}

				// @undoable
				if(index > 0 && option.undoable === true)
					buttons['previous'] = this.buttons.create('previous');
				else
					buttons['previous'] = this.buttons.create('previous', {disabled: true});

				// @proceedable
				if(index < (steps.length - 1) && option.proceedable === true)
					buttons['next'] = this.buttons.create('next');
				else
					buttons['next'] = this.buttons.create('next', {disabled: true});
			}

			// @buttons custom button
			var order = null;
			if(option.buttons)
			{
				if($.isArray(option.buttons))
				{
					order = option.buttons;
				}
				else
				{
					for(var name in option.buttons)
					{
						var buttonOption = option.buttons[name];
						buttons[name] = this.buttons.create(name, buttonOption);
					}
				}
			}

			manager.tooltip.setButtons(buttons, order);

			// @element
			// tooltip positioning
			// if has element, refer helper to the element, 
			// and refer the tooltip to the element.
			if(option.element && $(option.element))
			{
				var element = $(option.element);
				element.addClass('seqjs-relative');
				manager.helper.referTo(element);

				// refer to helper element.
				manager.tooltip.referTo(manager.helper.element());

				// position the tooltip
				if(option.position)
					manager.tooltip.position(option.position);
				else
					manager.tooltip.position();

				// equate with jquery object
				option.selector = option.element; // save the selector string
				option.element = $(option.element);
			}
			else // only show tooltip on the middle of screen
			{
				manager.tooltip.center();
			}

			// @callback to be called on every step execution
			if(option.callback)
				option.callback.call(option, this, option);

			// register invoked flag
			steps[index].invoked = true;
		}

		this.buttons = new function(jQuery, sequence, globalRegistry)
		{
			var $ = jQuery;
			var elements = {};
			var sequence = sequence;
			var registry = {};

			this.register = function(name, options)
			{
				registry[name] = options;
			};

			// register default buttons 
			// - next
			// - previous
			// - skip
			// - done
			(function(globalRegistry, localRegistry)
			{
				this.register('next', {
					class: 'seqjs-button-next',
					event: {
						click: function()
						{
							sequence.next();
						}
					}
				});

				this.register('previous', {
					class: 'seqjs-button-previous',
					event: {
						click: function()
						{
							sequence.previous();
						}
					}
				})

				this.register('skip', {
					class: 'seqjs-button-skip',
					event: {
						click: function()
						{
							sequence.skip();
						}
					}
				});

				this.register('done', {
					class: 'seqjs-button-done',
					event: {
						click: function()
						{
							sequence.complete();
						}
					}
				});

				// copy globalRegistry into local
				for(var name in globalRegistry)
				{
					if(!localRegistry[name])
						localRegistry[name] = {};

					for(var opt in globalRegistry[name])
					{
						if(opt == 'event')
						{
							for(var ev in globalRegistry[name][opt])
							{
								localRegistry[name][ev][opt] = globalRegistry[name][ev][opt];
							}
						}
						else
						{
							localRegistry[name][opt] = globalRegistry[name][opt];
						}
					}
				}
			}).call(this, globalRegistry, registry);

			this.create = function(name, option)
			{
				var option = option ? option : {};
				var registryOpt = registry[name];

				// copy unto local option and merge with registered setting
				for(var key in registryOpt)
				{
					if(key == 'event')
					{
						if(!option.event)
							option.event = {};

						for(var event in registryOpt[key])
							option.event[event] = registryOpt.event[event];
					}
					else
					{
						option[key] = registryOpt[key];
					}
				}

				var label = option.label ? option.label : null;
				var button = createButton(name, label);

				if(option.disabled)
				{
					if(currentStepOption.buttonHideOnDisabled === true)
						button.addClass('seqjs-hide');
					else
						button.addClass('seqjs-disabled');
				}

				if(option.class)
					button.addClass(option.class);

				// move to option.event
				if(option.click)
				{
					if(!option.event)
						option.event = {};

					option.event['click'] = option.click;
				}

				// bind event.
				if(option.event && !option.disabled)
				{
					for(var event in option.event)
						button[event](option.event[event]);
				}

				return button;
			}

			var createButton = function(name, label)
			{
				var label = label ? label : (sequence.hasLabel(name) ? sequence.getLabel(name) : name); // use name a the label, label is no where set.
				var html = "<a href='javascript:void(0);'></a>";
				var button = $(html);
				elements[name] = button;
				button.addClass('seqjs-button');
				button.html(label);

				return button;
			}
		}($, this, buttonRegistry);

		this.isDone = function()
		{
			return (this.current+1) == steps.length;
		}

		this.isRunning = function()
		{
			return isRunning;
		}

		this.reset = function()
		{
			manager.helper.clear();
			manager.tooltip.clear();
			$(".seqjs-relative").removeClass('seqjs-relative');
		}

		this.previous = function()
		{
			if(currentStepOption.onPrevious && currentStepOption.onPrevious.call(this, steps[this.current]) === false)
				return;
			
			this.execute(this.current-1);
		}

		this.next = function()
		{
			if(currentStepOption.onNext && currentStepOption.onNext.call(this, steps[this.current]) === false)
				return;

			this.execute(this.current+1);
		}

		this.skip = function()
		{
			if(currentStepOption.onSkip && currentStepOption.onSkip.call(this, steps[this.current]) === false)
				return;

			this.end();
		}

		this.complete = function()
		{
			if(currentStepOption.onComplete && currentStepOption.onComplete.call(this, steps[this.current]) === false)
				return;

			this.end();
		}

		this.end = function()
		{
			this.reset();
			isRunning = false;
			manager.overlay.clear();
			manager.elementFactory.clearAllElements();
		}

		this.start = function()
		{
			isRunning = true;
			manager.elementFactory.createAllElements();
			this.execute(0);
			manager.overlay.show();
		}
	};
};