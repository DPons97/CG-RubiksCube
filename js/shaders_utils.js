var shaders_utils = {
    programs: [],
    curProgram: 0,
    texture: null,

    // Skybox
    skyboxProgram: null,
    skyboxTexture: null,
    
    // Animation
    lastUpdateTime: (new Date).getTime(),

    // changes the shader in a round robin fashion
    nextProgram: function (gl, cubies) {
        this.curProgram++;
        if (this.curProgram >= this.programs.length) this.curProgram = 0;

        // Update program attribute locations
        this.setProgramAttribLocations(gl, this.getProgram());
        this.initBuffers(gl, cubies);
        this.initShaderParams();
    },

    getProgram: function () {
        return this.programs[this.curProgram];
    },

    getSkyboxProgram: function () {
        return this.skyboxProgram;
    },

    programAttribLocations: {
        positionAttribute: null,
        normalAttribute: null,
        uvAttribute: null,
        textLocation: null,
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

    setProgramAttribLocations: function (gl, program) {
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

    skyboxAttribLocations: {
        skyboxTexHandle: null,
        skyboxVertPosAttr: null,
        inverseViewProjMatrixHandle: null
    },

    getSkyboxAttributesAndUniforms: function (gl) {
        //Uniforms
        this.skyboxAttribLocations.skyboxTexHandle = gl.getUniformLocation(this.skyboxProgram, "u_texture"); 
        this.skyboxAttribLocations.inverseViewProjMatrixHandle = gl.getUniformLocation(this.skyboxProgram, "inverseViewProjMatrix"); 
        this.skyboxAttribLocations.skyboxVertPosAttr = gl.getAttribLocation(this.skyboxProgram, "in_position");
    },

    initBuffers: function (gl, cubies) {
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

    currShaderParams: {
        ambientLightColor: [1.0, 1.0, 1.0],
        diffuseColor: [1.0, 1.0, 1.0],
        specularColor: [1.0, 1.0, 1.0],
        ambientLightLowColor: [1.0, 1.0, 1.0],
        SHLeftLightColor: [1.0, 1.0, 1.0],
        SHRightLightColor: [1.0, 1.0, 1.0],
        ambientMatColor: [1.0, 1.0, 1.0],
        emitColor: [1.0, 1.0, 1.0],

        lightColor: [1.0, 1.0, 1.0],
        Pos: [0, 0, 0],                 // Position of light
        DirTheta: 60,
        DirPhi: 45,
        ConeOut: 3,
        ConeIn: 0.8,
        Decay: 0,
        Target: 60,

        ADirTheta: 0,
        ADirPhi: 0,
        DTexMix: 1,
        SpecShine: 0.5,
        DToonTh: 0.5,
        SToonTh: 0.9,
    },

    // Set shader params such as light position, in/out cones, target, ambient color...
    initShaderParams: function () {
        switch (this.curProgram) {
            case 0:
                // #0 - Ambient color white - Default program
                this.currShaderParams.ambientLightColor = [1.0, 1.0, 1.0];
                break;
            case 1:
                // #1 - Direct light, Ambient, Lambert diffuse, Phong specular
                this.currShaderParams.ambientLightColor = [0.3, 0.7, 0.5];
                this.currShaderParams.diffuseColor = [0.1, 0.2, 0.3]
                this.currShaderParams.lightColor = [0.4, 0.9, 0.6];

                this.currShaderParams.Pos = [
                    5,
                    5,
                    5
                ];

                this.currShaderParams.SpecShine = 1.0;
                this.currShaderParams.specularColor = [0.8, 0.5, 1.0];
                break;
            case 2:
                // #2 - Spot light, Hemispheric, Lambert diffuse, Blinn specular
                this.currShaderParams.ambientLightLowColor = [.5, .8, .7];
                this.currShaderParams.ambientLightColor = [.8, 0.7, 0.5];

                this.currShaderParams.lightColor = [0.3, 0.1, 0.4];

                this.currShaderParams.Pos = [
                    15,
                    0,
                    0
                ];

                this.currShaderParams.DirTheta = 90;
                this.currShaderParams.DirPhi = 90;

                this.currShaderParams.ConeOut = 40;
                this.currShaderParams.ConeIn = 0.4;

                this.currShaderParams.SpecShine = 1.0;
                this.currShaderParams.specularColor = [0.8, 0.5, 1.0];
                break;
            case 3:
                // #3 - Spot light, Spherical Harm., Lambert, Phong specular
                this.currShaderParams.ambientLightLowColor = [.5, .5, .5];
                this.currShaderParams.SHLeftLightColor = [.7, 0.0, .7];
                this.currShaderParams.SHRightLightColor = [0.0, .7, .7];
                this.currShaderParams.ambientLightColor = [.33, 0.0, 0.0];

                this.currShaderParams.lightColor = [1, 1, 1];

                this.currShaderParams.Pos = [
                    5.3,
                    -3.09,
                    -6.31
                ];

                this.currShaderParams.DirTheta = 120;
                this.currShaderParams.DirPhi = 129;

                this.currShaderParams.ConeOut = 43.8;
                this.currShaderParams.ConeIn = 0.37;

                this.currShaderParams.SpecShine = 1.0;
                this.currShaderParams.specularColor = [0.8, 0.5, 1.0];
                break;
            case 4:
                // #4 - Direct light, animated Spherical Harm., animated Toon diffuse, animated Toon (Phong)
                this.currShaderParams.ambientLightLowColor = [1, 0, 0];
                this.currShaderParams.SHLeftLightColor = [1, 0.0, 1];
                this.currShaderParams.SHRightLightColor = [0.0, 1, 1];
                this.currShaderParams.ambientLightColor = [0.0, 1, 0.0];

                this.currShaderParams.lightColor = [1, 1, 1];

                this.currShaderParams.Pos = [
                    6.08,
                    7.14,
                    -6.66
                ];

                this.currShaderParams.specularColor = [.5, .5, .5];
                break;
        }
        this.initHtmlShaderParameters();
    },

    animateShaderParams: function () {
        var currentTime = (new Date).getTime();
        if (this.lastUpdateTime) {
            var deltaTime = (currentTime - this.lastUpdateTime) / 1000;

            switch (this.curProgram) {
                case 4:
                    const ANIMATION_SPEED = 50;     // +10 hue/s
                    // #4 - Direct light, animated Spherical Harm., animated Toon diffuse, animated Toon (Phong)
                    var hsvColors = [
                        utils.rgb2hsv(this.currShaderParams.ambientLightLowColor),
                        utils.rgb2hsv(this.currShaderParams.SHLeftLightColor),
                        utils.rgb2hsv(this.currShaderParams.SHRightLightColor),
                        utils.rgb2hsv(this.currShaderParams.ambientLightColor)
                    ];

                    hsvColors[0].h = (hsvColors[0].h + deltaTime * ANIMATION_SPEED) % 360;
                    hsvColors[1].h = (hsvColors[1].h + deltaTime * ANIMATION_SPEED) % 360;
                    hsvColors[2].h = (hsvColors[2].h + deltaTime * ANIMATION_SPEED) % 360;
                    hsvColors[3].h = (hsvColors[3].h + deltaTime * ANIMATION_SPEED) % 360;

                    this.currShaderParams.ambientLightLowColor = utils.hsv2rgb(hsvColors[0]);
                    this.currShaderParams.SHLeftLightColor = utils.hsv2rgb(hsvColors[1]);
                    this.currShaderParams.SHRightLightColor = utils.hsv2rgb(hsvColors[2]);
                    this.currShaderParams.ambientLightColor = utils.hsv2rgb(hsvColors[3]);

                    break;
                default:
                    break;
            }
        }
        this.lastUpdateTime = currentTime;
    },

    // Apply current shader parameters to current program
    setProgramShaderParams: function (gl, cubie, cameraPosition, viewProjectionMatrix) {
        // Vertex shader
        var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, cubie.worldMatrix);
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(cubie.worldMatrix));

        gl.uniformMatrix4fv(this.programAttribLocations.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(this.programAttribLocations.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
        gl.uniformMatrix4fv(this.programAttribLocations.vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(cubie.worldMatrix));

        gl.uniform4fv(this.programAttribLocations.ambientLightColor, this.currShaderParams.ambientLightColor.concat(1.0));
        gl.uniform4fv(this.programAttribLocations.ambientLightLowColor, this.currShaderParams.ambientLightLowColor.concat(1.0));
        gl.uniform4fv(this.programAttribLocations.SHLeftLightColor, this.currShaderParams.SHLeftLightColor.concat(1.0));
        gl.uniform4fv(this.programAttribLocations.SHRightLightColor, this.currShaderParams.SHLeftLightColor.concat(1.0));

        // Fragment shader
        gl.uniform3fv(this.programAttribLocations.eyePos, cameraPosition);
        gl.uniform3fv(this.programAttribLocations.Pos, this.currShaderParams.Pos);

        gl.uniform3fv(this.programAttribLocations.Dir, utils.anglesToDir(this.currShaderParams.DirTheta, this.currShaderParams.DirPhi));

        gl.uniform1f(this.programAttribLocations.ConeIn, this.currShaderParams.ConeIn);
        gl.uniform1f(this.programAttribLocations.ConeOut, this.currShaderParams.ConeOut);
        gl.uniform1f(this.programAttribLocations.Decay, this.currShaderParams.Decay);
        gl.uniform1f(this.programAttribLocations.Target, this.currShaderParams.Target);
        gl.uniform4fv(this.programAttribLocations.lightColor, this.currShaderParams.lightColor.concat(1.0));
        gl.uniform3fv(this.programAttribLocations.ADir, utils.anglesToDir(this.currShaderParams.ADirTheta, this.currShaderParams.ADirPhi));
        gl.uniform4fv(this.programAttribLocations.diffuseColor, this.currShaderParams.diffuseColor.concat(1.0));
        gl.uniform1f(this.programAttribLocations.DTexMix, this.currShaderParams.DTexMix);
        gl.uniform4fv(this.programAttribLocations.specularColor, this.currShaderParams.specularColor.concat(1.0));
        gl.uniform1f(this.programAttribLocations.SpecShine, this.currShaderParams.SpecShine);
        gl.uniform1f(this.programAttribLocations.DToonTh, this.currShaderParams.DToonTh);
        gl.uniform1f(this.programAttribLocations.SToonTh, this.currShaderParams.SToonTh);
        gl.uniform4fv(this.programAttribLocations.ambientMatColor, this.currShaderParams.ambientMatColor.concat(1.0));
        gl.uniform4fv(this.programAttribLocations.emitColor, this.currShaderParams.emitColor.concat(1.0));

        // Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.programAttribLocations.textLocation, 0);
    },

    // Initialize shader parameters in html page
    initHtmlShaderParameters: function () {
        document.getElementById("texP").value = this.currShaderParams.DTexMix;

        document.getElementById("posX").value = this.currShaderParams.Pos[0];
        document.getElementById("posY").value = this.currShaderParams.Pos[1];
        document.getElementById("posZ").value = this.currShaderParams.Pos[2];

        document.getElementById("dirT").value = this.currShaderParams.DirPhi;
        document.getElementById("dirP").value = this.currShaderParams.DirTheta;

        document.getElementById("coneIn").value = this.currShaderParams.ConeIn;
        document.getElementById("coneOut").value = this.currShaderParams.ConeOut;
    },

    // Skybox
    LoadEnvironment: function(gl, baseDir) {
        skyboxVertPos = new Float32Array(
        [
          -1, -1, 1.0,
           1, -1, 1.0,
          -1,  1, 1.0,
          -1,  1, 1.0,
           1, -1, 1.0,
           1,  1, 1.0,
        ]);
        
        skyboxVao = gl.createVertexArray();
        gl.bindVertexArray(skyboxVao);
        
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.skyboxAttribLocations.skyboxVertPosAttr);
        gl.vertexAttribPointer(this.skyboxAttribLocations.skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);
        
        this.skyboxTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0+3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.skyboxTexture);
        
        var envTexDir = baseDir+"env/";     
        const faceInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
                url: envTexDir+'posx.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                url: envTexDir+'negx.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
                url: envTexDir+'posy.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                url: envTexDir+'negy.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
                url: envTexDir+'posz.png',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
                url: envTexDir+'negz.png',
            },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;
            
            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1024;
            const height = 1024;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            
            // setup each face so it's immediately renderable
            gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
            
            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function() {
                // Now that the image has loaded upload it to the texture.
                gl.activeTexture(gl.TEXTURE0+3);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, shaders_utils.skyboxTexture);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        
            
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
}