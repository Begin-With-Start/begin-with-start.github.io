#version 100
#extension GL_OES_EGL_image_external: require

precision mediump float;

uniform samplerExternalOES sImage;

varying vec2 vTexCoords[4];

float RGBToY(vec3 color)
{
  return dot(vec3(0.299, 0.587, 0.114), color);
}

void main()
{
  float y0 = RGBToY(texture2D(sImage, vTexCoords[0]).rgb);
  float y1 = RGBToY(texture2D(sImage, vTexCoords[1]).rgb);
  float y2 = RGBToY(texture2D(sImage, vTexCoords[2]).rgb);
  float y3 = RGBToY(texture2D(sImage, vTexCoords[3]).rgb);

  gl_FragColor = vec4(y0, y1, y2, y3);
}
