varying highp vec2 textureCoordinate;
uniform sampler2D inputImageTexture;
uniform highp float scale;
uniform lowp float mixPercent;
void main() {
    lowp vec4 orignColor = texture2D(inputImageTexture, textureCoordinate);
    highp vec2 newCoordinateToUse = textureCoordinate;
    highp vec2 centerCoordinate = vec2(0.5, 0.5);
    newCoordinateToUse -= centerCoordinate;
    newCoordinateToUse = newCoordinateToUse / scale;
    newCoordinateToUse += centerCoordinate;
    lowp vec4 newColor = texture2D(inputImageTexture, newCoordinateToUse);
    gl_FragColor = mix(orignColor, newColor, mixPercent);
}