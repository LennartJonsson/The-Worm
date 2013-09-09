/**
 * Playing the Worm while learning JavaScript object model.
 */

/** 
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */ 
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
window.cancelRequestAnimFrame = (function(){
  return  window.cancelRequestAnimationFrame || 
          window.webkitCancelRequestAnimationFrame || 
          window.mozCancelRequestAnimationFrame    || 
          window.oCancelRequestAnimationFrame      || 
          window.msCancelRequestAnimationFrame     || 
          window.clearTimeout;
})();

const cVanvas_Name = 'canvas1';

const cWorm_Diameter = 7*6;
const cWorm_Radius = 7*3;
const cWorm_Width = cWorm_Diameter;
const cWorm_FillStyle = 'hsla(50, 98%, 51%,1)';	// yellow
const cWorm_Length = 20+1;

const cApple_Diameter = cWorm_Diameter;
const cApple_Width = cApple_Diameter;
const cApple_Height = cApple_Diameter;
const cApple_Radius = cApple_Diameter/2;

const cApple_FillStyle = 'hsla(0, 100%, 36%,1)';	// red

/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
  pressed: {},

  LEFT:   37,
  RIGHT:  39,
  A:      65,
  D:      68,

  isDown: function(keyCode1, keyCode2) {
    return this.pressed[keyCode1] || this.pressed[keyCode2];
  },

  isUp: function(keyCode1, keyCode2) {
    return ! this.isDown(keyCode1, keyCode2);
  },
  
  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};
window.addEventListener('keyup',   function(event) { Key.onKeyup(event); },   false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

/**
 * Vector.
 */
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

/**
 * Rectangle.
 */
function Rectangle(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
};

/**
 * Fill a circle.
 */
function fillCircle(context,x,y,r) {
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI*2, true);
  context.fill();
};

/**
 * Check if rectangles intersect.
 */
function rectanglesIntersect(rectA, rectB) {
  return !(rectA.x + rectA.width < rectB.x ||
           rectB.x + rectB.width < rectA.x ||
           rectA.y + rectA.height < rectB.y ||
           rectB.y + rectB.height < rectA.y);
};

/**
  * Check if rectangle A is inside rectangle B
  */
function rectangleInside( rectA, rectB ) {
  return ( ( rectA.x >= rectB.x ) &&
           ( rectA.x + rectA.width <= rectB.x + rectB.width ) &&
           ( rectA.y >= rectB.y ) &&
           ( rectA.y + rectA.height <= rectB.y + rectB.height ) );
}

/**
 * Check if squares intersect.
 */
function squaresIntersect(x1,y1,halfwidth1,x2,y2,halfwidth2) {
  var rectA = new Rectangle( x1 - halfwidth1, y1 - halfwidth1, 2*halfwidth1, 2*halfwidth1 ),
      rectB = new Rectangle( x2 - halfwidth2, y2 - halfwidth2, 2*halfwidth2, 2*halfwidth2 ),
      overlap = rectanglesIntersect(rectA,rectB);

  return overlap;
};

/**
 * Get new apple position.
 */
function getNewApplePosition(canvas_width,canvas_height,worm_position,worm_radius) {
  var ret_position = getRandomPosition(canvas_width,canvas_height,cApple_Width,cApple_Height,worm_position,worm_radius);
  return ret_position;
};

/**
 * Get a random position.
 */
function getRandomPosition(canvas_width,canvas_height,width,height,position,position_radius) {
  var x_rand = 0,
      y_rand = 0,
      rectA = new Rectangle( 0, 0, width, height ),
      rectB = new Rectangle( 0, 0, 2*position_radius, 2*position_radius ),
      overlap = true,
      ret_position = new Vector(0,0);

  while ( overlap )
  {
    x_rand = Lejo.getRandom(0,canvas_width-width);
    y_rand = Lejo.getRandom(0,canvas_height-height);
    rectA.x = x_rand;
    rectA.y = y_rand;
    overlap = false;
    for ( var i=0; i<position.length; i++) {
      rectB.x = position[i].x-position_radius;
      rectB.y = position[i].y-position_radius;
      if ( rectanglesIntersect( rectA, rectB ) ) {
        overlap = true;
      }
    }
  }
  ret_position.x = x_rand + width/2;
  ret_position.y = y_rand + height/2;
  return ret_position;
};

