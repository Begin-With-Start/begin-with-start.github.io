#version 100
#extension GL_OES_EGL_image_external: require

precision mediump float;

varying vec2 vTexCoords;

uniform samplerExternalOES sImage;

void main()
{
  gl_FragColor = texture2D(sImage, vTexCoords);
}
