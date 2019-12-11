precision mediump float;
varying vec2 vTextureCo;
uniform sampler2D inputImageTexture;
void main() {
    gl_FragColor = texture2D( inputImageTexture, textureCoordinate);
}