/**
 * Number of apples eaten.
 */
function writeApplesEaten(eaten) {
  var eaten_elem = document.getElementById('eaten');
  eaten_elem.innerHTML = 'Number of apples eaten: ' + eaten;
};

/**
 * All time high this session.
 */
function writeAllTimeHigh(alltimehigh) {
  var alltimehigh_elem = document.getElementById('alltimehigh');
  alltimehigh_elem.innerHTML = 'All time high this session: ' + alltimehigh;
};

/**
 * Tail length.
 */
function writeTailLength(tl) {
  var tail_elem = document.getElementById('tail');
  tail_elem.innerHTML = 'Tail length: ' + tl;
};

function createsoundbite(sound){
  var html5_audiotypes={ //define list of audio file extensions and their associated audio types. Add to it if your specified audio file isn't on this list:
	  "mp3": "audio/mpeg",
	  "mp4": "audio/mp4",
	  "ogg": "audio/ogg",
	  "wav": "audio/wav"
  },
  html5audio = document.createElement('audio');
  if ( html5audio.canPlayType ) { //check support for HTML5 audio
    for ( var i=0; i<arguments.length; i++) {
      var source_elem = document.createElement('source');
      source_elem.setAttribute('src', arguments[i]);
      if (arguments[i].match(/\.(\w+)$/i)) {
        source_elem.setAttribute('type', html5_audiotypes[RegExp.$1])
      }
      html5audio.appendChild(source_elem);
    }
    html5audio.load();
    html5audio.playclip=function() {
      html5audio.pause();
      html5audio.play();
    }
    return html5audio;
  }
  else {
    return {playclip:function(){throw new Error("Your browser doesn't support HTML5 audio unfortunately")}}
  }
}

/**
 * A Worm as an object.
 */
function Worm(fillstyle, radius, position, velocity) {
  var init_position = position || new Vector(100,100);
  this.fillstyle = fillstyle || cWorm_FillStyle;
  this.radius   = radius    || cWorm_Width/2;
  this.position = [],
  this.velocity = velocity  || new Vector(1,1);
  this.appleseaten = 0;
  this.eatapplesound = createsoundbite('sounds/click.ogg', 'sounds/click.mp3');
  this.intersectsound = createsoundbite('sounds/bounce.ogg', 'sounds/bounce.mp3');
  this.gameoversound = createsoundbite('sounds/siren.ogg', 'sounds/siren.mp3');
  this.directions = [ new Vector(1, 0), new Vector(0, 1), new Vector(-1, 0), new Vector(0, -1)];
  this.direction = 0;
  this.left_right_Key = false;
  this.draw_counter = 0;
  this.checkoffset = cWorm_Length;

  this.initPosition( init_position.x, init_position.y );
}

Worm.prototype.draw = function(context,canvas_width,canvas_height,apple) {
  var eye_size = 2*this.radius/7,
      game_stop = false;

  this.draw_counter++;
  this.draw_counter = this.draw_counter % 10;
  if ( this.draw_counter == 0 ) {
    this.position.push(new Vector( this.position[this.position.length-1].x-this.velocity.x, this.position[this.position.length-1].y));
    writeTailLength(this.Position().length-1);
  }
  context.fillStyle = this.fillstyle;
  for ( var i=this.position.length-1; i > -1; i--) {
    var pos_x = this.position[i].x,
        pos_y = this.position[i].y;
    fillCircle( context, pos_x, pos_y, this.radius );					// head or body
    if ( i == 0 ) {
      context.clearRect( pos_x-2*eye_size, pos_y-eye_size, eye_size, eye_size );	// left eye
      context.clearRect( pos_x+1*eye_size, pos_y-eye_size, eye_size, eye_size );	// right eye
      context.clearRect( pos_x-0.5*eye_size, pos_y, eye_size, eye_size );		// nose
      context.clearRect( pos_x-2*eye_size, pos_y+1.5*eye_size, 4*eye_size, eye_size );	// mouth
    }
  }
  game_stop = this.calcnewposition(canvas_width,canvas_height,apple);
  if ( game_stop ) {
    Game.Stop();
  }
};

