#version 100

precision mediump float;

varying vec2 vTexCoordsY;
varying vec2 vTexCoordsChroma;
varying vec2 vTexCoordsA;

uniform sampler2D sImageY;
uniform sampler2D sImageCb;
uniform sampler2D sImageCr;
uniform sampler2D sImageA;

void main()
{
  const mat3 bt601pc =
      mat3( 1.0,  1.0,    1.0,
            0.0, -0.343,  1.765,
            1.4, -0.711,  0.0);

  float y = texture2D(sImageY,  vTexCoordsY).r;
  float u = texture2D(sImageCb, vTexCoordsChroma).a - 0.5;
  float v = texture2D(sImageCr, vTexCoordsChroma).r - 0.5;
  float a = texture2D(sImageA,  vTexCoordsA).a;

  vec3 rgb = bt601pc * vec3(y, u, v);

  gl_FragColor = vec4(rgb, a);
}
