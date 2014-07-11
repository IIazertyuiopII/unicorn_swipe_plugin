/*jshint -W032 */
/*jshint -W004 */
// jquerymobile-unicorn_swipe
// ----------------------------------
// Copyright (c)2012 Donnovan Lewis
// Copyright (c)2014 Romain Le Bail
// Distributed under MIT license (http://opensource.org/licenses/MIT)
//
//credits to Donnovan Lewis for the material taken from https://github.com/blackdynamo/jquerymobile-swipeupdown
(function (global, document) {
    'use strict';

    // initializes touch events
    var supportTouch = "ontouchstart" in global,
        touchStartEvent = supportTouch ? "touchstart" : "mousedown",
        touchMoveEvent = supportTouch ? "touchmove" : "mousemove",
        touchEndEvent = supportTouch ? "touchend" : "mouseup";

    var path;  //array of coordinates of the points where the touchMoveEvent was fired 
    var derived_path; 
    var segs; 
    var seg_xhalf; 
    var max_freqs;
    var start;
    var stop;
    var n;
    function getPosition(event) {
        return [event.pageX, event.pageY];
    }

    function dispatch(eventProperties) {
        // Create the event.
        var event = document.createEvent("Event");

        event.initEvent("unicorn", true, true);
        for (var p in eventProperties) { // useful in case we want to pass more than the route (future versions maybe?)
            if (eventProperties.hasOwnProperty(p)) {
                event[p] = eventProperties[p];
            }
        }
        start.origin.dispatchEvent(event);
    }

    function handleTouchStart(event) { //init the Arrays, record starting position and time
        var position = getPosition(event);

        path = [];
        derived_path = [];
        segs = [];
        seg_xhalf = [];
        max_freqs = [];
        start = {
            time: +new Date(),
            origin: event.target
        };
        n = 0;
        path[n] = position;
    }

    function handleTouchMove(event) {

        var position = event.touches ? getPosition(event.touches[0]) : getPosition(event);

        if (!start) {
            return;
        }
        stop = {
            time: +new Date()
        };

        if (event.touches && event.touches.length > 1) { //if multitouch event abort everything
        	removeEventListener(touchMoveEvent, handleTouchMove);
        	start = stop = false;
        }

        n++;
        path[n] = position;
    }

    function handleTouchEnd(event) {
    	
        var l = path.length;
        var min_length = 8; // min length is to have enough points to perform consistent recognition
        var fire = false;
        if(!stop && !start){addEventListener(touchMoveEvent, handleTouchMove);}
        if (l > min_length && stop && start && stop.time - start.time < 10000) { // otherwise do nothing 

            /*########## STEP 1 : Compute and smoothen the derived path ##########*/
        	
            for (var i = 1; i < l - 1; ++i) {
                var d_i = (path[i + 1][1] - path[i - 1][1]) / (path[i + 1][0] - path[i - 1][0]);
                var x_sig_i = path[i + 1][0] - path[i - 1][0] < 0 ? -1 : 1;
                derived_path[i - 1] = d_i == Infinity ? 1000 : d_i == -Infinity ? -1000 : d_i > 3 ? 1000 * x_sig_i : d_i < -3 ? -1000 * x_sig_i // vertical moves 
                    : Math.abs(d_i) < 0.5 ? 0 : d_i; // horizontal moves 
            };

            /*########## STEP 2 : Create sub-paths(segments) and classify them in one of the two x halves ##########*/

            for (var i = 0; i <= l - min_length; ++i) {
                segs[i] = derived_path.slice(i, i + min_length - 2); /* create sub-paths of min_length-2 points */ 
                seg_xhalf[i] = [0]; 
                
                if (path[i + min_length-2][0] > path[i+1][0]) {
                    seg_xhalf[i] = 1; 
                };
                if (path[i + min_length-2][0] < path[i+1][0]) {
                    seg_xhalf[i] = -1; 
                };
            }

            /*########## STEP 3 : Find the most frequent direction in every segment ##########*/

            var diff = function (a, b) {
                return a - b;
            };
            for (var i = 0; i <= l - min_length; ++i) {
                segs[i].sort(diff); // sorting to count duplicates more easily 
                var previous = segs[i][0];
                var popular = segs[i][0];
                var count = 1;
                var max_count = 1;

                for (var j = 1; j < 8; j++) {
                    if (segs[i][j] == previous) { // if current = previous then increment occurrence count 
                        count++;
                    } else {
                        if (count > max_count) { // if occurrence count exceeds previous max save it 
                            popular = segs[i][j - 1];
                            max_count = count;
                        };
                        previous = segs[i][j];
                        count = 1;
                    };
                    var pop = count > max_count ? segs[i][min_length - 3] : popular; // handle case where the last element is the most frequent 
                    var cnt = count > max_count ? count : max_count;
                    max_freqs[i] = [pop, cnt]; // max_freqs contains the popular segment direction and its number of occurrences 
                }
            }

            /*########## STEP 4 : Eliminate segments with unclear overall direction ##########*/

            var min_number_of_max = 5; // only segments where the most frequent value is present this many times or more are kept 
            for (var i = max_freqs.length - 1; i >= 0; i--) { // to ensure the segment has a clearly defined direction 
                if (max_freqs[i][1] <= min_number_of_max) {
                    max_freqs.splice(i, 1);
                    seg_xhalf.splice(i, 1);
                };
            }

            /*########## STEP 5 : Eliminate consecutive segments with same direction ##########*/

            var previous = max_freqs[max_freqs.length - 1];
            var previous_type = seg_xhalf[max_freqs.length - 1];
            for (var i = max_freqs.length - 2; i >= 0; i--) { 
            	if (previous[0] === max_freqs[i][0]) { // same direction 
                    if (Math.abs(max_freqs[i][0]) > 500 /* same vertical */ 
                    		|| (max_freqs[i][0] === 0 && previous_type === seg_xhalf[i])) { // same horizontal 
                        if (previous[1] > max_freqs[i][1]) { // keep the duplicate with the greater max 
                            max_freqs.splice(i, 1);
                            seg_xhalf.splice(i, 1);
                        } else {
                            max_freqs.splice(i + 1, 1);
                            seg_xhalf.splice(i + 1, 1);
                        };
                    }
                }
                previous = max_freqs[i];
                previous_type = seg_xhalf[i];
            }

            /*########## STEP 6 : Parse the route and trigger the event ##########*/

            var route = [];
            for (var i = 0; i < max_freqs.length; ++i) {
                var p_i = max_freqs[i][0];
                var t_x_i = seg_xhalf[i];
                route[i] = p_i == -1000 ? "N" : p_i == 1000 ? "S" :  
                		(t_x_i > 0 ? "E" : "W");
            }
            if (i !== 0) { 
                fire = true;
            };
        }
        if (fire) { 
            dispatch({
                route: route
            });
        }
        start = stop = false;

    }

    addEventListener(touchStartEvent, handleTouchStart);
    addEventListener(touchMoveEvent, handleTouchMove);
    addEventListener(touchEndEvent, handleTouchEnd);

})(this, document);
