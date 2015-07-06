var Dagger = D = (function() {
	var Dagger = {
		Controller: (function() {
			var controllerPrototype = {
				// takes a string--'h1 p p'--and turns it into HTML.  TODO -- decide what the template language of DaggerJS will look like.
				markup: function(markup) {
					var elements = markup.split(/\s+/g);
					for (var i = 0; i < elements.length; i++) {
						this.el.append(Dagger.El(elements[i]));
					}
				}
			};

			return function(selector) {
				selector = selector || 'body';
				var Controller = function() {
					this.el = _isEl(selector) ? selector : Dagger.El(selector, '', true);
				};
				Controller.prototype = controllerPrototype;
				return new Controller();
			};
		})(),
		
		/**
		 * A Deferral can take an XMLHttp object, another Deferral object, or nothing -- 'ajax', 'deferral', 'empty'.
		 * The returned Deferral can then be passed any number of chained callbacks (via Deferral.yes(), Deferral.no(), Deferral.both()).
		 *     e.g. -- Dagger.Deferral().yes(function(result) {}).yes(function(result) {}).no(function(result) {}).trigger('yes');
		 * An ajax Deferral or Deferral Deferral will call the appropriate callback(s) when it resolves.
		 * An empty Deferral can be resolved manually (Deferral.trigger('yes' || 'no').
		 */
		Deferral: (function() {
			var deferralPrototype = function() {
				var privateMembers = this;
				return {
					both: function(callback) {
						if (privateMembers.resolved) {
							callback(privateMembers.result);
							return this;
						}
						privateMembers.bothCallbacks.push(callback);
						return this;
					},
					no: function(callback) {
						if (privateMembers.resolved && privateMembers.success === 'no') {
							callback(privateMembers.result);
							return this;
						}
						privateMembers.noCallbacks.push(callback);
						return this;
					},
					yes: function(callback) {
						if (privateMembers.resolved && privateMembers.success === 'yes') {
							callback(privateMembers.result);
							return this;
						}
						privateMembers.yesCallbacks.push(callback);
						return this;
					},

					trigger: function(type, triggerData) {
						privateMembers.resolved = true;
						privateMembers.success = (type === 'no' ? 'no' : 'yes');
						privateMembers.result = privateMembers.result || triggerData;
						if (privateMembers.success === 'yes') {
							while (privateMembers.yesCallbacks.length) {
								privateMembers.yesCallbacks.shift()(privateMembers.result);
							}
						} else {
							while (privateMembers.noCallbacks.length) {
								privateMembers.noCallbacks.shift()(privateMembers.result);
							}
						}
						while (privateMembers.bothCallbacks.length) {
							privateMembers.bothCallbacks.shift()(privateMembers.result);
						}
						return this;
					}
				};
			};
			
			var Deferral = function(obj) {
				// = = = = = = = = = = = = = = = =   PRIVATE MEMBERS   = = = = = = = = = = = = = = = = //
				var privateMembers = {
					resolved: false, result: undefined, success: '',
					noCallbacks: [], bothCallbacks: [], yesCallbacks: []
				};
				var resolved = false, success = '', result = undefined;
				var noCallbacks = [], bothCallbacks = [], yesCallbacks = [];
				// = = = = = = = = = = = = = = = =   PUBLIC MEMBERS   = = = = = = = = = = = = = = = = //
				var Deferral = function() {
					var self = this;
					if (_isXMLHttpRequest(obj)) {
						obj.onload = function() {
							self.trigger(this.status === 200 ? 'yes' : 'no', obj.response);
						};
						obj.send();
					} else if (_isDeferral(obj)) {
						obj.yes(function(result) {
							self.trigger('yes', result);
						}).no(function(result) {
							self.trigger('no', result);
						});
					}
				};
				Deferral.prototype = deferralPrototype.call(privateMembers);
				return new Deferral();
			};
			Deferral.prototype = deferralPrototype();
			return Deferral;
		})(),

		El: (function() {
			var elPrototype = {
				style: { fontFamily: 'arial' },
				tagName: 'div',
				txt: '',

				after: function(elObj) {
					elObj = _toEl(elObj);
					var parent = this.el.parentElement;
					var children = _normalizeCollection(parent.children);
					var afterEl = children[children.indexOf(this.el) + 1];
					parent.insertBefore(elObj.el, afterEl);
					return this;
				},
				append: function(elObj) {
					elObj = _toEl(elObj);
					this.el.appendChild(elObj.el);
					return this;
				},
				before: function(elObj) {
					elObj = _toEl(elObj);
					this.el.parentElement.insertBefore(elObj.el, this.el);
					return this;
				},
				css: function() {
					for (var i in this.style) {
						this.el.style[i] = this.style[i];
					}
					return this;
				},
				insertAfter: function(elObj) {
					try {
						elObj.after(this);
					} catch(exception) {
						throw new Error('insertAfter: target element must already be in the DOM');
					}
					return this;
				},
				insertBefore: function(elObj) {
					try {
						elObj.before(this);
					} catch(exception) {
						throw new Error('insertBefore: target element must already be in the DOM');
					}
					return this;
				},
				prepend: function(elObj) {
					elObj = _toEl(elObj);
					this.el.insertBefore(elObj.el, this.el.firstElementChild);
					return this;
				},
				text: function(text) {
					text && (this.txt = text);
					this.el.innerText = this.txt;
					return this;
				}
			};


			// = = = = = = = = = = = = = = = = = = = =   PRIVATE MEMBERS   = = = = = = = = = = = = = = = = = = = = //
			var _normalizeCollection = function(collection) {
				return [].slice.call(collection);
			};
			var _toEl = function(data) {
				return typeof data === 'string' ? Dagger.El(data) : data;
			};


			var El = function(tagName, text, elExists) {
				var El = function() {
					tagName && (this.tagName = tagName);
					text && (this.txt = text);
					this.el = elExists ? document.querySelector(this.tagName) : document.createElement(this.tagName);
					this.css().text();
				};
				El.prototype = elPrototype;
				return new El();
			};
			El.prototype = elPrototype;
			return El;
		})(),
		
		ajax: function(opts) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open(opts.type || 'GET', opts.url || opts, opts.async || true);
			return Dagger.Deferral(xmlHttp);
		},

		ready: function(callback, context) {
			if (readyAlready) {
				callback(context);
				return;
			}
			readyCallbacks.push([callback, context]);
		}
	};
	
	// = = = = = = = = = = = = = = = =   PRIVATE MEMBERS   = = = = = = = = = = = = = = = = //
	var readyAlready = false;
	var readyCallbacks = [];
	
	var _handleReady = function() {
		if (document.readyState === 'interactive' || readyAlready) {
			readyAlready = true;
			while (readyCallbacks.length) {
				var nextCallback = readyCallbacks.shift();
				nextCallback[0](nextCallback[1]);
			}
		}
	};
	var _isDeferral = function(obj) {
		return typeof obj === 'object' && _objectsMatch(Object.getPrototypeOf(obj), Dagger.Deferral.prototype);
	};
	var _isEl = function(obj) {
		return typeof obj === 'object' && _objectsMatch(Object.getPrototypeOf(obj), Dagger.El.prototype);
	};
	var _isXMLHttpRequest = function(obj) {
		return obj instanceof XMLHttpRequest;
	};
	
	// = = = = = = = = = = = = = = = =   Helper Functions   = = = = = = = = = = = = = = = = //
	var _arraysMatch = function(arr1, arr2) {
		if (arr1.length !== arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	};
	var _objectsMatch = function(obj1, obj2) {
		return typeof obj1 === 'object' && typeof obj2 === 'object' && _arraysMatch(Object.keys(obj1), Object.keys(obj2));
	};
	
	
	document.onreadystatechange = _handleReady;
	
	return Dagger;
})();

Dagger.ready(function() {
	window.MainController = Dagger.Controller('body');
});