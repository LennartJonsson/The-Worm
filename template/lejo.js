/**
 * Helpers and tools to ease your JavaScript day.
 *
 * @author Lennart Jönsson (bo.lennart.jonsson@gmail.com)
 */
window.Lejo = (function(window, document, undefined ) {
  var Lejo = {};  

  /**
   * Get the position of an element.
   * http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript
   * @param el the element.
   */
  Lejo.getPosition = function ( el ) {
      var _x = 0;
      var _y = 0;
      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
      }
      return { top: _y, left: _x };
  }

  /**
   * Get random number from min to max.
   */
  Lejo.getRandom = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }


  // Expose public methods
  return Lejo;
  
})(window, window.document);