// Calculate new position
Worm.prototype.calcnewposition = function(canvas_width,canvas_height,apple) {
  var new_x = this.position[0].x + this.velocity.x * this.directions[this.direction].x,
      new_y = this.position[0].y + this.velocity.y * this.directions[this.direction].y,
      game_stop = false;

  this.position.pop();	// remove last
  this.position.unshift( new Vector( new_x, new_y ) );	// add at beginning

  if ( squaresIntersect(new_x,new_y,this.radius,apple.position.x,apple.position.y,apple.radius) ) {
    // Eat an apple !
    this.eatapplesound.playclip();
    this.appleseaten++;
    apple.position = getNewApplePosition(canvas_width,canvas_height,this.position,this.radius);
    console.log('Eat an apple !');
  }
  else
  if ( ! rectangleInside( new Rectangle( new_x - this.radius, new_y - this.radius, 2*this.radius, 2*this.radius ),
                          new Rectangle( 0, 0, canvas_width, canvas_height ) ) ) {
    // Canvas border hit !
    this.gameoversound.playclip();
    console.log('Canvas border hit !');
    // Stop game
    game_stop = true;
    if ( this.appleseaten > Game.allTimehigh() )
      Game.allTimehigh(this.appleseaten);
    writeAllTimeHigh(Game.allTimehigh());
  }
  else
  if ( this.headintersectstail(new_x, new_y) ) {
    // Head intersects tail
    this.intersectsound.playclip();
    console.log('Head intersects tail !');
    // Stop game
    game_stop = true;
    if ( this.appleseaten > Game.allTimehigh() )
      Game.allTimehigh(this.appleseaten);
    writeAllTimeHigh(Game.allTimehigh());
  }

  return game_stop;
};

// Check if head part of worm intersects with the tail
Worm.prototype.headintersectstail = function(x,y) {
  var head_radius = this.radius,
      head_diameter = 2*head_radius,
      rectHead = new Rectangle( x-head_radius, y-head_radius, head_diameter, head_diameter ),
      rectTail = new Rectangle( 0, 0, head_diameter, head_diameter ),
      intersect = false;
  for ( var i=this.checkoffset; i<this.position.length; i++) {
    rectTail.x = this.position[i].x - head_radius;
    rectTail.y = this.position[i].y - head_radius;
    if ( rectanglesIntersect( rectHead, rectTail ) ) {
      intersect = true;
    }
  }

  return intersect;
}
// Turn left
Worm.prototype.keyLeft = function(canvas_width,canvas_height,apple) {
  this.direction--;
  if ( this.direction == -1 ) {
    this.direction = this.directions.length-1;
  }
  this.calcnewposition(canvas_width,canvas_height,apple);
};

// Turn right
Worm.prototype.keyRight = function(canvas_width,canvas_height,apple) {
  this.direction++;
  if ( this.direction == this.directions.length ) {
    this.direction = 0;
  }
  this.calcnewposition(canvas_width,canvas_height,apple);
};

Worm.prototype.update = function(width,height,apple) {
  if (Key.isDown(Key.LEFT, Key.A)) {
    // Left key or A
    if (!this.left_right_Key) {
      this.keyLeft(width,height,apple);
      this.left_right_Key = true;
    }
  }
  else
  if (Key.isDown(Key.RIGHT, Key.D)) {
    // Right key or B
    if (!this.left_right_Key) {
      this.keyRight(width,height,apple);
      this.left_right_Key = true;
    }
  }
  else {
    if (Key.isUp(Key.LEFT, Key.A) && Key.isUp(Key.RIGHT, Key.D)) {
      // Key up
      this.left_right_Key = false;
    }
  }
};

