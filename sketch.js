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
function Bubble(data, x, y) {
	this.data = data;
	this.x = x;
	this.y = y
	this.xSpeed = 2*Math.random();
	if (Math.random() < .5) {
		this.xSpeed = this.xSpeed * -2;
	}
	this.ySpeed = 2*Math.random();
	if (Math.random() < .5) {
		this.ySpeed = this.ySpeed * -1;
	}
	this.xAccel = Math.random();
	if (Math.random() < .5) {
		this.xAccel = this.xAccel * -1;
	}
	this.yAccel = Math.random();
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
			this.x = (this.xSpeed / 10.0) + this.x;
			this.y = (this.ySpeed / 10.0) + this.y;
			if (frameCount % framerate == 0) {
				if (Math.sqrt(this.xSpeed*this.xSpeed + this.ySpeed*this.ySpeed) < 4.0) {
					this.yAccel = Math.random();
					if (Math.random() < .5) {
						this.yAccel = this.yAccel*-1;
					}
					this.xAccel = Math.random();
					if (Math.random() < .5) {
						this.xAccel = this.xAccel*-1;
					}
				} else {
					if (this.xSpeed > 0) {
						this.xSpeed = this.xSpeed - .1;
					} else {
						this.xSpeed = this.xSpeed + .1;
					}
					if (this.ySpeed > 0) {
						this.ySpeed = this.ySpeed - .1;
					} else {
						this.ySpeed = this.ySpeed + .1;
					}
				}
			}
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
		//ToDo, text
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
		} else if (this.state == this.zoomed) {
			this.progress = framerate/2;
			this.state = this.unzoom;
		} else if (this.state == this.zooming) {
			this.state = this.unzoom;
		} else {
			this.state = this.zooming;
		}
	}
}


//BubbleList Object
function BubbleList(data, x, y) {
	for (var i = 1; i < x.length; i++) {
		if ((x[i-1]-x[i])*(x[i-1]-x[i]) + (y[i-1]-y[i])*(y[i-1]-y[i]) < (defaultDiameter+defaultDiameter)*(defaultDiameter+defaultDiameter)) {
			throw "invalid input";
			break;
		}
	}
	this.dataArray = data;
	this.xArray = x;
	this.yArray = y;
	this.diameter = defaultDiameter;
	this.update = function() {
		//ToDo
	}
	this.draw = function() {
		this.update();
		fill(150,150,150);
		for (var i = 0; i < this.xArray.length; i++) {
			ellipse(this.xArray[i], this.yArray[i], this.diameter, this.diameter);
		}
		for (var i = 1; i < this.xArray.length; i++) {
			line(this.xArray[i-1], this.yArray[i-1], this.xArray[i], this.yArray[i]);
		}
	}
	this.shape = function() {
		return bubblelist;
	}
	this.mouseHit = function(mousex, mousey) {
		for (var i = 0; i < this.xArray.length; i++) {
			if (mouseHitCircle(mousex, mousey, this.xArray[i], this.yArray[i], this.diameter)) {
				return i;
			}
		}
		return -1;
	}
	this.zoom = function() {
		//ToDo
	}
}

//Click detection
function detectClick() {
	if (mouseIsPressed && (mouseButton == LEFT) && canClick) {
		canClick = false;
		//For each shape
		if (zoomed && floaterList[zoomedIndex].mouseHit(mouseX, mouseY)) {
			zoomed = false;
			floaterList[zoomedIndex].zoom();
		} else {
			for (var i = 0; i < floaterList.length; i++) {
				var current = floaterList[i];
				//If the click is registered
				if (current.mouseHit(mouseX, mouseY)) {
					//If no shape is zoomed or if unzooming
					if (!zoomed) {
						zoomed = true;
						zoomedIndex = i;
						current.zoom();
						break;
					} else {
						current.zoom();
						floaterList[zoomedIndex].zoom();
						zoomedIndex = i;
						break;
					}
				}
			}
		}
	} else if (!mouseIsPressed || !(mouseButton == LEFT)) {
		canClick = true;
	}
}

function drawFloatsAndUpdate() {
	var lastDraw = -1;
	for (var i = 0; i < floaterList.length; i++) {
		if (!zoomed || i != zoomedIndex) {
			var current = floaterList[i];
			current.draw();
		} else lastDraw = i;
	}
	if (lastDraw >= 0) {
			floaterList[lastDraw].draw();
	}
}

function addBubble(data, x, y) {
	floaterList.push(new Bubble(data, x, y));
}

function setup() {
  createCanvas(windowWidth/2, windowHeight);
  frameRate(framerate);
  addBubble("data", width/2, height/2);
  addBubble("data", width/4, height/4);
  addBubble("data", 3*width/4, height/4);
  addBubble("data", 3*width/4, 3*height/4);
  addBubble("data", width/4, 3*height/4);
  loop();
}

function draw() {
	detectClick();
	background (0, 138, 184);
	drawFloatsAndUpdate();
}