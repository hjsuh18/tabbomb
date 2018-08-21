// script to update the UI interactively
// Also talks to background process to close tabs after time

// initialize timer to saved values when loading popup
initialize();

// initialization when popup is opened
function initialize(){
	chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
		tabId = tabs[0].id;
		chrome.storage.sync.get("timerRunning", function(items){
			var map = items["timerRunning"];
			// tab has not been initialized
			if (!(tabId in map)){
				set_timerRunning(tabId, false, function(){
					default_timer();
				});
			}
			// tab has been initialized
			else {
				// timer is not running
				check_timer_running(false, tabId, default_timer);

				// timer is running, display appropriate time
				check_timer_running(true, tabId, function(){
					chrome.storage.sync.get("bombTimer", function(items){
						bombTimeArray = items["bombTimer"][tabId];
						show_countdown(bombTimeArray, tabId);
					});
				});
			}
		});
	});
}

function default_timer(){
	chrome.storage.sync.get("time", function(items){
		var time = items["time"];
		set_timer(time["hour"], time["minute"], time["second"]);
	});
}

function set_timer(hour, minute, second){
	$("#hour").empty();
	$("#hour").append(hour)
	$("#minute").empty();
	$("#minute").append(minute);
	$("#second").empty();
	$("#second").append(second);
}

// set timerRunning variable in storage to true if timer running, false if not
function set_timerRunning(tabId, isRunning, callback){
	chrome.storage.sync.get("timerRunning", function(items){
		var map = items["timerRunning"];
		map[tabId] = isRunning;
		chrome.storage.sync.set({"timerRunning": map}, function(){
			callback();
		});
	});
}

// checkRunning true when you want callback function to be executed if timer IS running
// false -> callback function executed if timer IS NOT running
function check_timer_running(checkRunning, tabId, callback){

	// asynchronous function to check if current tab's timer is running
	chrome.storage.sync.get("timerRunning", function(items){
		var map = items["timerRunning"];
		if (checkRunning == map[tabId])
			callback();
	});
}

// convert Date object to array storing each field
function date_to_array(date){
	a = [date.getFullYear(), date.getMonth(), date.getDate(),
	date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	return a;
}

// convert array to Date object
function array_to_date(date){
	var d = new Date(date[0], date[1], date[2], date[3], date[4], date[5], date[6]);
	return d;
}

// when user presses Start Countdown button the time for when
// the tab should be closed is stored
function start_countdown(time, tabId){
	bombTime = new Date();
	bombTime.setTime(bombTime.getTime() + time);

	bombTimeArray = date_to_array(bombTime);

	// store time when bomb goes off
	chrome.storage.sync.get("bombTimer", function(items){
		var timer = items["bombTimer"];
		timer[tabId] = bombTimeArray;
		chrome.storage.sync.set({"bombTimer": timer}, function(){
			console.log("Timer for tab has been successfully stored");
		})
	});

	show_countdown(bombTimeArray, tabId);
}

// SHOULD PROBABLY ADD LINE FOR NOT GOING BELOW 00:00:00

// function that calculates and constantly updates time counter
function show_countdown(bombTimeArray, tabId){
	// if stored state of whether timer is running is true, continue counting down
	// if not, this function simply returns
	check_timer_running(true, tabId, function(){
		now = new Date();
		bombTime = array_to_date(bombTimeArray);

		// calculate remaining time
		var remTime = bombTime.getTime() - now.getTime();
		var s = Math.floor(remTime / 1000);
		var m = Math.floor(s / 60);
		var h = Math.floor(m / 60);

		// format remaining time for timer display
		s = s % 60;
		m = m % 60;

		set_timer(format_time(h), format_time(m), format_time(s));

		// after 1000 milliseconds, call the countdown function
		// this creates an infinite loop, updating the time left every second
		setTimeout(function(){
			show_countdown(bombTimeArray, tabId);
		}, 1000);
	});
}

function format_time(time){
	var s = time.toString();
	if (time < 10){
		s = "0" + s;
	}
	return s;
}


// calculate total number of milliseconds in hour, minute, second
function convert_to_milliseconds(hour, minute, second){
	return (hour * 3600 + minute * 60 + second) * 1000;
}


$(function(){
	$('#startTimer').click(function(){
		// get current tab id and remove it after a certain amount of time
		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
			tabId = tabs[0].id;
			// if timer is not already running
			check_timer_running(false, tabId, function(){
				set_timerRunning(tabId, true, function(){
					chrome.storage.sync.get("time", function(items){
						var time = items["time"];
						time  = convert_to_milliseconds(parseInt(time["hour"]), parseInt(time["minute"]), parseInt(time["second"]));
						chrome.runtime.sendMessage({"tabId": tabId, "message": "closeTab", "time": time});

						// START TIMER
						start_countdown(time, tabId);
					});
				});
			});
		});
	});
	$('#resetTimer').click(function(){
		// reset tab's timer
		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
			tabId = tabs[0].id;

			// if timer is running
			check_timer_running(true, tabId, function(){
				chrome.runtime.sendMessage({"tabId": tabId, "message": "resetTab"});

				set_timerRunning(tabId, false, default_timer);
			});
		});
	});

	$('#timerDefault').submit(function(e){
		var hour = $("#hourSelect").val();
		var minute = $("#minuteSelect").val();
		var second = $("#secondSelect").val();

		chrome.storage.sync.get("time", function(items){
			var time = items["time"];
			if (hour != null)
				time["hour"] = hour;
			if (minute != null)
				time["minute"] = minute;
			if (second != null)
				time["second"] = second;
			chrome.storage.sync.set({"time": time}, function(){
				console.log("Time has successfully been updated");
				// if timer is not running, update timer display
				chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
					tabId = tabs[0].id;
					check_timer_running(false, tabId, default_timer);
				});
			});
		});
		e.preventDefault();
	});
});

// print object to visualize for debugging purposes
function print_map(map){
	console.log("Key-Value pairs of map");
	for (key in map){
		console.log("key: " + key + " value: " + map[key]);
	}
}