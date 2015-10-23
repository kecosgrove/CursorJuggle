//Framerate
const framerate = 60;

//Shape enumeration
const bubble = 0;
const bubblelist = 1;

//Zooming vars
var zoomed = false;
var zoomedIndex = -1;
var canClick = true;

//The list of floaters being animated
var floaterList = [];

//Bubble vars
const defaultDiameter = 50;
const defaultSize = 14;

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
		} else if (this.state == this.zooming) {
			this.progress++;
			this.diameter = defaultDiameter + (this.maxRadius*2*(this.progress/framerate));
			this.x = this.oX + ((width/2)-this.oX)*2*(this.progress/framerate);
			this.y = this.oY + ((height/2)-this.oY)*2*(this.progress/framerate);
			if (this.progress == framerate/2) this.state = this.zoomed;
		} else if (this.state == this.unzoom) {
			this.progress--;
			this.diameter = defaultDiameter + (this.maxRadius*2*(this.progress/framerate));
			this.x = this.oX + ((width/2)-this.oX)*2*(this.progress/framerate);
			this.y = this.oY + ((height/2)-this.oY)*2*(this.progress/framerate);
			if (this.progress == 0) {
				this.state = this.standard;
				this.progress = -1;
			}
		}
	}
	this.draw = function() {
		this.update();
		fill(150,150,150);
		ellipse(this.x,this.y,this.diameter,this.diameter);
	}
	this.shape = function() {
		return bubble;
	}
	this.mouseHit = function(mousex, mousey) {
		return mouseHitCircle(mousex, mousey, this.x, this.y, this.diameter);
	}
	this.zoom = function() { 
		if (this.state == this.standard) {
			this.progress = 0;
			this.state = this.zooming;
			this.oX = this.x;
			this.oY = this.y;
			return true;
		} else if (this.state == this.zoomed) {
			this.progress = framerate/2;
			this.state = this.unzoom;
			return true;
		} else if (this.state == this.zooming) {
			this.state = this.unzoom;
			return true;
		} else {
			//do nothing?
			//this.state = this.zooming;
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
				if (!zoomed) {
					zoomed = true;
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

function drawFloatsAndUpdate() {
	if (zoomedIndex != -1) floaterList[zoomedIndex].draw();
	for (var i = 0; i < floaterList.length; i++) {
		if (!zoomed || i != zoomedIndex) {
			var current = floaterList[i];
			current.draw();
		}
	}
}

function addBubble(data, x, y) {
	floaterList.push(new Bubble(data, x, y));
}

function setup() {
  createCanvas(windowWidth/2, windowHeight);
  frameRate(framerate);
  addBubble(width/2, height/2);
  addBubble(width/4, height/4);
  addBubble(3*width/4, height/4);
  addBubble(3*width/4, 3*height/4);
  addBubble(width/4, 3*height/4);
  loop();
}

function draw() {
	detectClick();
	background (0, 138, 184);
	noStroke();
	fill(204,153,0);
	ellipse(width/2,height/2,350,350)
	fill(0,138,184);
	ellipse(width/2,height/2,250,250);
	stroke(51);
	drawFloatsAndUpdate();
}