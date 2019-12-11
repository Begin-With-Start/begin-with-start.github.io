precision mediump float;
varying vec2 textureCoordinate;
uniform sampler2D inputImageTexture;
const highp vec3 CO = vec3(0.2125, 0.7154, 0.0721);

void main() {
    gl_FragColor=vec4(vec3(dot(texture2D( inputImageTexture, textureCoordinate).rgb,CO)),1.0);
}