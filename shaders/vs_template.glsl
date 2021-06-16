#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

in vec3 inPosition;
in vec3 inNormal;
in vec2 inUV;

uniform mat4 matrix;
uniform mat4 pMatrix;
uniform mat4 nMatrix;
uniform vec4 ambientLightColor;
uniform vec4 ambientLightLowColor;
uniform vec4 SHLeftLightColor;
uniform vec4 SHRightLightColor;

out vec3 fsPosition;
out vec3 fsNormal;
out vec2 fsUV;

out vec4 SHconstColor;		// For spherical harmonics, constant term
out vec4 SHDeltaLxColor;		// For spherical harmonics, DeltaLx color
out vec4 SHDeltaLyColor;		// For spherical harmonics, DeltaLy color
out vec4 SHDeltaLzColor;		// For spherical harmonics, DeltaLz color


void main() {
    fsNormal = mat3(nMatrix)*inNormal;
	fsPosition = (pMatrix * vec4(inPosition, 1.0)).xyz;
	fsUV = vec2(inUV.x, 1.0-inUV.y);
	
	gl_Position = matrix * vec4(inPosition, 1.0);
	
	const mat4 McInv = mat4(vec4(0.25,0.0,-0.25,0.7071),vec4(0.25,0.6124,-0.25,-0.3536),vec4(0.25,-0.6124,-0.25,-0.3536),vec4(0.25,0.0,0.75,0.0));
	mat4 InCols = transpose(mat4(ambientLightLowColor, SHRightLightColor, SHLeftLightColor, ambientLightColor));
	mat4 OutCols = transpose(McInv * InCols);

	SHconstColor = OutCols[0];
	SHDeltaLxColor = OutCols[1];
	SHDeltaLyColor = OutCols[2];
	SHDeltaLzColor = OutCols[3];
}