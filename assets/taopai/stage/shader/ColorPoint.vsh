#version 100

precision highp float;

uniform mat4    uMVP;
uniform float   uPointSize;

attribute vec4  aPosition;
attribute vec4  aColor;

varying vec4 vColor;

void main()
{
  vColor = aColor;
  gl_PointSize = uPointSize;
  gl_Position = uMVP * aPosition;
}
