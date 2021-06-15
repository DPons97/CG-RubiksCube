#version 300 es

precision mediump float;

out vec4 outColor;
in vec2 fsUV;

uniform sampler2D inTexture;
uniform vec4 ambientLightColor;
uniform float texturePercentage;

void main(){
  vec4 texcol=texture(inTexture,fsUV);
  
  // Ambient
  vec4 ambient=ambientLightColor*(1.-texturePercentage)+texturePercentage*texcol;
  
  outColor=clamp(ambient,0.,1.);
}