#version 100

precision highp float;

uniform mat4  uMVP;

uniform mat4  uMatrixImage;

attribute vec2  aPosition;
attribute vec4  aTexCoords;

varying vec2 vTexCoords;

void main()
{
  vTexCoords = (uMatrixImage * aTexCoords).xy;

  gl_Position = uMVP * vec4(aPosition, 0, 1);
}
