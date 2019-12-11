attribute vec4 vPosition;
uniform mat4 uMVPMatrix;
varying vec2 v_texCoord;
attribute vec2 a_texCoord;

void main(){
    gl_Position = uMVPMatrix * vPosition;
    v_texCoord = a_texCoord;
}
