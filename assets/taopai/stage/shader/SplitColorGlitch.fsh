#version 100

precision mediump float;

varying vec2 vTexCoords[3];

uniform sampler2D sImage;

void main() {
  float r = texture2D(sImage, vTexCoords[0]).r;
  float g = texture2D(sImage, vTexCoords[1]).g;
  float b = texture2D(sImage, vTexCoords[2]).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
