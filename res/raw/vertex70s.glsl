precision highp float;
varying vec2 st;
varying vec2 hdSt;
varying vec2 frameSize;
attribute vec4 position;
attribute vec4 inputTextureCoordinate;
uniform mat4 positionMatrix;
varying vec2 textureCoordinate;
uniform float width;
uniform float height;

 vec2 computeHDST(vec2 st, vec2 frameSize)
 {
     float distHW = max(frameSize.x, frameSize.y);
     float frameRatio = distHW / 1280.0;
     vec2 hdSt = vec2(0.0);
     if (frameSize.y >= frameSize.x) {
         hdSt.x = st.x * frameSize.x / (frameSize.x / frameRatio);
         hdSt.y = st.y * frameRatio;
     } else {
         hdSt.x = st.x * frameRatio;
         hdSt.y = st.y * frameSize.y / (frameSize.y / frameRatio);
     }
     return hdSt;
 }
 void main()
 {
     frameSize = vec2(width, height);//数据帧宽高
     st = position.xy * 0.5 + 0.5;
     hdSt = computeHDST(st, frameSize);
     textureCoordinate = inputTextureCoordinate.xy;
     gl_Position = positionMatrix * position;
 }