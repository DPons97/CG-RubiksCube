#version 300 es

precision mediump float;

in vec3 fsNormal;
out vec4 outColor;
in vec2 fsUV;
uniform sampler2D inTexture;

uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 

void main() {

  vec3 nNormal = normalize(fsNormal);
  vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection,nNormal);
  outColor = texture(inTexture, fsUV); //vec4(clamp(lambertColor, 0.00, 1.0),1.0);
}