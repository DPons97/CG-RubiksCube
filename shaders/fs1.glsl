#version 300 es
precision highp float;

in vec3 fsPosition;
in vec3 fsNormal;
in vec2 fsUV;

in vec4 SHconstColor;// For spherical harmonics, constant term
in vec4 SHDeltaLxColor;// For spherical harmonics, DeltaLx color
in vec4 SHDeltaLyColor;// For spherical harmonics, DeltaLy color
in vec4 SHDeltaLzColor;// For spherical harmonics, DeltaLz color

uniform sampler2D inTexture;
uniform float texturePercentage;// Implement

uniform vec3 eyePos;

// Light (A) params
uniform vec3 Pos;
uniform vec3 Dir;
uniform float ConeOut;
uniform float ConeIn;
uniform float Decay;
uniform float Target;
uniform vec4 lightColor;

// Other params
uniform vec4 ambientLightColor;
uniform vec4 ambientLightLowColor;
uniform vec3 ADir;
uniform vec4 diffuseColor;
uniform float DTexMix;// Texture percentage
uniform vec4 specularColor;
uniform float SpecShine;
uniform float DToonTh;
uniform float SToonTh;
uniform vec4 ambientMatColor;
uniform vec4 emitColor;

out vec4 color;

void main(){
  // Texture color loading
  vec4 texcol=texture(inTexture,fsUV);
  
  // diffuse color (m_D)
  vec4 diffColor=diffuseColor*(1.-DTexMix)+texcol*DTexMix;
  
  // material ambient color (m_A)
  vec4 ambColor=ambientMatColor*(1.-DTexMix)+texcol*DTexMix;
  
  // emitted color
  vec4 emit=emitColor*(1.-DTexMix)+
  texcol*DTexMix*
  max(max(emitColor.r,emitColor.g),emitColor.b);
  
  vec3 normalVec=normalize(fsNormal);// direction of the normal vecotr to the surface
  vec3 eyedirVec=normalize(eyePos-fsPosition);// looking direction
  
  // Light model
  // To add additional lights, define also lightDir[B-Z] and lightColor[B-Z]
  vec3 lightDirA;
  vec4 lightColorA;
  vec4 ambientLight;
  
  // --------- START Code for lights composition ---------
  
  // Direct light
  lightDirA=normalize(Pos-fsPosition);
  lightColorA=lightColor;
  
  // Ambient
  ambientLight=ambientLightColor;
  
  // --------- END LIGHT COMPOSITION ---------
  
  // BRDF out color
  vec4 out_color;
  
  // --------- START Code for BRDF ---------
  
  // Lambert diffuse
  vec4 LAcontr=diffColor*clamp(dot(lightDirA,normalVec),0.,1.)*lightColorA;
  
  // Phong specular
  vec3 hA=normalize(lightDirA+eyedirVec);
  vec4 SAcontr=pow(clamp(dot(normalVec,hA),0.,1.),SpecShine)*lightColorA;
  
  out_color=clamp(ambientLight*ambColor+diffColor*LAcontr+specularColor*SAcontr,0.,1.);
  
  // --------- END BRDF ---------
  
  color=vec4(out_color.rgb,1.);
}
