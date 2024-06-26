let song, analyzer;
//Defines an empty array circles to store all created circular objects.
let circles = [];
// Boolean flag to check if the song is playing
let isPlaying = false;
// Defines an empty array 'dynamicCircles' to store circles that will dynamically change based on audio
let dynamicCircles = [];

function preload() {
  //audio file from freesound https://freesound.org/people/multitonbits/sounds/383935/?
  //licensed under the Creative Commons 0 License
  //let's load the sound file in preload
  song = loadSound('assets/350956__matucha__rain_attic_03.wav');
}

//Defines a Circle class for creating and managing circular objects
class Circle {
  //Constructor that initializes the coordinates, size and type of the circle.
  constructor(x, y, size, type) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;
  }

  draw(scaleFactor = 1) {
    //Randomly generate an integer that determines the number of layers of the circle
    let numLayers = int(random(3, 6));
   
    //Loop through each layer
    for (let i = numLayers; i > 0; i--) {
      //Calculates the size of the current layer
      let size = (this.size / numLayers) * i * scaleFactor;
      //create gradient color
      let gradientColor = lerpColor(randomWarmColor(200), randomWarmColor(200), i / numLayers);
      //Randomly decide whether to fill or stroke
      if (random() > 0.5) {
        fill(gradientColor);
        noStroke();
      } else {
        noFill();
        stroke(gradientColor);
        strokeWeight(2);
      }
      //Draw the circle of the current layer
      ellipse(this.x, this.y, size, size);
      //Draw the pattern of the current layer
      this.drawPattern(size);
    }
  }

  drawPattern(diameter) {
    //A random integer is generated to determine the number of patterns
    let numPatterns = int(random(5, 15));
    //Draw each pattern in a loop
    for (let i = 0; i < numPatterns; i++) {
      //Calculate the Angle of the current pattern
      let angle = map(i, 0, numPatterns, 0, TWO_PI);
      //Calculate the X-coordinate of the current pattern
      let px = this.x + (diameter / 2) * cos(angle);
      //Calculate the Y-coordinate of the current pattern
      let py = this.y + (diameter / 2) * sin(angle);
      //Generate the color of the pattern
      let shapeColor = lerpColor(randomWarmColor(200), randomWarmColor(200), i / numPatterns);
      //Set fill color
      fill(shapeColor);
      //Draw different patterns according to the type
      switch (this.type) {
        case 0:
          //Ellipse
          ellipse(px, py, diameter / 10, diameter / 10);
          break;
        case 1:
          //Rectangle
          rectMode(CENTER);
          rect(px, py, diameter / 10, diameter / 10);
          break;
        case 2:
          //Line
          stroke(shapeColor);
          line(this.x, this.y, px, py);
          noStroke();
          break;
        case 3:
          //Polygon
          drawPolygon(px, py, diameter / 20, 6);
          break;
      }
    }
  }
}

function setup() {
  // Create a canvas with the window's width and height
  createCanvas(windowWidth, windowHeight);

  // Set the frame rate to slow down the animation
  //The function of frameRate() is to set the number of frames to draw per second.
  //This technique is from https://p5js.org/reference/#/p5/frameRate
  frameRate(10); 

  noStroke();
  // Create an amplitude analyzer object
  analyzer = new p5.Amplitude();

  // Connect the input of the analyzer to the song
  analyzer.setInput(song);

  //Add a button for play/pause
  //We cannot play sound automatically in p5.js, so we need to add a button to start the sound
  button = createButton('Play/Pause');
  // Set the position of the button to the bottom center
  positionButton();
  // Set the action of the button when clicked
  button.mousePressed(play_pause);

  // Initialize circles
  initializeCircles();
  // Draw static circles initially
  drawStaticCircles();
}

function draw() {
  if (isPlaying) {
    background(20, 10, 0);
    drawBackgroundPattern();

    // Get the average (root mean square) amplitude
    let rms = analyzer.getLevel();
    // Scale factor based on volume
    let scaleFactor = 1 + rms * 1.4;

    // Loop through dynamic circles and draw them with scaling
    for (let circle of dynamicCircles) {
      circle.draw(scaleFactor);
    }
  }
}

