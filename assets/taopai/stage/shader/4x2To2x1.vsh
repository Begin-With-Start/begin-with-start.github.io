#version 100

uniform float uPixelWidth;

uniform mat4 uImageMatrix;

attribute vec4 aPosition;
attribute vec2 aTexCoords;

varying vec2 vTexCoords[2];

void main()
{
  vec2 l = (uImageMatrix * vec4(0, 0, 0, 1)).st;
  vec2 r = (uImageMatrix * vec4(1, 0, 0, 1)).st;

  vec2 offset = uPixelWidth * (r - l);

  vec2 tex_coords = (uImageMatrix * vec4(aTexCoords, 0, 1)).st;

  vTexCoords[0] = tex_coords - offset;
  vTexCoords[1] = tex_coords + offset;

  gl_Position = aPosition;
}
