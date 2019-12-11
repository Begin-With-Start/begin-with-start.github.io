#version 100

uniform float uPixelWidth;

uniform mat4 uImageMatrix;

attribute vec4 aPosition;
attribute vec2 aTexCoords;

varying vec2 vTexCoords[4];

void main()
{
  vec2 l = (uImageMatrix * vec4(0, 0, 0, 1)).st;
  vec2 r = (uImageMatrix * vec4(1, 0, 0, 1)).st;

  vec2 offset = 0.5 * uPixelWidth * (r - l);

  vec2 tex_coords = (uImageMatrix * vec4(aTexCoords, 0, 1)).st;

  vTexCoords[0] = tex_coords - 3.0 * offset;
  vTexCoords[1] = tex_coords - offset;
  vTexCoords[2] = tex_coords + offset;
  vTexCoords[3] = tex_coords + 3.0 * offset;

  gl_Position = aPosition;
}