Worm.prototype.initPosition = function( x, y ) {
  this.position = [new Vector( x, y)];
  for ( var i=1; i<cWorm_Length; i++) {
    this.position.push(new Vector( this.position[i-1].x-this.velocity.x, this.position[i-1].y));
  }
  this.left_right_Key = false;
  this.direction = 0;
  this.draw_counter = 0;
};

Worm.prototype.applesEaten = function(ae) {
  if ( ae == undefined )
    return this.appleseaten;
  else
    this.appleseaten = ae;
};

Worm.prototype.Position = function() {
  return this.position;
};

Worm.prototype.Radius = function() {
  return this.radius;
};

/**
 * A Apple as an object.
 */
function Apple(fillstyle, radius, position) {
  this.fillstyle = fillstyle || cApple_FillStyle;
  this.radius   = radius    || cApple_Radius;
  this.position = position  || new Vector();
}

Apple.prototype.draw = function(context) {

  context.fillStyle = this.fillstyle;
  fillCircle( context, this.position.x, this.position.y, this.radius );	// apple
};

Apple.prototype.update = function(width, height) {
};

/**
 * Worm, the Game
 */
window.Game = (function(){
  var canvas,
      canvas_context,
      worm,
      apple,
      running = false,
      alltimehigh;

  var init = function(canvasName) {
    canvas = document.getElementById(canvasName);
    canvas_context = canvas.getContext('2d');
    canvas_width = canvas.width,
    canvas_height = canvas.height,
    canvas_context.lineWidth = 1;
    canvas_context.strokeStyle = 'hsla(0,0%,100%,1)',
    position_x = canvas_width/2,
    position_y = canvas_height/2,
    velocity_x = 6,
    velocity_y = 6,

    worm = new Worm(cWorm_FillStyle, cWorm_Width/2, new Vector(position_x, position_y), new Vector(velocity_x, velocity_y));

    apple = new Apple(cApple_FillStyle, cApple_Radius, getNewApplePosition(canvas_width,canvas_height,worm.Position(),worm.Radius()));

    alltimehigh = 0;

    writeApplesEaten(worm.applesEaten());
    writeAllTimeHigh(alltimehigh);
    writeTailLength(worm.Position().length-1);

    worm.draw(canvas_context,canvas_width,canvas_height,apple);

    console.log('Init the game');
  };

  var update = function() {
    if ( Running() ) {
      writeApplesEaten(worm.applesEaten());
      worm.update(canvas_width, canvas_height, apple );
      apple.update(canvas_width, canvas_height);
    }
  };

  var initPosition = function() {
    worm.initPosition( canvas.width/2, canvas.height/2);
    apple.position = getNewApplePosition(canvas.width,canvas.height,worm.Position(),worm.Radius());
    apple.draw(canvas_context);
  };

  var render = function() {
    if ( Running() ) {
      canvas_context.clearRect(0,0,canvas_width,canvas_height);
      worm.draw(canvas_context,canvas_width,canvas_height,apple);
      apple.draw(canvas_context);
    }
  };

  var gameLoop = function() {
    requestAnimFrame(gameLoop);
    update();
    render();
  };

  var applesEaten = function(ae) {
    if ( ae == undefined )
      return worm.applesEaten();
    else
      worm.applesEaten(ae);
  };

  var allTimehigh = function(ath) {
    if ( ath == undefined )
      return alltimehigh;
    else
      alltimehigh = ath;
  };

  var Start = function() {
    Running(true);
  };

  var Stop = function() {
    Running(false);
  };

  var Running = function(rn) {
    if ( rn == undefined )
      return running;
    else
      running = rn;
  };

  return {
    'init': init,
    'initPosition': initPosition,
    'gameLoop': gameLoop,
    'applesEaten' : applesEaten,
    'allTimehigh' : allTimehigh,
    'Start' : Start,
    'Stop' : Stop,
    'Running' : Running
  }
})();

// On ready
$(function(){
  'use strict';

  Game.init(cVanvas_Name);
  Game.gameLoop();

  // Callback when starting game
  $("#start").click(function() {
    if ( ! Game.Running() ) {
      Game.initPosition();
      Game.applesEaten(0);
      Game.Start();
    }
  });

  console.log('Ready to play.');  
});
