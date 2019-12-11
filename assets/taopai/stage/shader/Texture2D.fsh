#version 100

precision mediump float;

varying vec2 vTexCoords;

uniform sampler2D sImage;

void main()
{
  gl_FragColor = texture2D(sImage, vTexCoords);
}
