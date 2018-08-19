function initialize_timer(){
	chrome.storage.sync.get("time", function(items){
		var time = items["time"];
		$('#hour').empty();
		$("#hour").append(time["hour"]);
		$('#minute').empty();
		$("#minute").append(time["minute"]);
		$('#second').empty();
		$("#second").append(time["second"]);
	});
}

// initialize timer to saved values when loading popup
initialize_timer();

$(function(){
	$('#startTimer').click(function(){
		// get current tab id and remove it after a certain amount of time
		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
			tabId = tabs[0].id;
			chrome.storage.sync.get("time", function(items){
				var time = items["time"];
				time  = convert_to_milliseconds(parseInt(time["hour"]), parseInt(time["minute"]), parseInt(time["second"]));
				console.log(time);
				chrome.runtime.sendMessage({"tabId": tabId, "message": "closeTab", "time": time})
			});
		});

		// Start the timer for tab
	});
	$('#resetTimer').click(function(){
		// reset the timer for tab
		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
			tabId = tabs[0].id;
			chrome.runtime.sendMessage({"tabId": tabId, "message": "resetTab"})
		});
		initialize_timer();
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
			})
		});

		// if timer is not running, update
		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
			tabId = tabs[0].id;
			chrome.storage.sync.get("bombs", function(items){
				var map = items["bombs"];
				if (!(tabId in map)){
					initialize_timer();
				}
			});
		});

		e.preventDefault();
	});
});

// function that calculates and constantly updates time counter
function countdown(){
	var now = new Date();

	console.log(now);
	// get time when tab needs to be closed from storage

	// calculate the time left given two pieces of information

	// display the time remaining

	// after 1000 milliseconds, call the countdown function
	// this creates an infinite loop, updating the time left every second
	setInterval(countdown, 1000);
}


// when user presses Start Countdown button the time for when
// the tab should be closed is stored
function start_countdown(){
	var now = new Date();

}

// calculate total number of milliseconds in hour, minute, second
function convert_to_milliseconds(hour, minute, second){
	return (hour * 3600 + minute * 60 + second) * 1000;
}