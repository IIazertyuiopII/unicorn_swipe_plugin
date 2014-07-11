unicorn_swipe_plugin
====================

<h3> Why this plugin: </h3>

Just like desktop apps have keyboard shortcuts, I believe mobile apps should have ways for advanced users to access all the functionalities quickly. This plugin is an attempt at adressing this by recognizing touch input gestures.

<h3> What it does exactly: </h3>

<ul><li> When the user starts touching the screen and moving his finger (or mouse on desktop), the code tries to identify his move as one of the eight cardinal directions (North, South, West, East, NorthWest, SouthWest, SouthEast, NorthEast). If he changes direction, then the next direction he takes is added to the route until he lifts his finger away from the screen. </li>
<li> In case of multi-touch events, the plugin is disabled to not interfere with other functionalities. </li></ul>

<h3> How to use it: </h3>
<ul>
<li> jQuery users : 

$(document).on('unicorn', function(event){ 
var route = event.originalEvemt.route;
//enter code here
});</li>

<li> Vanilla javascript : 

addEventListener('unicorn', function (event) { 
var route = event.route;
//enter code here
});
</li>
<li>The route property which is passed is an array in the following format : [firstDirection,secondDirection,...], so it could look like [N,W,E,SW].</li>
</ul>
