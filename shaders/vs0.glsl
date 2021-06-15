#version 300 es

in vec3 inPosition;
in vec2 inUV;
out vec2 fsUV;

uniform mat4 matrix; 

void main() {
  fsUV = inUV;
  gl_Position = matrix * vec4(inPosition, 1.0);
}