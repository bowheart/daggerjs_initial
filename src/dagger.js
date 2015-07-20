(function() {
	var Dagger = function(selector) {
		return Dagger.NodeList(selector);
	};
	
	// Expose Dagger to the appropriate object -- `module.exports` in node.js or `window` in a browser
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = Dagger;
	} else {
		this.Dagger = this.dg = Dagger;
	}
	
	
	Dagger._version = 0.1;
	
	
	// = = = = = = = = = = = = = = = =   DaggerJS - Private Members   = = = = = = = = = = = = = = = = //
	var _readyAlready = false;
	var _readyCallbacks = [];
	var _handleReady = function() {
		if (document.readyState === 'interactive' || _readyAlready) {
			_readyAlready = true;
			while (_readyCallbacks.length) {
				var nextCallback = _readyCallbacks.shift();
				nextCallback[0](nextCallback[1]);
			}
		}
	};
	document.onreadystatechange = _handleReady;
	
	// = = = = = = = = = = = = = = = =   DaggerJS - Private Helper Functions   = = = = = = = = = = = = = = = = //
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
	
	
	
	// DaggerJS - Declare the extend function first so we can use it to add everything else
	Dagger.extend = function(sourceObj, targetObj) {
		if (!targetObj) {
			return sourceObj;
		}
		for (var key in targetObj) {
			sourceObj[key] = targetObj[key];
		}
		return sourceObj;
	};
	
	
	// DaggerJS - Public Helper and Identifier Functions
	Dagger.extend(Dagger, {
		// = = = = = = = = = = = = = = = =   DaggerJS - Public Helper Functions   = = = = = = = = = = = = = = = = //
		each: function(obj, callback, context) {
			if (Dagger.isObject(obj)) {
				var keys = Dagger.keys(obj);
				for (var i = 0; i < keys.length; i++) {
					callback.call(context, obj[keys[i]], keys[i], i, obj); // callback(val, key, index, obj)
				}
			} else if (Dagger.isArray(obj)) {
				for (var i = 0; i < obj.length; i++) {
					callback.call(context, obj[i], i, obj); // callback(val, index, arr)
				}
			} // No Ret
		},
		keys: function(obj) {
			return Object.keys(obj); // Ret Type === Array
		},
		map: function(obj, callback, context) {
			var result = [];
			Dagger.each(obj, function(key, val, index, obj2) {
				result.push(callback.call(context, key, val, index, obj2));
			});
			return result; // Ret Type === Array
		},
		values: function(obj) {
			return Dagger.keys(obj).map(function(key) { return obj[key]; }); // Ret Type === Array
		},
		
		// = = = = = = = = = = = = = = = =   DaggerJS - Public Identifier Functions   = = = = = = = = = = = = = = = = //
		isArray: function(arr) {
			return Array.isArray(arr);
		},
		isDeferral: function(obj) {
			return typeof obj === 'object' && _objectsMatch(Object.getPrototypeOf(obj), Dagger.Deferral.prototype);
		},
		isEl: function(obj) {
			return typeof obj === 'object' && _objectsMatch(Object.getPrototypeOf(obj), Dagger.El.prototype);
		},
		isObject: function(obj) {
			return typeof obj === 'object' && !Dagger.isArray(obj);
		},
		isXMLHttpRequest: function(obj) {
			return obj instanceof XMLHttpRequest;
		}
	});
	
	
	
	// Dagger.Deferral
	Dagger.extend(Dagger, {
		/**
		 * A Deferral can take an XMLHttp object, another Deferral object, or nothing -- 'ajax', 'deferral', 'empty'.
		 * The returned Deferral can then be passed any number of chained callbacks (via Deferral.yes(), Deferral.no(), Deferral.both()).
		 *     e.g. -- Dagger.Deferral().yes(function(result) {}).yes(function(result) {}).no(function(result) {}).trigger('yes');
		 * An ajax Deferral or Deferral Deferral will call the appropriate callback(s) when it resolves.
		 * An empty Deferral can be resolved manually (Deferral.trigger('yes' || 'no').
		 */
		Deferral: (function() {
			var deferralPrototype = function() {
				var private = this;
				return {
					both: function(callback) {
						if (private.resolved) {
							callback(private.result);
							return this;
						}
						private.callbacks['both'] = private.callbacks['both'] || [];
						private.callbacks['both'].push(callback);
						return this;
					},
					no: function(callback) {
						if (private.resolved && private.success === 'no') {
							callback(private.result);
							return this;
						}
						private.callbacks['no'] = private.callbacks['no'] || [];
						private.callbacks['no'].push(callback);
						return this;
					},
					yes: function(callback) {
						if (private.resolved && private.success === 'yes') {
							callback(private.result);
							return this;
						}
						private.callbacks['yes'] = private.callbacks['yes'] || [];
						private.callbacks['yes'].push(callback);
						return this;
					},

					trigger: function(type, triggerData) {
						private.resolved = true;
						private.success = (type === 'no' ? 'no' : 'yes');
						private.result = private.result || triggerData;
						if (private.success === 'yes') {
							while (private.callbacks['yes'] && private.callbacks['yes'].length) {
								private.callbacks['yes'].shift()(private.result);
							}
						} else {
							while (private.callbacks['no'] && private.callbacks['no'].length) {
								private.callbacks['no'].shift()(private.result);
							}
						}
						while (private.callbacks['both'] && private.callbacks['both'].length) {
							private.callbacks['both'].shift()(private.result);
						}
						return this;
					}
				};
			};
			
			var Deferral = function(obj) {
				// = = = = = = = = = = = = = = = =   PRIVATE MEMBERS   = = = = = = = = = = = = = = = = //
				var privateMembers = {
					resolved: false, result: undefined, success: '', callbacks: {}
				};
				// = = = = = = = = = = = = = = = =   PUBLIC MEMBERS   = = = = = = = = = = = = = = = = //
				var Deferral = function() {
					var self = this;
					if (Dagger.isXMLHttpRequest(obj)) {
						obj.onload = function() {
							self.trigger(this.status === 200 ? 'yes' : 'no', obj.response);
						};
						obj.send();
					} else if (Dagger.isDeferral(obj)) {
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
		})()
	});

	// Dagger.El
	Dagger.extend(Dagger, {
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
				css: function(property, value) {
					if (typeof property === 'object') {
						
					}
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


			return function(tagName, text, elExists) {
				var El = function() {
					tagName && (this.tagName = tagName);
					text && (this.txt = text);
					this.el = elExists ? document.querySelector(this.tagName) : document.createElement(this.tagName);
					this.css().text();
				};
				El.prototype = elPrototype;
				return new El();
			};
		})()
	});
	
	// Dagger.NodeList
	Dagger.extend(Dagger, {
		/**
		 * The NodeList behaves very similar to a jQuery object, but is an actual array so you have access to all the normal array functions.
		 */
		NodeList: (function() {
			var nodeListPrototype =  {
				append: function(nodeList) {
					_nodeLoop(this, nodeList, function(sourceNode, targetNode) {
						sourceNode.appendChild(_toNodeList(targetNode).clone()[0]);
					});
					return this;
				},
				
				clone: function(cloneChildren) {
					if (!this.length) return Dagger.NodeList();
					cloneChildren === false || (cloneChildren = true);
					var clonedNode = this[0].cloneNode(cloneChildren);
					clonedNode.eventHandlers = this[0].eventHandlers || {};
					if (Object.keys(clonedNode.eventHandlers).length) {
						Dagger.each(clonedNode.eventHandlers, function(eventName) {
							_bindEvent.call(clonedNode, eventName);
						});
					}
					return _toNodeList(clonedNode);
				},
				
				html: function(html) {
					if (!html) return this.length ? this[0].innerHTML : '';
					_nodeLoop(this, function(node) {
						node.innerHTML = html;
					});
					return this;
				},

				on: function(eventName, callback) {
					_nodeLoop(this, function(node) {
						!node.eventHandlers && (node.eventHandlers = {});
						_bindEvent.call(node, eventName);
						node.eventHandlers[eventName].push(callback);
					});
					return this;
				},

				prepend: function(nodeList) {
					_nodeLoop(this, nodeList, function(sourceNode, targetNode) {
						sourceNode.insertBefore(_toNodeList(targetNode).clone()[0], sourceNode.firstElementChild);
					});
					return this;
				},
				
				text: function(text) {
					if (!text) return this.length ? this[0].innerText : '';
					_nodeLoop(this, function(node) {
						node.innerText = text;
					});
					return this;
				}
			};
			
			// = = = = = = = = = = = = = = = =   NodeList - Private Members   = = = = = = = = = = = = = = = = //
			var _bindEvent = function(eventName) {
				if (!this['on' + eventName]) {
					this['on' + eventName] = function(event) {
						_triggerEventHandlers.call(this, eventName, event);
					};
					this.eventHandlers[eventName] = [];
				}
			};
			var _nodeLoop = function(sourceList, targetList, callback) {
				!callback && (callback = targetList) && (targetList = undefined);
				sourceList = _toNodeList(sourceList);
				targetList && (targetList = _toNodeList(targetList));
				Dagger.each(sourceList, function(sourceNode) {
					if (!targetList) {
						callback.call(sourceList, sourceNode);
					} else {
						Dagger.each(targetList, function(targetNode) {
							callback.call(sourceList, sourceNode, targetNode);
						});
					}
				});
			};
			var _toNodeList = function(obj) {
				if (Dagger.isArray(obj) && typeof obj.append) {
					return obj;
				} else if (obj instanceof HTMLElement) {
					return Dagger.extend([obj], nodeListPrototype); // Turn the HTMLElement into a NodeList
				} else {
					throw new Error('DaggerJS Error: Parameter must be of type HTMLElement or Dagger.NodeList.');
				}
			};
			var _triggerEventHandlers = function(eventName, event) {
				Dagger.each(this.eventHandlers[eventName], function(handler) {
					handler(event);
				});
			};
			
			return function(selector) {
				var queryResult = selector ? [].slice.call(document.querySelectorAll(selector.toString())) : [];
				Dagger.extend(queryResult, nodeListPrototype);
				return queryResult;
			};
		})()
	});

	// Dagger.Controller
	Dagger.extend(Dagger, {
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
					this.el = Dagger.isEl(selector) ? selector : Dagger.El(selector, '', true);
				};
				Controller.prototype = controllerPrototype;
				return new Controller();
			};
		})()
	});
	
	// DaggerJS - Functions
	Dagger.extend(Dagger, {
		ajax: function(opts) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open(opts.type || 'GET', opts.url || opts, opts.async || true);
			return Dagger.Deferral(xmlHttp);
		},

		ready: function(callback, context) {
			if (_readyAlready) {
				callback(context);
				return;
			}
			_readyCallbacks.push([callback, context]);
		}
	});
	
}).call(this);


Dagger.ready(function() {
	window.MainController = Dagger.Controller('body');
});