//Framerate
const framerate = 60;
var paused = false;
var maxScore = Infinity;

//Zooming vars
var start = false;
var zoomed = false;
var zoomedIndex = -1;
var canClick = true;
var zoomTime = 2;

//player score
var score = 0;

//The list of floaters being animated
var floaterList = [];

//Bubble vars
const defaultDiameter = 50;
const defaultSize = 14;

//Returns boolean indicating if the point specified is inside a circle
function mouseHitCircle(mousex, mousey, centerx, centery, diameter) {
	return (diameter/2) > Math.sqrt((centerx - mousex)*(centerx - mousex) + (centery - mousey)*(centery - mousey));
}

//Bubble object
function Bubble(x, y) {
	this.x = x;
	this.y = y
	this.xSpeed = 10*Math.random();
	if (Math.random() < .5) {
		this.xSpeed = this.xSpeed * -2;
	}
	this.ySpeed = 10*Math.random();
	if (Math.random() < .5) {
		this.ySpeed = this.ySpeed * -1;
	}
	this.xAccel = 5*Math.random();
	if (Math.random() < .5) {
		this.xAccel = this.xAccel * -1;
	}
	this.yAccel = 5*Math.random();
	if (Math.random() < .5) {
		this.yAccel = this.yAccel * -1;
	}
	if (width > height) {
		this.maxRadius = height * .25;
	} else {
		this.maxRadius = width * .25;
	}
	//State enumeration
	this.standard = 0;
	this.zooming = 1;
	this.zoomed = 2;
	this.unzoom = 3;
	//zooming vars
	this.state = this.standard;
	this.oX = -1;
	this.oY = -1;
	this.progress = -1;
	this.diameter = defaultDiameter;
	//Methods

	//Called every frame to update instance vars of position, speed and acceleration
	this.update = function() {
		if (this.state == this.standard) {
			//Every frame, move and update speed
			this.x = (this.xSpeed / 10.0) + this.x;
			this.y = (this.ySpeed / 10.0) + this.y;
			this.xSpeed = this.xAccel + this.xSpeed;
			this.ySpeed = this.yAccel + this.ySpeed;
			//6 times every second, update Accel
			if (frameCount % framerate % 10 == 0) {
				if (Math.sqrt(this.xSpeed*this.xSpeed + this.ySpeed*this.ySpeed) < 50.0) {
					this.yAccel = Math.random();
					if (Math.random() < .5) {
						this.yAccel = this.yAccel*-1;
					}
					this.xAccel = Math.random();
					if (Math.random() < .5) {
						this.xAccel = this.xAccel*-1;
					}
				//Emergency breaks
				} else {
					if (this.xSpeed > 0) {
						this.xSpeed = this.xSpeed - 1;
					} else {
						this.xSpeed = this.xSpeed + 1;
					}
					if (this.ySpeed > 0) {
						this.ySpeed = this.ySpeed - 1;
					} else {
						this.ySpeed = this.ySpeed + 1;
					}
				}
			}
			//Bounce off walls
			if (this.x < (this.diameter / 2)) this.xSpeed = this.xSpeed * -1;
			else if (this.x > (width - this.diameter / 2)) this.xSpeed = this.xSpeed * -1;
			if (this.y < (this.diameter / 2)) this.ySpeed = this.ySpeed * -1;
			else if (this.y > (height - this.diameter / 2)) this.ySpeed = this.ySpeed * -1;
		//Zooming
		} else if (this.state == this.zooming) {
			this.progress++;
			this.diameter = defaultDiameter + (this.maxRadius*2*(this.progress/(framerate*zoomTime)));
			this.x = this.oX + ((width/2)-this.oX)*2*(this.progress/(framerate*zoomTime));
			this.y = this.oY + ((height/2)-this.oY)*2*(this.progress/(framerate*zoomTime));
			if (this.progress == (framerate*zoomTime/2)) {
				this.state = this.zoomed;
				zoomed = true;
			}
		//Unzooming
		} else if (this.state == this.unzoom) {
			this.progress--;
			this.diameter = defaultDiameter + (this.maxRadius*2*(this.progress/(framerate*zoomTime)));
			this.x = this.oX + ((width/2)-this.oX)*2*(this.progress/(framerate*zoomTime));
			this.y = this.oY + ((height/2)-this.oY)*2*(this.progress/(framerate*zoomTime));
			if (this.progress == 0) {
				this.state = this.standard;
				this.progress = -1;
			}
		}
	}

	//Calls update and then draws shape
	this.draw = function() {
		this.update();
		if (this.state == this.standard || this.state == this.unzoom) fill(150);
		else fill(50);
		ellipse(this.x,this.y,this.diameter,this.diameter);
	}

	//Determines if a given set of coordinates hits this shape
	this.mouseHit = function(mousex, mousey) {
		return mouseHitCircle(mousex, mousey, this.x, this.y, this.diameter);
	}

	//Begins to zoom or changes the direction of zoom.
	this.zoom = function() { 
		if (this.state == this.standard) {
			this.progress = 0;
			this.state = this.zooming;
			this.oX = this.x;
			this.oY = this.y;
			return true;
		} else if (this.state == this.zoomed) {
			this.state = this.unzoom;
			zoomed = false;
			return true;
		} else if (this.state == this.zooming) {
			this.state = this.unzoom;
			return true;
		} else {
			return false;
		}
	}
}

