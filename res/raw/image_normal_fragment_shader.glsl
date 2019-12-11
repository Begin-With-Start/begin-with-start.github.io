precision mediump float;
varying vec2 textureCoordinate;
uniform sampler2D s_texture;

void main() {
    vec4 color=texture2D( s_texture, textureCoordinate );
    gl_FragColor =color;
}
