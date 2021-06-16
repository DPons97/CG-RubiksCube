var shaders_utils = {
    programs: [],
    curProgram: 0,
    texture: null,

    // TODO WE CAN ADD A SKYSPHERE HERE

    // changes the shader in a round robin fashion
    nextProgram: function(gl, cubies) {
        curProgram++;
        if (this.curProgram >= this.programs.length) curProgram = 0;

        // Update program attribute locations
        this.setProgramAttribLocations(gl, this.getProgram());
        this.initBuffers(gl, cubies);
        this.initShaderParams();
    },

    getProgram: function() {
        return this.programs[this.curProgram];
    },

    programAttribLocations: {
        positionAttribute: null,
        normalAttribute: null,
        uvAttribute: null,
        textLocation: null,             // FIX
        matrixLocation: null,
        vertexMatrixPositionHandle: null,
        normalMatrixPositionHandle: null,
        ambientLightColor: null,
        ambientLightLowColor: null,
        SHLeftLightColor: null,
        SHRightLightColor: null,
        eyePos: null,
        Pos: null,
        Dir: null,
        ConeOut: null,
        ConeIn: null,
        Decay: null,
        Target: null,
        lightColor: null,
        ADir: null,
        diffuseColor: null,
        DTexMix: null,
        specularColor: null,
        SpecShine: null,
        DToonTh: null,
        SToonTh: null,
        ambientMatColor: null,
        emitColor: null
    },

    setProgramAttribLocations: function(gl, program) {
        // Vertices, normals and UVs
        this.programAttribLocations.positionAttribute = gl.getAttribLocation(program, "inPosition");
        this.programAttribLocations.normalAttribute = gl.getAttribLocation(program, "inNormal");
        this.programAttribLocations.uvAttribute = gl.getAttribLocation(program, "inUV");
        this.programAttribLocations.matrixLocation = gl.getUniformLocation(program, "matrix");
        this.programAttribLocations.vertexMatrixPositionHandle = gl.getUniformLocation(program, "pMatrix");
        this.programAttribLocations.normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');

        // Vertex shader uniforms
        this.programAttribLocations.texturePercentage = gl.getUniformLocation(program, 'texturePercentage');      // reintroduce
        this.programAttribLocations.ambientLightColor = gl.getUniformLocation(program, 'ambientLightColor');
        this.programAttribLocations.ambientLightLowColor = gl.getUniformLocation(program, 'ambientLightLowColor');
        this.programAttribLocations.SHLeftLightColor = gl.getUniformLocation(program, 'SHLeftLightColor');
        this.programAttribLocations.SHRightLightColor = gl.getUniformLocation(program, 'SHRightLightColor');

        // Fragment shader uniforms
        this.programAttribLocations.textLocation = gl.getUniformLocation(program, "inTexture");
        this.programAttribLocations.eyePos = gl.getUniformLocation(program, 'eyePos');        // vec3 eyePos
        this.programAttribLocations.Pos = gl.getUniformLocation(program, 'Pos');
        this.programAttribLocations.Dir = gl.getUniformLocation(program, 'Dir');
        this.programAttribLocations.ConeOut = gl.getUniformLocation(program, 'ConeOut');
        this.programAttribLocations.ConeIn = gl.getUniformLocation(program, 'ConeIn');
        this.programAttribLocations.Decay = gl.getUniformLocation(program, 'Decay');
        this.programAttribLocations.Target = gl.getUniformLocation(program, 'Target');
        this.programAttribLocations.lightColor = gl.getUniformLocation(program, 'lightColor');
        this.programAttribLocations.ADir = gl.getUniformLocation(program, 'ADir');
        this.programAttribLocations.diffuseColor = gl.getUniformLocation(program, 'diffuseColor');
        this.programAttribLocations.DTexMix = gl.getUniformLocation(program, 'DTexMix');
        this.programAttribLocations.specularColor = gl.getUniformLocation(program, 'specularColor');
        this.programAttribLocations.SpecShine = gl.getUniformLocation(program, 'SpecShine');
        this.programAttribLocations.DToonTh = gl.getUniformLocation(program, 'DToonTh');
        this.programAttribLocations.SToonTh = gl.getUniformLocation(program, 'SToonTh');
        this.programAttribLocations.ambientMatColor = gl.getUniformLocation(program, 'ambientMatColor');
        this.programAttribLocations.emitColor = gl.getUniformLocation(program, 'emitColor');
    },

    initBuffers: function(gl, cubies) {
        cubies.forEach((cubie) => {
            var vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            cubie.setVao(vao);
    
            // Vertices coordinates
            var positionBuffer = cubie.drawInfo.vertexBuffer
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubie.drawInfo.vertices), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.programAttribLocations.positionAttribute);
            gl.vertexAttribPointer(this.programAttribLocations.positionAttribute, 3, gl.FLOAT, false, 0, 0);
    
            // Normals
            var normalBuffer = cubie.drawInfo.normalBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubie.drawInfo.vertexNormal), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.programAttribLocations.normalAttribute);
            gl.vertexAttribPointer(this.programAttribLocations.normalAttribute, 3, gl.FLOAT, false, 0, 0);
    
            // Triangle indices
            var indexBuffer = cubie.drawInfo.indexBuffer;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubie.drawInfo.indices), gl.STATIC_DRAW);
    
            // UV coordinates
            var uvBuffer = cubie.drawInfo.textureBuffer
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubie.drawInfo.textures), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.programAttribLocations.uvAttribute);
            gl.vertexAttribPointer(this.programAttribLocations.uvAttribute, 2, gl.FLOAT, false, 0, 0);
        })
    },

    defShaderParams: {
        ambientLightColor: [0.0, 0.0, 0.0],
        diffuseColor:  [0.0, 0.0, 0.0],
        specularColor:  [0.0, 0.0, 0.0],
        ambientLightLowColor:  [0.0, 0.0, 0.0],
        SHLeftLightColor:  [0.0, 0.0, 0.0],
        SHRightLightColor:  [0.0, 0.0, 0.0],
        ambientMatColor:  [0.0, 0.0, 0.0],
        emitColor:  [0.0, 0.0, 0.0],
    
        lightColor:  [0.0, 0.0, 0.0],
        Pos: [0, 0, 0],
        DirTheta: 60,
        DirPhi: 45,
        ConeOut: 30,
        ConeIn: 80,
        Decay: 0,
        Target: 61,
    
        ADirTheta: 0,
        ADirPhi: 0,
        DTexMix: 100,
        SpecShine: 100,
        DToonTh: 50,
        SToonTh: 90,
    },

    currShaderParams: {
        ambientLightColor: [0.0, 0.0, 0.0],
        diffuseColor:  [0.0, 0.0, 0.0],
        specularColor:  [0.0, 0.0, 0.0],
        ambientLightLowColor:  [0.0, 0.0, 0.0],
        SHLeftLightColor:  [0.0, 0.0, 0.0],
        SHRightLightColor:  [0.0, 0.0, 0.0],
        ambientMatColor:  [0.0, 0.0, 0.0],
        emitColor:  [0.0, 0.0, 0.0],
    
        lightColor:  [0.0, 0.0, 0.0],
        Pos: [0, 0, 0],                 // Position of light
        DirTheta: 60,
        DirPhi: 45,
        ConeOut: 30,
        ConeIn: 80,
        Decay: 0,
        Target: 61,
    
        ADirTheta: 0,
        ADirPhi: 0,
        DTexMix: 100,
        SpecShine: 100,
        DToonTh: 50,
        SToonTh: 90,
    },

    // Set shader params such as light position, in/out cones, target, ambient color...
    initShaderParams: function() {
        switch (this.curProgram){
            case 0:
                // #0 - Ambient color white - Default program
                this.currShaderParams.ambientLightColor = [0.0, 0.0, 0.0];
                this.currShaderParams.DTexMix = texP;
                break;
            case 1:
                // #1 - Direct light, Ambient, Lambert diffuse, Phong specular
                
                break;
            case 2:
                // #2 - Spot light, Hemispheric, Lambert diffuse, Blinn specular

                break;
            case 3:
                // #3 - Spot light, Spherical Harm., Lambert, Toon (Phong)

                break;
        }
    },

    // Apply current shader parameters to current program
    setProgramShaderParams: function(gl, cubie, cameraPosition, viewProjectionMatrix) {
        // Vertex shader
        var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, cubie.worldMatrix);
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(cubie.worldMatrix));

        gl.uniformMatrix4fv(this.programAttribLocations.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(this.programAttribLocations.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
        gl.uniformMatrix4fv(this.programAttribLocations.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubie.worldMatrix));

        gl.uniform4fv(this.programAttribLocations.ambientLightColor, [this.currShaderParams.ambientLightColor, 1]);
        gl.uniform4fv(this.programAttribLocations.ambientLightLowColor, [this.currShaderParams.ambientLightLowColor, 1]);
        gl.uniform4fv(this.programAttribLocations.SHLeftLightColor, [this.currShaderParams.SHLeftLightColor, 1]);
        gl.uniform4fv(this.programAttribLocations.SHRightLightColor, [this.currShaderParams.SHLeftLightColor, 1]);

        // Fragment shader
        gl.uniform3fv(this.programAttribLocations.eyePos, cameraPosition);
        gl.uniform3fv(this.programAttribLocations.Pos, this.currShaderParams.Pos);

        gl.uniform3fv(this.programAttribLocations.Dir, utils.anglesToDir(this.currShaderParams.DirTheta, this.currShaderParams.DirPhi));

        gl.uniform1f(this.programAttribLocations.ConeIn, this.currShaderParams.ConeIn);
        gl.uniform1f(this.programAttribLocations.ConeOut, this.currShaderParams.ConeOut);
        gl.uniform1f(this.programAttribLocations.Decay, this.currShaderParams.Decay);
        gl.uniform1f(this.programAttribLocations.Target, this.currShaderParams.Target);
        gl.uniform4fv(this.programAttribLocations.lightColor, [this.currShaderParams.lightColor, 1]);
        gl.uniform3fv(this.programAttribLocations.Dir, utils.anglesToDir(this.currShaderParams.ADirTheta, this.currShaderParams.ADirPhi));
        gl.uniform4fv(this.programAttribLocations.diffuseColor, [this.currShaderParams.diffuseColor, 1]);
        gl.uniform1f(this.programAttribLocations.DTexMix, this.currShaderParams.DTexMix);
        gl.uniform4fv(this.programAttribLocations.specularColor, [this.currShaderParams.specularColor, 1]);
        gl.uniform1f(this.programAttribLocations.SpecShine, this.currShaderParams.SpecShine);
        gl.uniform1f(this.programAttribLocations.DToonTh, this.currShaderParams.DToonTh);
        gl.uniform1f(this.programAttribLocations.SToonTh, this.currShaderParams.SToonTh);
        gl.uniform4fv(this.programAttribLocations.ambientMatColor, [this.currShaderParams.ambientMatColor, 1]);
        gl.uniform4fv(this.programAttribLocations.emitColor, [this.currShaderParams.emitColor, 1]);

        // Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.programAttribLocations.textLocation, 0);
    }
}