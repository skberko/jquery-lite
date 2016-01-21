(function(){

  var functionsQueue = [];
  var domLoaded = false;
  var fn = function() {
    domLoaded = true;
    while (functionsQueue.length !== 0) {
      (functionsQueue.shift())();
    }
  };
  document.addEventListener('DOMContentLoaded', fn, false);

  var DOMNodeCollection = function(elementsArray) {
    this.elementsArray = elementsArray;
  };

  window.$l = function(arg){
    if (typeof arg === "string") {
      var cssMatches = document.querySelectorAll(arg);
      cssMatches = [].slice.call(cssMatches);
      return new DOMNodeCollection(cssMatches);
    } else if (arg instanceof HTMLElement) {
      return new DOMNodeCollection([arg]);
    } else if (typeof arg === "function") {
      if (domLoaded) {
        return arg();
      } else {
        functionsQueue.push(arg);
      }
    }
  };

  window.$l.prototype.extend = function(finalObject) {
    // arguments is array-like obj provided by js with every fcn;
    // contains all args passed to the fcn
    var mergeArgs = [].slice.call(arguments, 1);
    // var finalObject = mergeArgs[0];

    for(var i = 0; i < mergeArgs.length; i++) {
      //
      var argKeys = Object.keys(mergeArgs[i]);
      for (var j = 0; j < argKeys.length; j++) {
        var currentArgKey = argKeys[j];
        finalObject[currentArgKey] = mergeArgs[i][currentArgKey];
      }
    }
    return finalObject;
  };

  var toQueryString = function (object) {
    var result = '';
    for(var property in object) {
      if (object.hasOwnProperty(property)){
        result += property + '=' + object[property] + '&';
      }
    }
  };

  window.$l.prototype.ajax = function (options) {
    var defaultOptions = {
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      method: 'GET',
      url: '',
      success: function () {},
      error: function () {},
      data: {}
    };
    options = window.$l.extend(defaultOptions, options);
    var request = new XMLHttpRequest();

    if (options.method.toUpperCase() === 'GET') {
      options.url += '?' + toQueryString(options.data);
    }

    request.open(options.method, options.url, true);
    request.onload = function (e) {
      if (request.status === 200) {
        options.success(request.response);
      } else {
        options.error(request.response);
      }
    };

    request.send(JSON.stringify(options.data));
  };

  DOMNodeCollection.prototype = {
    on: function(eventType, listener) {
      for (var i = 0; i < this.elementsArray.length; i++) {
        this.elementsArray[i].addEventListener(eventType, listener);
      }
    },

    off: function(eventType, listener) {
      for (var i = 0; i < this.elementsArray.length; i++) {
        this.elementsArray[i].removeEventListener(eventType, listener);
      }
    },

    html: function(string) {
      if (typeof string !== "undefined") {
        this.elementsArray.forEach(function(el){
          el.innerHTML = string;
        });
      } else {
        return this.elementsArray[0].innerHTML;
      }
    },

    empty: function() {
      this.elementsArray.forEach(function(el){
        el.innerHTML = "";
      });
    },

    append: function(arg) {
      if (arg instanceof DOMNodeCollection) {
        this.elementsArray.concat(arg);
      } else if (arg instanceof HTMLElement) {
        this.elementsArray.concat(arg);
      } else if (typeof arg === "string") {
        this.elementsArray.concat(arg);
      }
    },

    remove: function() {
      for (var i = 0; i < this.elementsArray.length; i++) {
        this.elementsArray[i].remove();
      }
    },

    attr: function(attrName, attrValue) {
      if (typeof attrValue === "undefined") {
        for (var i = 0; i < this.elementsArray.length; i++) {
          if (this.elementsArray[i].getAttribute(attrName)) {
            return this.elementsArray[i].getAttribute(attrName);
          }
        }
      } else {
        for (var j = 0; j < this.elementsArray.length; j++) {
          this.elementsArray[j].setAttribute(attrName, attrValue);
        }
      }
    },

    addClass: function(className) {
      for (var i = 0; i < this.elementsArray.length; i++) {
        this.elementsArray[i].classList.add(className);
      }
    },

    removeClass: function(className) {
      for (var i = 0; i < this.elementsArray.length; i++) {
        this.elementsArray[i].classList.remove(className);
      }
    },

    find: function(selector) {
      var matchingElements = [];

      for (var i = 0; i < this.elementsArray.length; i++) {
        matchingElements.push(this.elementsArray[i].querySelectorAll(selector));
      }

      return matchingElements;
    },

    children: function() {
      var childrenArray = [];

      for (var i = 0; i < this.elementsArray.length; i++) {
        childrenArray.push(this.elementsArray[i].children);
      }

      return new DOMNodeCollection(childrenArray);
    },

    parent: function() {
      var parentsArray = [];

      for (var i = 0; i < this.elementsArray.length; i++) {
        parentsArray.push(this.elementsArray[i].parentElement);
      }

      return new DOMNodeCollection(parentsArray);
    }
  };
})();
