var program;
var gl;
var shaderDir;
var baseDir;
var vao;
var viewMatrix;
var cameraMatrix;
var projectionMatrix;
var worldMatrix;
var rubik;

import Rubik from './Rubik.js';
import Cubie from './Cubie.js';

async function loadModel(modelName) {
    //This line must be in an async function
    var pathToModel = baseDir + "/models/"
    var objStr = await utils.get_objstr(pathToModel + modelName);
    var objModel = new OBJ.Mesh(objStr);
    var modelVertices = objModel.vertices; //Array of vertices
    var modelNormals = objModel.normals; //Array of normals
    var modelIndices = objModel.indices; //Array of indices
    var modelTexCoords = objModel.textures; //Array of uv coordinate
    return [modelVertices, modelNormals, modelIndices, modelTexCoords]
}

function main() {

    var model = loadModel("cube00.obj")

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

    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model[0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model[1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model[2]), gl.STATIC_DRAW);

    var cubies = new Array(9);
    // TODO: SET UP THE CUBIES AND RUBIK OBJECTS
    for (let i = 0; i < 9; i++) {
        cubies[i] = new Cubie(program, vao);
    }

    rubik = new Rubik(cubies, [])

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
        var cameraPosition = [0.0, -200.0, 0.0];
        var target = [0.0, 0.0, 0.0];
        var up = [0.0, 0.0, 1.0];
        cameraMatrix = utils.LookAt(cameraPosition, target, up);
        viewMatrix = utils.invertMatrix(cameraMatrix);

        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);

        rubik.updateWorldMatrix();

        // Compute all the matrices for rendering
        rubik.children.forEach(function (object) {
            gl.useProgram(object.drawInfo.programInfo);

            var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, object.worldMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(object.worldMatrix));

            // SINCE WE'LL HAVE DIFFERENT PROGRAMS THAT MAY REQUIRE PASSING DIFFERENT STUFF
            // WE MAY CONSIDER EXTRACTING THIS PART IN WebGL_utils.js AND HAVING A SWITCH CASE WITH CALLS TO
            // THE POSSIBLE INITIALIZATIONS.
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));

            gl.uniform3fv(materialDiffColorHandle, object.drawInfo.materialColor);
            gl.uniform3fv(lightColorHandle, directionalLightColor);
            gl.uniform3fv(lightDirectionHandle, directionalLight);

            gl.bindVertexArray(object.drawInfo.vertexArray);
            gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0);

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
        console.log(vertexShader);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);

    });
    gl.useProgram(program);

    main();
}

window.onload = init;