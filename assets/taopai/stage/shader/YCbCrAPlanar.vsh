#version 100

precision highp float;

uniform mat4  uMVP;

uniform mat4  uMatrixY;
uniform mat4  uMatrixChroma;
uniform mat4  uMatrixA;

attribute vec2 aPosition;
attribute vec2 aTexCoords;

varying vec2 vTexCoordsY;
varying vec2 vTexCoordsChroma;
varying vec2 vTexCoordsA;

void main()
{
  vec4 tex_coords = vec4(aTexCoords, 0.0, 1.0);

  vTexCoordsY      = (uMatrixY      * tex_coords).xy;
  vTexCoordsChroma = (uMatrixChroma * tex_coords).xy;
  vTexCoordsA      = (uMatrixA      * tex_coords).xy;

  gl_Position = uMVP * vec4(aPosition, 0, 1);
}
