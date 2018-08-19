// Initialization when extension is installed
chrome.runtime.onInstalled.addListener(function() {
	// bombs is an object storing tabId and tiemoutId of bomb activated tabs
	chrome.storage.sync.set({"bombs": {}});

	// store the default start time for time bomb
	chrome.storage.sync.set({"time": {"hour": "01", "minute": "00", "second":"00"}});
});


// receive message from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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

			// remove tab from bombs, since bomb closed tab
			chrome.storage.sync.get("bombs", function(items){
				var map = items["bombs"];
				delete map[tabId];
				update_bombs(map);
			});
		}, time);

		// get activated bombs object from storage
		chrome.storage.sync.get("bombs", function(items){
			var map = items["bombs"];

			// add new pair for new TabBomb tab and update stored variable
			map[tabId] = timeoutId;
			update_bombs(map);
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