// Initialize circles
function initializeCircles() {
  //Define the number of circles
  let numCircles = 50;

  //Loop to create and draw each circle
  for (let i = 0; i < numCircles; i++) {
    //Randomly generate the size of the circle
    let maxSize = random(100, 200);
    //Create a circle that does not overlap
    let newCircle = createNonOverlappingCircle(maxSize);
    //If the circle is successfully created, it is added to the array and drawn
    if (newCircle) {
      circles.push(newCircle);
      //Randomly decide if the circle is dynamic
      if (random() > 0.5) {
        dynamicCircles.push(newCircle);
      }
      //Create the type of number
      let type = int(random(4));
      newCircle.type = type;
    }
  }
}

// Draw static circles initially
function drawStaticCircles() {
  background(20, 10, 0);
  // Draw background pattern with random circles
  drawBackgroundPattern();
  // Loop through all the circles in the circles array
  for (let circle of circles) {
    // Check if the current circle is not in the dynamicCircles array
    if (!dynamicCircles.includes(circle)) {
      circle.draw(1);
    }
  }
}

// Draw background pattern
function drawBackgroundPattern() {
  //Define the number of background circles
  let bgCircles = 50;
  //Loop the background circle
  for (let i = 0; i < bgCircles; i++) {
    fill(randomWarmColor(50));
    ellipse(random(width), random(height), random(50, 150));
  }
}

//Create a circle that does not overlap
function createNonOverlappingCircle(maxSize) {
  //Number of initialization attempts
  let attempts = 0;
  //Number of maximum attempts
  let maxAttempts = 1000;

  //Try to create circles that do not overlap
  while (attempts < maxAttempts) {
    let x = random(width);
    let y = random(height);
    //Create a new circle object
    let circle = new Circle(x, y, maxSize);

    //Initializes the overlap
    let overlapping = false;
    //Check for overlaps with existing circles
    for (let c of circles) {
      //Calculate the distance from the center of the circle
      let d = dist(x, y, c.x, c.y);
      //Determine whether to overlap
      if (d < (c.size / 2 + circle.size / 2)) {
        overlapping = true;
        break;
      }
    }

    //If not, return a new circle
    if (!overlapping) {
      return circle;
    }

    //Increase the number of attempts
    attempts++;
  }

  //If a non-overlapping location cannot be found, null is returned
  return null;
}

//Draw polygon
//The principle of polygon generation is to establish the vertices and then connect the positions of each vertex to form a closed graph
//This technique is from https://p5js.org/reference/#/p5/beginShape
function drawPolygon(x, y, radius, npoints) {
  //Calculate the Angle of each vertex
  let angle = TWO_PI / npoints;
  //Start drawing shapes
  beginShape();
  //Loop over each vertex
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  //Finish drawing and closing the shape
  endShape(CLOSE);
}

function play_pause() {
  if (song.isPlaying()) {
    song.stop();
    isPlaying = false;
  } else {
    //we can use song.play() here if we want the song to play once
    //In this case, we want the song to loop, so we call song.loop()
    song.loop();
    isPlaying = true;
  }
}

//Generate random warm colors, alpha means the transparency level of a color(0-255)
//This technique is from https://p5js.org/reference/#/p5/alpha 
function randomWarmColor(alpha) {
  //Define a set of warm colors
  let colors = [
    color(255, 102, 102, alpha),
    color(255, 178, 102, alpha),
    color(255, 255, 102, alpha),
    color(255, 153, 102, alpha), 
    color(255, 204, 153, alpha)
  ];
  //Randomly return a warm color
  return colors[int(random(colors.length))];
}

function windowResized() {
  // Resize canvas to new window dimensions
  resizeCanvas(windowWidth, windowHeight);
  // Redraw static circles
  drawStaticCircles();
  positionButton();
}

function positionButton() {
  // Position the button at the bottom center of the window
  button.position((windowWidth - button.width) / 2, windowHeight - button.height - 2);
}
