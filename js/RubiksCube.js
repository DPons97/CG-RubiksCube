var program;
var gl;
var shaderDir;
var baseDir;
var viewMatrix;
var cameraMatrix;
var rubik;

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

    var dirLightAlpha = -utils.degToRad(-60);
    var dirLightBeta = -utils.degToRad(120);
    var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
    var directionalLightColor = [0.8, 1.0, 1.0];

    //SET Global states (viewport size, viewport background color, Depth test)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    var positionAttributeLocation = gl.getAttribLocation(program, "inPosition");
    var normalAttributeLocation = gl.getAttribLocation(program, "inNormal");
    var matrixLocation = gl.getUniformLocation(program, "matrix");
    var materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
    var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
    var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');

    // SET UP THE CUBIES AND RUBIK OBJECTS
    var cubies = [];

    let i = 0
    for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
            for (let y = 0; y < 3; y++) {
                if (x == 1 && y == 1 && z == 1) { i++ }
                else {
                    var model = await loadModel("cube" + x + z + ((y == 1) ? '_M' : (y < 1) ? '_B' : '') + '.obj')
                    cubies[i++] = new Cubie(model, [x-1,y-1,z-1]);
                }
            }
        }
    }
    console.log(cubies);
    cubies.forEach((cubie) => {
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        cubie.setVao(vao)

        var positionBuffer = cubie.drawInfo.vertexBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubie.drawInfo.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocation);

        var normalBuffer = cubie.drawInfo.normalBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubie.drawInfo.vertexNormal), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalAttributeLocation);
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        var indexBuffer = cubie.drawInfo.indexBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubie.drawInfo.indices), gl.STATIC_DRAW);

    })

    rubik = new Rubik(cubies, [program])
    rubik.initKeyBinds();

    console.log(rubik.children);

    document.onkeydown = function (e) {
        console.log("Key down: " + e.code);
        switch (e.code) {
            case "ShiftLeft":
            case "ShiftRight":
                rubik.isShift = true;
                break;
            case "KeyU": // U for up face
                rubik.rotateU();
                break;
            case "KeyD": // D for down face
                rubik.rotateD();
                break;
            case "KeyC": // C for central face parallel to U and D
                rubik.rotateC();
                break;
            case "KeyF": // F for front face
                rubik.rotateF();
                break;
            case "KeyB": // B for back face
                rubik.rotateB();
                break;
            case "KeyH": // H for central face parallel to F and B
                rubik.rotateH();
                break;
            case "KeyR": // R for right face
                rubik.rotateR();
                break;
            case "KeyL": // L for left face
                rubik.rotateL();
                break;
            case "KeyM": // M for central face parallel to R and L
                rubik.rotateM();
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
        // TODO animate() all root elements in scene (in this case, only rubik)

        // RESET THE SCENE
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = utils.MakePerspective(60.0, aspect, 1.0, 2000.0);

        // Compute the camera matrix using look at.
        var cameraPosition = [10.0, -10.0, 0.0];
        var target = [0.0, 0.0, 0.0];
        var up = [0.0, 0.0, 1.0];
        cameraMatrix = utils.LookAt(cameraPosition, target, up);
        viewMatrix = utils.invertMatrix(cameraMatrix);

        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);

        rubik.updateWorldMatrix();

        // Compute all the matrices for rendering
        rubik.children.forEach(function (cubie) {
            //console.log(cubie);
            gl.useProgram(program);

            var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, cubie.worldMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(cubie.worldMatrix));

            // SINCE WE'LL HAVE DIFFERENT PROGRAMS THAT MAY REQUIRE PASSING DIFFERENT STUFF
            // WE MAY CONSIDER EXTRACTING THIS PART IN WebGL_utils.js AND HAVING A SWITCH CASE WITH CALLS TO
            // THE POSSIBLE INITIALIZATIONS.
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

            gl.uniform3fv(materialDiffColorHandle, [1.0, 0.0, 0.0]);
            gl.uniform3fv(lightColorHandle, directionalLightColor);
            gl.uniform3fv(lightDirectionHandle, directionalLight);

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

    utils.resizeCanvasToDisplaySize(gl.canvas);

    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);

    });
    gl.useProgram(program);

    main();
}

window.onload = init;