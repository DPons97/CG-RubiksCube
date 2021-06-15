// Offsets of the cubies with respect to the center of the rubik's cube.
// They are used to determine the cubies that compose the face to rotate
const OFFSET_X = 1;
const OFFSET_Y = 1;
const OFFSET_Z = 1;

const DELTA = 0.0001 // Delta for floating point comparison     // TODO move to utils

const RUBIK_ROT_SPEED = 10; // stores the rotation speed of the whole cube

function float_equal(a, b) { // maybe move in a utils file if needed elsewhere
    if (Math.abs(a - b) <= DELTA) {
        return true;
    } else {
        return false;
    }
}

// The Rubik class inherites from the Node class. It represents the whole rubik's cube. 
// For references to conventions used please check pdf notes
// It has its local and world matrices (inherited by node),
// a reference to all the cubies nodes
// an array of possible shaders
// The order in which cubies are passed SHOULD not matter.
export default class Rubik extends Node {

    constructor(cubies, programs) {
        super()
        console.log(cubies);
        this.programs = programs;
        this.curProgram = 0;
        this.isShift = false;
        cubies.forEach(cubie => {
            cubie.setParent(this);
            //child.setShader(this.shaders[this.currShader]);
        });
    }
}

// initializes key binds
Rubik.prototype.initKeyBinds = function() {
        document.onkeydown = this.processKeyDown;
        document.onkeyup = this.processKeyUp;
}

// changes the shader in a round robin fashion
Rubik.prototype.nextProgram = function() {
    this.curProgram++;
    if (this.curProgram >= this.programs.length) this.curProgram = 0;
}

Rubik.prototype.getProgram = function(){
    return this.programs[this.curProgram];
}

// Checking cubies that belong to a specific face:
// cubie fictMatrix should be something like
// 1  X
//  1 Y
//   1Z
// 0001
// where X,Y,Z are the offset of the cubie with respect to the center of the rubik's cube

// Back face has all the cubies with positive Y offset
Rubik.prototype.rotateB = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[7], OFFSET_Y)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateYTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// Front face has all the cubies with negative Y offset
Rubik.prototype.rotateF = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[7], -OFFSET_Y)) {
            // if cubie belongs to up face i need to rotate around Y
            console.log("before:",c.fictMatrix);

            if (c.updateYTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(this.isShift ? -90 : 90), c.fictMatrix);

            console.log("after:",c.fictMatrix);
        }
    });
}

// C face has all the cubies with Y offset equal to 0
Rubik.prototype.rotateC = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[7], 0)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateYTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// DOwn face has all the cubies with negative Z offset
Rubik.prototype.rotateD = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[11], -OFFSET_Z)) {
            // if cubie belongs to up face i need to rotate around Y
            console.log("before:",c.fictMatrix);

            if (c.updateZTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(this.isShift ? -90 : 90), c.fictMatrix);

            console.log("after:",c.fictMatrix);

        }
    });
}

// Up face has all the cubies with negative Z offset
Rubik.prototype.rotateU = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[11], OFFSET_Z)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateZTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// H face has all the cubies with Z offset equal to 0
Rubik.prototype.rotateH = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[11], 0)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateZTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// RIght face has all the cubies with positive X offset
Rubik.prototype.rotateR = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[3], OFFSET_X)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateXTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// Left face has all the cubies with negative X offset
Rubik.prototype.rotateL = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[3], -OFFSET_X)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateXTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// H face has all the cubies with X offset equal to 0
Rubik.prototype.rotateM = function() {
    this.children.forEach(c => {
        if (float_equal(c.fictMatrix[3], 0)) {
            // if cubie belongs to up face i need to rotate around Y
            if (c.updateXTarget(this.isShift ? -90 : 90))
                c.fictMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(this.isShift ? -90 : 90), c.fictMatrix);
        }
    });
}

// Rotates the whole cube around X axis 
Rubik.prototype.rotateCubeX = function (positive) {
    this.rotateX(positive ? RUBIK_ROT_SPEED : -RUBIK_ROT_SPEED);
}

// Rotates the whole cube around X axis 
Rubik.prototype.rotateCubeY = function (positive) {
    this.rotateY(positive ? RUBIK_ROT_SPEED : -RUBIK_ROT_SPEED);
}

// TODO: this
// idea: once we have the model, store a copy of initial positions and check agaisnt it to verify victory
Rubik.prototype.checkVictory = function() {
    return false
}

