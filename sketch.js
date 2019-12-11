var pressMotionTime = 0;
var prevKeyIsPressed = false;
var prevKey;

var sensor1;
var sensor2;
var sensor3;

var serial; // variable to hold an instance of the serialport library
var options = {
    baudRate: 9600
};
//  variables for calculating easing 
let y = 0;
let easing = 0.05;

//for fft
var volhistory = [];

function setup() {




    // create a canvas that fills the window
    createCanvas(windowWidth, windowHeight);

    //    set color mode

    colorMode(HSB);

    // set angle mode for circle
    angleMode(DEGREES);
    // Instantiate our SerialPort object
    serial = new p5.SerialPort();

    // Get a list the ports available
    // You should have a callback defined to see the results
    serial.list();

    // Assuming our Arduino is connected, let's open the connection to it
    // Change this to the name of your arduino's serial port
    serial.open("/dev/tty.usbmodem14401");

    // Here are the callbacks that you can register
    // When we connect to the underlying server
    serial.on('connected', serverConnected);

    // When we get a list of serial ports that are available
    serial.on('list', gotList);
    // OR
    //serial.onList(gotList);

    // When we some data from the serial port
    serial.on('data', gotData);
    // OR
    //serial.onData(gotData);

    // When or if we get an error
    serial.on('error', gotError);
    // OR
    //serial.onError(gotError);

    // When our serial port is opened and ready for read/write
    serial.on('open', gotOpen);
    // OR
    //serial.onOpen(gotOpen);

    serial.on('close', gotClose);
    // Start a new reverb instance for the tracks
    reverb = new p5.Reverb();

    // Start a new delay instance for the tracks
    delay = new p5.Delay();

    // Start a new amplitude instance for the tracks
    amplitude = new p5.Amplitude();

    // Start a new reverb instance for the tracks
    reverb = new p5.Reverb();

    // Start a new delay instance for the tracks
    delay = new p5.Delay();

    // start a new Fast Fourier Transform for the amplitude c
    fft = new p5.FFT(0.5, 64);

    //add the delay process for the notes, function(track, delayTime[max1], feedback, filter, frequency)
    delay.process(sound_a, 0.9, .1, 2300);
    delay.process(sound_s, 0.9, .1, 2300);
    delay.process(sound_d, 0.9, .1, 2300);



}

