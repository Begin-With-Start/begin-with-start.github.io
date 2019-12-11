#version 100

precision mediump float;

varying vec2 vTexCoords;

uniform sampler2D sImage;

const vec3 W = vec3(0.2125, 0.7154, 0.0721);

void main()
{
  vec4 color = texture2D(sImage, vTexCoords);
  float luma = dot(color.rgb, W);
  gl_FragColor = vec4(luma, luma, luma, color.a);
}
