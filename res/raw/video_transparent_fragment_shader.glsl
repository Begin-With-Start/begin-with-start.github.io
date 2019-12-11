#extension GL_OES_EGL_image_external : require
precision highp float;
varying vec2 textureCoordinate;
uniform samplerExternalOES s_texture;

uniform vec3 rgb;
uniform float rthreshold;
uniform float gthreshold;
uniform float bthreshold;

void main() {
    vec4 color=texture2D( s_texture, textureCoordinate );
    if(abs(color.r - rgb[0]) <= rthreshold && abs(color.g- rgb[1]) <= gthreshold && abs(color.b -rgb[2]) <= bthreshold) {
        color.r = 0.0;
        color.g = 0.0;
        color.b = 0.0;
        color.a = 0.0;
    }

    gl_FragColor = color;
}