//Click detection
function detectClick() {
	if (mouseIsPressed && (mouseButton == LEFT) && canClick) {
		canClick = false;
		//For each shape
		for (var i = 0; i < floaterList.length; i++) {
			var current = floaterList[i];
			//If the click is registered
			if (i == zoomedIndex);
			else if (current.mouseHit(mouseX, mouseY)) {
				//If no shape is zoomed or if unzooming
				if (!start) {
					start = true;
					zoomedIndex = i;
					current.zoom();
					break;
				} else {
					if (current.zoom()) {
						floaterList[zoomedIndex].zoom()
						zoomedIndex = i;
					}
					break;
				}
			}
		}
	} else if (!mouseIsPressed || !(mouseButton == LEFT)) {
		canClick = true;
	}
}

//Calls each bubble's draw method
function drawFloatsAndUpdate() {
	if (zoomedIndex != -1) floaterList[zoomedIndex].draw();
	for (var i = 0; i < floaterList.length; i++) {
		if (!start || i != zoomedIndex) {
			var current = floaterList[i];
			current.draw();
		}
	}
}

//Adds a bubble to the scene
function addBubble(x, y) {
	floaterList.push(new Bubble(x, y));
}

function drawScore() {
	fill(204,153,0);
	textAlign(CENTER);
	textSize(40);
	text(score, width/2 - 44, 50, 100, 100);
}

function drawTarget() {
	var sizeDifference;
	if (width > height) {
		sizeDifference = height * .25;
	} else {
		sizedifference = width * .25;
	}
	var innerR = defaultDiameter + sizeDifference;
	fill(204,153,0);
	ellipse(width/2,height/2,innerR*1.5,innerR*1.5);
	fill(0,138,184);
	ellipse(width/2,height/2,innerR, innerR);
	drawScore();
}

//Called when the page is loaded. Sets up the scene and starts looping the draw loop
function setup() {
  //createCanvas(windowWidth/2, windowHeight);
  createCanvas(500, 500);
  frameRate(framerate);
  addBubble(width/2, height/2);
  addBubble(width/4, height/4);
  addBubble(3*width/4, height/4);
  addBubble(3*width/4, 3*height/4);
  addBubble(width/4, 3*height/4);
  loop();
}

//Loops every frame
function draw() {
	if (!paused) {
		if (score >= maxScore) {
			score = 0;
			reset();
		} else {
			detectClick();
			background (0, 138, 184);
			noStroke();
			drawTarget();
			stroke(50);
			drawFloatsAndUpdate();
			if (zoomed) score++;
		}
	}
}