#extension GL_OES_EGL_image_external : require
precision lowp float;
precision lowp int;
// uniform sampler2D vTexture;
//uniform samplerExternalOES vTexture;
uniform int enable;
uniform int iternum;
uniform float aaCoef;//参数
uniform float mixCoef;//混合系数
uniform int openFilterMask;// == 1 ? 开启filtermask模式: 关闭
varying highp vec2 textureCoordinate;
uniform samplerExternalOES inputImageTexture;
uniform sampler2D inputFilterTexture;

//uniform highp vec2 singleStepOffset;
uniform highp vec4 params;
uniform highp float brightness;
uniform float texelWidthOffset;
uniform float texelHeightOffset;

const highp vec3 W = vec3(0.299, 0.587, 0.114);
const highp mat3 saturateMatrix = mat3(
1.1102, -0.0598, -0.061,
-0.0774, 1.0826, -0.1186,
-0.0228, -0.0228, 1.1772);
highp vec2 blurCoordinates[12];
lowp vec4 mappingColor;

highp float hardLight(highp float color) {
    if (color <= 0.5)
    color = color * color * 2.0;
    else
    color = 1.0 - ((1.0 - color)*(1.0 - color) * 2.0);
    return color;
}

void main(){
    if (enable < 1) {
        gl_FragColor = texture2D(inputImageTexture, textureCoordinate);
        return;
    }
    vec2 singleStepOffset = vec2(texelWidthOffset, texelHeightOffset);
    highp vec3 centralColor = texture2D(inputImageTexture, textureCoordinate).rgb;

    blurCoordinates[0] = textureCoordinate.xy + singleStepOffset * vec2(2.0, 2.0);
    blurCoordinates[1] = textureCoordinate.xy + singleStepOffset * vec2(-2.0, 2.0);
    blurCoordinates[2] = textureCoordinate.xy + singleStepOffset * vec2(2.0, -2.0);
    blurCoordinates[3] = textureCoordinate.xy + singleStepOffset * vec2(-2.0, -2.0);
    blurCoordinates[4] = textureCoordinate.xy + singleStepOffset * vec2(5.0, 5.0);
    blurCoordinates[5] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, 5.0);
    blurCoordinates[6] = textureCoordinate.xy + singleStepOffset * vec2(5.0, -5.0);
    blurCoordinates[7] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, -5.0);
    blurCoordinates[8] = textureCoordinate.xy + singleStepOffset * vec2(8.0, 8.0);
    blurCoordinates[9] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, 8.0);
    blurCoordinates[10] = textureCoordinate.xy + singleStepOffset * vec2(8.0, -8.0);
    blurCoordinates[11] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, -8.0);
    highp float sampleColor = centralColor.g * 6.0;

    sampleColor += texture2D(inputImageTexture, blurCoordinates[0]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[1]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[2]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[3]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[4]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[5]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[6]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[7]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[8]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[9]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[10]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[11]).g;

    sampleColor = sampleColor / 18.0;

    highp float highPass = centralColor.g - sampleColor + 0.5;

    for (int i = 0; i < 5; i++) {
        highPass = hardLight(highPass);
    }
    // 亮度
    highp float lumance = dot(centralColor, W);

    // 美颜参数
    highp float alpha = pow(lumance, params.r);

    // 合并图层
    highp vec3 smoothColor = centralColor + (centralColor-vec3(highPass))*alpha*0.1;

    smoothColor.r = clamp(pow(smoothColor.r, params.g), 0.0, 1.0);
    smoothColor.g = clamp(pow(smoothColor.g, params.g), 0.0, 1.0);
    smoothColor.b = clamp(pow(smoothColor.b, params.g), 0.0, 1.0);


    highp vec3 lvse = vec3(1.0)-(vec3(1.0)-smoothColor)*(vec3(1.0)-centralColor);
    highp vec3 bianliang = max(smoothColor, centralColor);
    highp vec3 rouguang = 2.0*centralColor*smoothColor + centralColor*centralColor - 2.0*centralColor*centralColor*smoothColor;

    // 涂层混合
    highp vec4 tempColor;
    tempColor = vec4(mix(centralColor, lvse, alpha), 1.0);
    tempColor.rgb = mix(tempColor.rgb, bianliang, alpha);
    tempColor.rgb = mix(tempColor.rgb, rouguang, params.b);

    highp vec3 satcolor = tempColor.rgb * saturateMatrix;
    tempColor.rgb = mix(tempColor.rgb, satcolor, params.a);
    tempColor.rgb = vec3(tempColor.rgb + vec3(brightness));
    gl_FragColor = tempColor;

    if (openFilterMask == 1) {

        mappingColor = texture2D(inputFilterTexture, textureCoordinate);
        int colorCount = 12;
        // 先对mask做一个高斯模糊
        float factor[9];
        factor[0] = 1.0; factor[1] = 1.0; factor[2] = 1.0;
        factor[3] = 1.0; factor[4] = 1.0; factor[5] = 1.0;
        factor[6] = 1.0; factor[7] = 1.0; factor[8] = 1.0;
        vec4 color1 = vec4(0.0);

        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                float x = max(0.0, textureCoordinate.x + (float(i) * singleStepOffset.x*5.0));
                float y = max(0.0, textureCoordinate.y + (float(i) * singleStepOffset.y* 5.0));
                if (y >= 1.0) {
                    y = 1.0;
                }
                color1 += texture2D(inputFilterTexture, vec2(x, y)) * factor[(i+1)*3+(j+1)];
            }
        }

        color1 = color1 / 9.0;
        if (color1.r == 1.0) {
            // 人
            color1 = tempColor;

        } else if (color1.r == 0.0) {
            // 背景
            color1 = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
            color1 = vec4(tempColor.rgb, color1.a);
//            if (mappingColor.r == 1.0) {
//                // 人物边缘
//
//                color1 = vec4(tempColor.rgb, color1.r);
//
//            } else {
////                 背景
//                color1 = vec4(tempColor.rgb, mappingColor.a);
//            }
        }
        gl_FragColor = color1;


    }

}