//UI Functions

//unzooms all objects, resets scores to 0
function reset() {
	pause = false;
	if (zoomedIndex > -1) {
		floaterList[zoomedIndex].zoom();
		start = false;
		zoomed = false;
		zoomedIndex = -1;
	}
	score = 0; 
}

//returns the current score
function getScore() {
	return score;
}

//freezes the scene
function pause() {
	paused = true;
}

//unfreezes the scene
function unpause() {
	paused = false;
}

//set a value at which the scene will reset, returns current score.
function setMaxScore(max) {
	maxScore = max;
}