$(function(){
	$(#start_timer).click(function(){
		console.log("Start timer button has been clicked");
	});
	$(#stop_timer).click(function(){
		console.log("Stop time button has been clicked");
	});
});

// function that calculates and constantly updates time counter
function countdown(){
	var now = new Date();

	// get time when tab needs to be closed from storage

	// calculate the time left given two pieces of information

	// display the time remaining

	// after 1000 milliseconds, call the countdown function
	// this creates an infinite loop, updating the time left every second
	setTimeout(countdown, 1000)
}


// when user presses Start Countdown button the time for when
// the tab should be closed is stored
function start_countdown(){
	var now = new Date();

}