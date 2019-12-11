#version 100

precision mediump float;

varying vec2 vTexCoordsY;
varying vec2 vTexCoordsChroma;

uniform sampler2D sImageY;
uniform sampler2D sImageCrCb;

void main()
{
  const mat3 bt601pc =
      mat3( 1.0,  1.0,    1.0,
            0.0, -0.343,  1.765,
            1.4, -0.711,  0.0);

  float y = texture2D(sImageY, vTexCoordsY).r;
  vec2 uv = texture2D(sImageCrCb, vTexCoordsChroma).ar - vec2(0.5, 0.5);

  vec3 rgb = bt601pc * vec3(y, uv);
  gl_FragColor = vec4(rgb, 1.0);
}
