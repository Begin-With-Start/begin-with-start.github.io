#extension GL_OES_EGL_image_external : require
precision highp float;
varying vec2 textureCoordinate;
uniform samplerExternalOES s_texture;
uniform sampler2D bg_texture;


void main() {
    vec4 color = texture2D( s_texture, textureCoordinate );
    vec4 bgColor = texture2D(bg_texture, textureCoordinate);

    if (abs(color.r - bgColor.r) <= 0.2 && abs(color.g - bgColor.g) <= 0.2 && abs(color.b - bgColor.b) <= 0.2) {
        color.r = 1.0;
        color.g = 1.0;
        color.b = 1.0;
    }

    gl_FragColor = color;
}
