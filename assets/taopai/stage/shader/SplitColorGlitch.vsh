#version 100

precision highp float;

uniform mat4  uMVP;

uniform mat4  uMatrixImage;

uniform vec2  uTexCoordsOffset[3];

attribute vec2 aPosition;
attribute vec2 aTexCoords;

varying vec2 vTexCoords[3];

void main()
{

  for (int i = 0; i < 3; ++ i) {
    vec4 tex_coords = vec4(aTexCoords + uTexCoordsOffset[i], 0.0, 1.0);
    vTexCoords[i] = (uMatrixImage * tex_coords).xy;
  }

  gl_Position = uMVP * vec4(aPosition, 0, 1);
}
