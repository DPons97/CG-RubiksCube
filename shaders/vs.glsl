#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;
in vec2 inUV;
out vec2 fsUV;

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
  fsUV = inUV;
  fsNormal = mat3(nMatrix) * inNormal; 
  gl_Position = matrix * vec4(inPosition, 1.0);
}