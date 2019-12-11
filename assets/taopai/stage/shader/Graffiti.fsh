precision mediump float;

// 0 - 1
// 2 - 3
// 4 - 5
varying vec2 vTexCoords[6];

uniform sampler2D sImage;

uniform vec3      uColor;

const vec3 W = vec3(0.2125, 0.7154, 0.0721);

const float threshold = 0.5;

void main()
{

  float lt = dot(W, texture2D(sImage, vTexCoords[0]).rgb);
  float rt = dot(W, texture2D(sImage, vTexCoords[1]).rgb);
  float t  = dot(W, texture2D(sImage, mix(vTexCoords[0], vTexCoords[1], 0.5)).rgb);

  float l  = dot(W, texture2D(sImage, vTexCoords[2]).rgb);
  float r  = dot(W, texture2D(sImage, vTexCoords[3]).rgb);
  float c  = dot(W, texture2D(sImage, mix(vTexCoords[2], vTexCoords[3], 0.5)).rgb);

  float lb = dot(W, texture2D(sImage, vTexCoords[4]).rgb);
  float rb = dot(W, texture2D(sImage, vTexCoords[5]).rgb);
  float b  = dot(W, texture2D(sImage, mix(vTexCoords[4], vTexCoords[5], 0.5)).rgb);

  float h = - lt - 2.0 * t - rt + lb + 2.0 * b + rb;
  float v = - lb - 2.0 * l - lt + rb + 2.0 * r + rt;

  float mag = length(vec2(h, v));
  float thresholdTest = 1.0 - step(threshold, mag);

  gl_FragColor = vec4(mix(vec3(c), uColor, 0.5) * thresholdTest, 1.0);
}
