//UI Functions

//unzooms all objects, resets scores to 0
function reset() {
	if (zoomedIndex > -1) floaterList[zoomedIndex].zoom();
	score = 0; 
}

//returns the current score
function getScore() {
	return score;
}

//freezes the scene
function pause() {

}

//unfreezes the scene
function unpause() {

}

//set a value at which the scene will reset, returns current score.
function setMaxScore() {
	
}