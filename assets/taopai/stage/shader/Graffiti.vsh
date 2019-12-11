#version 100

precision highp float;

attribute vec4 aPosition;
attribute vec2 aTexCoords;

uniform mat4 uMVP;
uniform mat4 uMatrixImage;
uniform vec2 uTexelSize;

// 0 - 1
// 2 - 3
// 4 - 5
varying vec2 vTexCoords[6];

void main(void) {
   gl_Position = uMVP * aPosition;

   vec2 lt = vec2(-uTexelSize.x, uTexelSize.y);
   vec2 rt = vec2(uTexelSize.x, uTexelSize.y);

   vec2 l = vec2(-uTexelSize.x, 0.0);
   vec2 r = vec2(uTexelSize.x, 0.0);

   vec2 lb = vec2(-uTexelSize.x, -uTexelSize.y);
   vec2 rb = vec2(uTexelSize.x, -uTexelSize.y);

   vTexCoords[0] = (uMatrixImage * vec4(aTexCoords + lt, 0.0, 1.0)).xy;
   vTexCoords[1] = (uMatrixImage * vec4(aTexCoords + rt, 0.0, 1.0)).xy;
   vTexCoords[2] = (uMatrixImage * vec4(aTexCoords +  l, 0.0, 1.0)).xy;
   vTexCoords[3] = (uMatrixImage * vec4(aTexCoords +  r, 0.0, 1.0)).xy;
   vTexCoords[4] = (uMatrixImage * vec4(aTexCoords + lb, 0.0, 1.0)).xy;
   vTexCoords[5] = (uMatrixImage * vec4(aTexCoords + rb, 0.0, 1.0)).xy;
}
