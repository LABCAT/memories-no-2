import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import SaveJSONToFile from "./functions/SaveJSONToFile.js";


import audio from "../audio/memories-no-2.ogg";
import midi from "../audio/memories-no-2.mid";
import image from "../images/Tiny-Frogs-Taiwan-Zoo.jpg";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.files = [
            'Tobu-Zoo-Winter-Illumination-Trebble-Clef.json',
            'Tiny-Frogs-Taiwan-Zoo.json',
            'Elephant-Playing-With-Tyres-Taiwan-Zoo.json',
            'Making-Mochi-Okegawa-Festival.json',
            'Spaceman-Building.json',
            'LABCAT-Meets-Alpaca.json',
            'Gover-St-Gallery-Mural.json',
            'Garage-Simaya.json'
        ];

        p.imageData = {};

        p.shapeData = [];

        p.nextShapeData = [];

        p.shapeTypes = ['circle', 'equilateral', 'rect', 'pentagon', 'hexagon', 'octagon'];

        p.loadShapeData = () => {
            // const startPos = multiplier <= 2 ? multiplier : multiplier + 2;
            let array = [];
            const cicleSizes = [4, 8, 12];
            let x = 2, y = 2;
            while (x < p.width) {
                let xSize = p.random(cicleSizes);
                while (y < p.height) {
                    const key = x + ',' + y,
                        size = p.random(cicleSizes),
                        shape = p.imageData[key];
                    if(typeof shape !== typeof undefined) {
                        array.push(
                            {
                                x: x,
                                y: y,
                                size: size,
                                shapeType: p.random(p.shapeTypes),
                                colour: shape.c,
                            }
                        );
                    }
                    y = y + size;
                }
                x = x + xSize;
                y = 2;
            }

            p.shapeData = p.shuffle(array);
        }

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    p.noteSet1 = result.tracks[2].notes; // Sampler 1 - RhodesMK1
                    p.scheduleCueSet(p.noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.img = p.loadImage(image);
            p.imageData = require('../json/' + p.random(p.files));
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            //p.saveImageData('Lego-Land-Johor-Bahru-2015')
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.rectMode(p.CENTER);
            p.noLoop();
            p.noFill();
            p.strokeWeight(0.5);
            p.loadShapeData();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.currentNoteIndex = 1;

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            console.log('currentCue', currentCue);
            console.log(p.currentNoteIndex);
            if(p.currentNoteIndex === 12) {
                p.clear();
                p.background(0);
                p.imageData = require('../json/' + p.random(p.files));
                p.loadShapeData();
                p.currentNoteIndex = 1;
            }
            const numItemsToDraw = Math.ceil(p.shapeData.length / 11),
                startIndex = numItemsToDraw * p.currentNoteIndex - numItemsToDraw,
                endIndex = p.shapeData.length < numItemsToDraw * p.currentNoteIndex ? p.shapeData.length : numItemsToDraw * p.currentNoteIndex;
            for (let i = startIndex; i < endIndex; i++) {
                const shape = p.shapeData[i],
                            {x, y, size, shapeType, colour } = shape;

                        p.stroke(colour[0], colour[1], colour[2]);
                        p[shapeType](x, y, size, size);
            }

            // hack - not sure why the 6th cue is triggered twice
            if(currentCue === 6 && currentCue !== p.currentNoteIndex) {
                p.currentNoteIndex--;
            }

            p.currentNoteIndex++;
        }

        p.hasStarted = false;

        /*
        * function to draw an equilateral triangle with a set width
        * based on x, y co-oridinates that are the center of the triangle
        * @param {Number} x        - x-coordinate that is at the center of triangle
        * @param {Number} y      	- y-coordinate that is at the center of triangle
        * @param {Number} width    - radius of the hexagon
        */
        p.equilateral = (x, y, width) => {
            var x1 = x - (width/2);
            var y1 = y + (width/2);
            var x2 = x;
            var y2 = y - (width/2);
            var x3 = x + (width/2);
            var y3 = y + (width/2);
            p.triangle(x1,y1,x2,y2,x3,y3);
        }

        /*
        * function to draw a pentagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the pentagon
        * @param {Number} y      - y-coordinate of the pentagon
        * @param {Number} radius   - radius of the pentagon
        */
        p.pentagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 5;
            p.beginShape();
            for (var a = p.TWO_PI/10; a < p.TWO_PI + p.TWO_PI/10; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }

        /*
        * function to draw a hexagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the hexagon
        * @param {Number} y      - y-coordinate of the hexagon
        * @param {Number} radius   - radius of the hexagon
        */
        p.hexagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 6;
            p.beginShape();
            for (var a = p.TWO_PI/12; a < p.TWO_PI + p.TWO_PI/12; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }

        /*
        * function to draw a octagon shape
        * adapted from: https://p5js.org/examples/form-regular-polygon.html
        * @param {Number} x        - x-coordinate of the octagon
        * @param {Number} y      - y-coordinate of the octagon
        * @param {Number} radius   - radius of the octagon
        */
        p.octagon = (x, y, radius) => {
            radius = radius / 2;
            p.angleMode(p.RADIANS);
            var angle = p.TWO_PI / 8;
            p.beginShape();
            for (var a = p.TWO_PI/16; a < p.TWO_PI + p.TWO_PI/16; a += angle) {
                var sx = x + p.cos(a) * radius;
                var sy = y + p.sin(a) * radius;
                p.vertex(sx, sy);
            }
            p.endShape(p.CLOSE);
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }

        p.saveImageData = (filename) => {
            p.image(p.img, 0, 0);
            for (let x = 2; x < 1920; x = x + 4) {
                for (let y = 2; y < 1080; y = y + 4) {
                    const key = x + ',' + y;
                    const c = p.img.get(
                        x,
                        y
                    );
                    console.log(key);
                    p.imageData[key] = {
                        r: 2,
                        c: c
                    }
                }
            }
            SaveJSONToFile(p.imageData, filename);
        };
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
