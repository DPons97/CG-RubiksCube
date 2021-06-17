var gl;
var shaderDir;
var baseDir;
var viewMatrix;
var cameraMatrix;
var rubik;
var cubies = [];

import Rubik from './Rubik.js';
import Cubie from './Cubie.js';

async function loadModel(modelName) {
    //This line must be in an async function
    var pathToModel = baseDir + "models/"
    try {
        var objStr = await utils.get_objstr(pathToModel + modelName);
    } catch (error) {
        console.error(error)
        return
    }

    var objModel = new OBJ.Mesh(objStr);
    OBJ.initMeshBuffers(gl, objModel); // https://www.npmjs.com/package/webgl-obj-loader/v/2.0.2 find initMeshBuffers and check examples

    return objModel // ritorniamo direttamente l'oggeto
}

async function main() {
    //SET Global states (viewport size, viewport background color, Depth test)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // #0 - Ambient color white - Default program
    shaders_utils.setProgramAttribLocations(gl, shaders_utils.getProgram());

    // SET UP THE CUBIES AND RUBIK OBJECTS
    cubies = [];

    let i = 0
    for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
            for (let y = 0; y < 3; y++) {
                if (x == 1 && y == 1 && z == 1) { i++ }
                else {
                    var model = await loadModel("cube" + x + z + ((y == 1) ? '_M' : (y < 1) ? '_B' : '') + '.obj')
                    cubies[i++] = new Cubie(model, [-x + 1, y - 1, -z + 1]);
                }
            }
        }
    }

    // Initialize vertex, normals, uv buffers
    shaders_utils.initBuffers(gl, cubies);
    shaders_utils.initShaderParams();

    // Create a texture.
    shaders_utils.texture = gl.createTexture();
    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, shaders_utils.texture);

    // Asynchronously load an image
    var image = new Image();
    image.src = baseDir + "models/Rubiks Cube.png";
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, shaders_utils.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    rubik = new Rubik(cubies)
    rubik.initKeyBinds();

    document.onkeydown = function (e) {
        console.log("Key down: " + e.code);
        switch (e.code) {
            case "ShiftLeft":
            case "ShiftRight":
                if (!rubik.isShift) rubik.isShift = true;
                break;
            case "KeyU": // U for up face
                rubik.pushRotation("U");
                break;
            case "KeyD": // D for down face
                rubik.pushRotation("D");
                break;
            case "KeyC": // C for central face parallel to U and D
                rubik.pushRotation("C");
                break;
            case "KeyF": // F for front face
                rubik.pushRotation("F");   
                break;
            case "KeyB": // B for back face
                rubik.pushRotation("B");
                break;
            case "KeyH": // H for central face parallel to F and B
                rubik.pushRotation("H");               
                break;
            case "KeyR": // R for right face
                rubik.pushRotation("R");
                break;
            case "KeyL": // L for left face
                rubik.pushRotation("L");
                break;
            case "KeyM": // M for central face parallel to R and L
                rubik.pushRotation("M");
                break;
            case "ArrowDown": // Arrows to rotate whole cube
                rubik.rotateCubeX(true)
                break;
            case "ArrowUp": // Arrows to rotate whole cube
                rubik.rotateCubeX(false)
                break;
            case "ArrowRight": // Arrows to rotate whole cube
                rubik.rotateCubeY(true)
                break;
            case "ArrowLeft": // Arrows to rotate whole cube
                rubik.rotateCubeY(false)
                break;
            case "Space":
                shaders_utils.nextProgram(gl, cubies);
            case "KeyS":
                if (rubik.isShift) rubik.unShuffle();
                else rubik.shuffle();
                break;
            default:
                break;
        }
    }

    document.onkeyup = function (e) {
        console.log("Key up: " + e.code);
        switch (e.code) {
            case "ShiftLeft":
            case "ShiftRight":
                rubik.isShift = false;
                break;
            default:
                break;
        }
    }

    drawScene();

    function drawScene() {
        // RESET THE SCENE
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = utils.MakePerspective(60.0, aspect, 1.0, 2000.0);

        // Compute the camera matrix using look at.
        var cameraPosition = [5, -10, 5];
        var target = [0.0, 0.0, 0.0];
        var up = [0.0, 0.0, 1.0];
        cameraMatrix = utils.LookAt(cameraPosition, target, up);
        viewMatrix = utils.invertMatrix(cameraMatrix);

        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);

        isAnimating = false;
        rubik.animate();

        shaders_utils.currShaderParams.DTexMix = document.getElementById("texP").value;

        if (!isAnimating) rubik.checkQueue();

        rubik.updateWorldMatrix();
        gl.useProgram(shaders_utils.getProgram());

        // Compute all the matrices for rendering
        rubik.children.forEach(function (cubie) {
            //console.log(cubie);

            shaders_utils.setProgramShaderParams(gl, cubie, cameraPosition, viewProjectionMatrix);

            gl.bindVertexArray(cubie.vao);
            gl.drawElements(gl.TRIANGLES, cubie.drawInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        });

        window.requestAnimationFrame(drawScene);
    }
}

async function init() {

    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";

    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("GL context not opened");
        return;
    }

    utils.resizeCanvasToPercentageDisplaySize(gl.canvas, 0.8);

    // #0 - Ambient color white
    await utils.loadFiles([shaderDir + 'vs0.glsl', shaderDir + 'fs0.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        shaders_utils.programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);
    });

    // #1 - Direct light, Ambient, Lambert diffuse, Phong specular
    
    // #2 - Spot light, Hemispheric, Lambert diffuse, Blinn specular
    
    // #3 - Spot light, Spherical Harm., Lambert, Toon (Phong)
    /*await utils.loadFiles([shaderDir + 'vs3.glsl', shaderDir + 'fs3.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        // todo shaders_utils.programs[3] = utils.createProgram(gl, vertexShader, fragmentShader);
        shaders_utils.programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);
    });*/

    main();
}


window.onload = init;