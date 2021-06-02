var program;
var gl;
var shaderDir; 
var baseDir;

function main() {

    var lastUpdateTime = (new Date).getTime();

    // TODO: HERE LOAD STUFF 




    // TODO: SET UP THE CUBIES AND RUBIK OBJECTS
    //rubik = new Rubik


    drawScene();

    function animate(){
        var currentTime = (new Date).getTime();
        if(lastUpdateTime){
        var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        cubeRx += deltaC;
        cubeRy -= deltaC;
        cubeRz += deltaC;
        }
        worldMatrix = utils.MakeWorld(  0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0);
        lastUpdateTime = currentTime;               
    }


    function drawScene() {
        
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
        var cameraMatrix = utils.LookAt(cameraPosition, target, up);
        var viewMatrix = utils.invertMatrix(cameraMatrix);
    
        var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);
    
        
        // Compute all the matrices for rendering
        rubik.children.forEach(function(object) {
          
            gl.useProgram(object.drawInfo.programInfo);
            
            var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, object.worldMatrix);
            var normalMatrix = utils.invertMatrix(utils.transposeMatrix(object.worldMatrix));
            
            // SINCE WE'LL HAVE DIFFERENT PROGRAMS THAT MAY REQUIRE PASSING DIFFERENT STUFF
            // WE MAY CONSIDER EXTRACTING THIS PART IN WebGL_utils.js AND HAVING A SWITCH CASE WITH CALLS TO
            // THE POSSIBLE INITIALIZATIONS.
            gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
            gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
        
            gl.uniform3fv(materialDiffColorHandle, object.drawInfo.materialColor);
            gl.uniform3fv(lightColorHandle,  directionalLightColor);
            gl.uniform3fv(lightDirectionHandle,  directionalLight);
        
            gl.bindVertexArray(object.drawInfo.vertexArray);
            gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
            
    
        });
    
        window.requestAnimationFrame(drawScene);
    }
}




async function init(){
  
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir+"shaders/";

    var canvas = document.getElementById("c");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }

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