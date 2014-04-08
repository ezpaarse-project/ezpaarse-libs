'use strict';

function Stackware() {
  Object.defineProperty(this, '_stack', {
    value: [],
    writable: true,
    enumerable: false,
    configurable: false
  });
}
module.exports = Stackware;

Stackware.prototype._stack = undefined;

/**
 * Add a middleware function to the stack.
 * @param  {Function} fn    the middleware
 * @return {Object}   this  for chaining
 */
Stackware.prototype.use = function(fn) {
  if (typeof fn === 'function')
    this._stack.push(fn);
  else if (fn && typeof fn.handle === 'function')
    this._stack.push(fn.handle);
  else
    throw new Error('fn is not a function');
  return this;
};

/**
 * Run the middleware stack
 * @return {Object} this  for chaining
 */
Stackware.prototype.process = function() {
  var stack = this._stack;
  var args  = Array.prototype.slice.call(arguments, 0);
  var index = 0;
  var layer;

  var next = function (err) {
    layer = stack[index++];
    if (!layer) return;

    if (err) {
      if (layer.length > args.length) {
        layer.apply(this, [err].concat(args));
      } else {
        next(err);
      }
    } else if (layer.length <= args.length) {
      layer.apply(this, args);
    } else {
      next();
    }
  }

  args.push(next);
  next();
  return this;
}