// We are connected and ready to go
function serverConnected() {
    print("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
    print("List of Serial Ports:");
    // theList is an array of their names
    for (let i = 0; i < thelist.length; i++) {
        // Display in the console
        print(i + " " + thelist[i]);
    }
}

// Connected to our serial device

function gotOpen() {
    print("Serial Port is Open");
}

function gotClose() {
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

// Log error in console if something crops up
function gotError(theerror) {
    print(theerror);
}


function gotData() {
    //    create a string that reads the entire line of sensor data from Arduino
    var inString = serial.readLine();
    // split the incoming data at every comma 
    if (inString.length > 0) {
        var splitString = split(inString, ',');
        // connecting the varous splits into different variables
        sensor1 = Number(splitString[0]);
        sensor2 = Number(splitString[1]);
        sensor3 = Number(splitString[2]);
        //        sensor4 = Number(splitString[3]);
        //        sensor5 = Number(splitString[4]);
        //        sensor6 = Number(splitString[5]);
        //        sensor7 = Number(splitString[6]);
        //        sensor8 = Number(splitString[7]);
        //        sensor9 = Number(splitString[8]);
        //        sensor10 = Number(splitString[9]);
        //        sensor11 = Number(splitString[10]);

    }


}

// We got raw from the serial port
function gotRawData(thedata) {
    print("gotRawData" + thedata);
}


function draw() {
    //    clear();
    background(51);
    noStroke();
    fill(0);
    //    text('- x', 30, 20);
    text('Current Sensor Readings', (windowWidth / 2) - 20, 100);
    text('sensor1:', (windowWidth / 2) - 50, 120);
    text((sensor1), (windowWidth / 2) + 50, 120);
    //    text('hi', 30, 20);
    text('sensor2:', (windowWidth / 2) - 50, 135);
    text((sensor2), (windowWidth / 2) + 50, 135);
    text('sensor3:', (windowWidth / 2) - 50, 150);
    text((sensor3), (windowWidth / 2) + 50, 150);

    if ((sensor1) < 15) {
        if (pressMotionTime == 0) {
            sound_a.setVolume(1);
            sound_a.playMode('untilDone');
            sound_a.play();

        }
    }
    if ((sensor2) < 15) {
        if (pressMotionTime == 0) {
            sound_s.setVolume(1);
            sound_s.playMode('untilDone');
            sound_s.play();

        }

    }
    if ((sensor3) < 10) {
        if (pressMotionTime == 0) {
            sound_d.setVolume(1);
            sound_d.playMode('untilDone');
            sound_d.play();
            //            sound_semicolon.loop();
        }
    }

    if (keyIsPressed || prevKeyIsPressed) {
        if (keyIsPressed) {
            prevKey = key;
        }
        if (key == 'a' || prevKey == 'a') {
            sound_a.setVolume(1);
            sound_a.play();

        }
        if (key == 's' || prevKey == 's') {
            if (pressMotionTime == 0) {
                sound_s.setVolume(1);
                sound_s.play();

            }
        }
        if (key == 'd' || prevKey == 'd') {
            if (pressMotionTime == 0) {
                sound_d.setVolume(1);
                sound_d.play();
            }
        }

    }



    let level = amplitude.getLevel();
    let size = map(level, 0, 1, 0, 200);


    let spectrum = fft.analyze();
    noStroke();
    strokeWeight(1);
    //    stroke(255, 0, 0);
    translate(width / 2, height / 2);
    beginShape();
    for (var i = 0; i < spectrum.length; i++) {
        var angle = map(i, 0, spectrum.length, 0, 360);
        var amp = spectrum[i];
        var r = map(amp, 0, 256, 20, 200);
        //        fill(i, 255, 255);
        var x = r * cos(angle);
        var y = r * sin(angle);

        stroke(i * 0.01, i * 2, 255);
        line(0, 0, x * 2, y * 2);
        //        vertex(x * 2, y * 2);
        //        var y = map(amp, 0, 256, height, 0);

        //        rect(i * w, y, w - 2, height - y);
    }

    endShape();
    //    fill(0);
    //    fill(0, 0, 0, 0.5);
    //    noStroke();
}


function preload() {
    //	sound_a = loadSound('piano-sound/c3.ogg');
    //	sound_s = loadSound('piano-sound/d3.ogg');
    //	sound_d = loadSound('piano-sound/e3.ogg');
    //	sound_f = loadSound('piano-sound/f3.ogg');
    //	sound_j = loadSound('piano-sound/g3.ogg');
    //	sound_k = loadSound('piano-sound/a3.ogg');
    //	sound_l = loadSound('piano-sound/b3.ogg');
    //	sound_semicolon = loadSound('piano-sound/ha4.ogg');
    //    
    sound_a = loadSound('piano-sound/C5.mp3 ');
    sound_s = loadSound('piano-sound/D5.mp3');
    sound_d = loadSound('piano-sound/E5.mp3');
    //    sound_f = loadSound('piano-sound/F5.mp3');
    //    sound_j = loadSound('piano-sound/G5.mp3');
    //    sound_k = loadSound('piano-sound/A5.mp3');
    //    sound_l = loadSound('piano-sound/B5.mp3');
    //    sound_semicolon = loadSound('piano-sound/Ab5.mp3');
    //
    //    sound_a = loadSound('piano-sound/A0.mp3');
    //    sound_s = loadSound('piano-sound/A1.mp3');
    //    sound_d = loadSound('piano-sound/A2.mp3');
    //    sound_f = loadSound('piano-sound/A3.mp3');
    //    sound_j = loadSound('piano-sound/A4.mp3');
    //    sound_k = loadSound('piano-sound/A5.mp3');
    //    sound_l = loadSound('piano-sound/A6.mp3');
    //    sound_semicolon = loadSound('piano-sound/A7.mp3');
}
