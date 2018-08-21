// Initialization when extension is installed
chrome.runtime.onInstalled.addListener(function() {
	// state of extension: bomb either running or not running
	chrome.storage.sync.set({"timerRunning": {}});

	// bombs is an object storing tabId and tiemoutId of bomb activated tabs
	chrome.storage.sync.set({"bombs": {}});

	// bombTimer is an object storing tabId and date of when bomb goes off
	chrome.storage.sync.set({"bombTimer": {}});

	// store the default start time for time bomb
	chrome.storage.sync.set({"time": {"hour": "01", "minute": "00", "second":"00"}});
});


// receive message from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	var message = request.message;
	var tabId = request.tabId;
	var timeoutId = request.timeoutId;
	var time = request.time;

	// set a time to close the tab
	if (message === "closeTab"){
		console.log("Close tab");

		timeoutId = setTimeout(function(){
			// close the tab when countdown is done
			chrome.tabs.remove(tabId);
			close_tab_clean_storage(tabId);
		}, time);

		// get activated bombs object from storage
		chrome.storage.sync.get("bombs", function(items){
			var map = items["bombs"];

			// add new pair for new TabBomb tab and update stored variable
			map[tabId] = timeoutId;
			update_bombs(map);
			console.log("tab has been added to bombs");
		});
	}
	// clear the timer set for closing a tab
	else if (request.message === "resetTab"){
		console.log("Reset Tab")

		// use tabid to find timeoutid
		chrome.storage.sync.get("bombs", function(items){
			var map = items["bombs"];

			// deactivate bomb on tab
			timeoutId = map[tabId];
			clearTimeout(timeoutId);

			// remove tab from bombs, since bomb has been reset
			delete map[tabId];
			update_bombs(map);
		});
	}
});

// when tab is closed by user, need to clean up storage
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	console.log("clean storage is called");
	close_tab_clean_storage(tabId);
});

// keyboard shortcut for opening new tab and setting TabBomb on it
chrome.commands.onCommand.addListener(function(command){
	console.log('Command: ', command);
	chrome.tabs.create({}, function(tab){
		console.log("created tab ", tab.id);
		var tabId = tab.id

		// set timerRunning of tab to true
		chrome.storage.sync.get("timerRunning", function(items){
			var map = items["timerRunning"];
			map[tabId] = true;
			chrome.storage.sync.set({"timerRunning": map}, function(){
				console.log("timerRunning set to true");
			});
		});

		// get the default time
		chrome.storage.sync.get("time", function(items){
			var time = items["time"];
			var timeMilliseconds = (parseInt(time["hour"]) * 3600 + parseInt(time["minute"]) * 60 + parseInt(time["second"])) * 1000;
			
			// set the time when bomb goes off in storage
			bombTime = new Date();
			bombTime.setTime(bombTime.getTime() + timeMilliseconds);
			bombTimeArray = date_to_array(bombTime);
			console.log(bombTimeArray);
			chrome.storage.sync.get("bombTimer", function(items){
				var timer = items["bombTimer"];
				timer[tabId] = bombTimeArray;
				chrome.storage.sync.set({"bombTimer": timer}, function(){
					console.log("Timer for tab has been successfully stored");
				})
			});

			// setTimeout for the bomb created
			timeoutId = setTimeout(function(){
				chrome.tabs.remove(tabId);
				close_tab_clean_storage(tabId);
			}, timeMilliseconds);

			// set tabId - timeoutId pair
			chrome.storage.sync.get("bombs", function(items){
				var map = items["bombs"];

				map[tabId] = timeoutId;
				update_bombs(map);
				console.log("tab has been added to bombs");
			});
		});
	});
});

// convert Date object to array storing each field
function date_to_array(date){
	a = [date.getFullYear(), date.getMonth(), date.getDate(),
	date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	return a;
}

// calculate total number of milliseconds in hour, minute, second
function convert_to_milliseconds(hour, minute, second){
	return (hour * 3600 + minute * 60 + second) * 1000;
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

// clean up storage when tab is closed
function close_tab_clean_storage(tabId){
	// remove tab from bombs, since bomb closed tab
	chrome.storage.sync.get("bombs", function(items){
		var map = items["bombs"];
		delete map[tabId];
		update_bombs(map);
	});

	// remove tab from timerRunning, since bomb closed tab
	chrome.storage.sync.get("timerRunning", function(items){
		var map = items["timerRunning"];
		delete map[tabId];
		chrome.storage.sync.set({"timerRunning": map}, function(){
			console.log("timerRunning successfully updated");
			print_map(map);
		});
	});
}

// print object to visualize for debugging purposes
function print_map(map){
	console.log("Key-Value pairs of map");
	for (key in map){
		console.log("key: " + key + " value: " + map[key]);
	}
}

function update_bombs(bombs){
	chrome.storage.sync.set({"bombs": bombs}, function(){
		console.log("Bombs successfully updated");
		print_map(bombs);
	});
}