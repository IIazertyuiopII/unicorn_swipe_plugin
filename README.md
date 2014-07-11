unicorn_swipe_plugin
====================

<h3> Why this plugin: </h3>

Just like desktop apps have keyboard shortcuts, I believe mobile apps should have ways for advanced users to access all the functionalities quickly. This plugin is an attempt at adressing this by recognizing touch input gestures.

<h3> What it does exactly: </h3>

* When the user starts touching the screen and moving his finger (or mouse on desktop), the code tries to identify his move as one of the eight cardinal directions (North, South, West, East, NorthWest, SouthWest, SouthEast, NorthEast). If he changes direction, then the next direction he takes is added to the route until he lifts his finger away from the screen. 
* In case of multi-touch events, the plugin is disabled to not interfere with other functionalities. </li></ul>

<h3> How to use it: </h3>

* jQuery users : <br>


	      $(document).on('unicorn', function(event){ 
	      var route = event.originalEvent.route;
	      //enter your code here
	      });



* Vanilla javascript : <br>


	      addEventListener('unicorn', function (event) { 
	      var route = event.route;
	      //enter code here
	      });



The route property of the event is passed an array in the following format : [firstDirection,secondDirection,...]. For exemple, it could look like : [N,W,E,SW].

* Note : I guess the route could be processed during the move event instead of waiting for the end to gain some performance, but I have never found the processing to take more than 5ms, there is no real need for that..* 
