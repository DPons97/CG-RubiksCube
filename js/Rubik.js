// Offsets of the cubies with respect to the center of the rubik's cube.
// They are used to determine the cubies that compose the face to rotate
const OFFSET_X = 1;
const OFFSET_Y = 1;
const OFFSET_Z = 1;

const DELTA = 0.0001 // Delta for floating point comparison     // TODO move to utils

const RUBIK_ROT_SPEED = 1; // stores the rotation speed of the whole cube

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
class Rubik {

    constructor(cubies, shaders) {
        this.children = cubies;
        this.shaders = shaders;
        this.currShader = 0;
        this.isShift = false;
        cubies.forEach(c => {
            c.setParent(this);
            c.setShader(this.shaders[this.currShader]);
        });
        document.onkeydown = this.processKeyDown;
        document.onkeyup = this.processKeyUp;
    }

    // changes the shader in a round robin fashion
    nextShader() {
        this.currShader++;
        if (this.currShader >= this.shaders.length) this.currShader = 0;
        this.children.forEach(c => { c.setShader(this.shaders[this.currShader]) })
    }

    // Checking cubies that belong to a specific face:
    // cubie localMatrix should be something like
    // 1  X
    //  1 Y
    //   1Z
    // 0001
    // where X,Y,Z are the offset of the cubie with respect to the center of the rubik's cube

    // Up face has all the cubies with positive Y offset
    rotateU() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[7], OFFSET_Y)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateYTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Down face has all the cubies with negative Y offset
    rotateD() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[7], -OFFSET_Y)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateYTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // C face has all the cubies with Y offset equal to 0
    rotateC() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[7], 0)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateYTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Front face has all the cubies with negative Z offset
    rotateF() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[11], -OFFSET_Z)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateZTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Back face has all the cubies with negative Z offset
    rotateB() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[11], OFFSET_Z)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateZTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // H face has all the cubies with Z offset equal to 0
    rotateH() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[11], 0)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateZTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Front face has all the cubies with positive X offset
    rotateR() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[3], OFFSET_X)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateXTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Back face has all the cubies with negative X offset
    rotateL() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[3], OFFSET_X)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateXTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // H face has all the cubies with X offset equal to 0
    rotateM() {
        this.children.forEach(c => {
            if (float_equal(c.locaMatrix[3], 0)) {
                // if cubie belongs to up face i need to rotate around Y
                c.updateXTarget(this.isShift ? -90 : 90);
            }
        });
    }

    // Rotates the whole cube around X axis 
    rotateCubeX(positive) {
        this.rotateX(positive ? speed : -speed);
    }

    // Rotates the whole cube around X axis 
    rotateCubeY(positive) {
        this.rotateY(positive ? speed : -speed);
    }

    processKeyDown(e) {
        console.log("Key down: " + e.code);
        switch (e.code) {
            case "ShiftLeft":
            case "ShiftRight":
                this.isShift = true;
                break;
            case "keyU": // U for up face
                this.rotateU();
                break;
            case "keyD": // D for down face
                this.rotateD();
                break;
            case "keyC": // C for central face parallel to U and D
                this.rotateC();
                break;
            case "keyF": // F for front face
                this.rotateF();
                break;
            case "keyB": // B for back face
                this.rotateB();
                break;
            case "keyH": // H for central face parallel to F and B
                this.rotateH();
                break;
            case "keyR": // R for right face
                this.rotateR();
                break;
            case "keyL": // L for left face
                this.rotateL();
                break;
            case "keyM": // M for central face parallel to R and L
                this.rotateM();
                break;
            case "ArrowDown": // Arrows to rotate whole cube
                this.rotateCubeX(true)
                break;
            case "ArrowUp": // Arrows to rotate whole cube
                this.rotateCubeX(false)
                break;
            case "ArrowRight": // Arrows to rotate whole cube
                this.rotateCubeY(true)
                break;
            case "ArrowLeft": // Arrows to rotate whole cube
                this.rotateCubeY(false)
                break;
            default:
                break;
        }
    }

    processKeyUp(e) {
        console.log("Key up: " + e.code);
        switch (e.code) {
            case "ShiftLeft":
            case "ShiftRight":
                isShift = false;
                break;
            default:
                break;
        }
    }

    // TODO: this
    // idea: once we have the model, store a copy of initial positions and check agaisnt it to verify victory
    checkVictory() {
        return false
    }
}