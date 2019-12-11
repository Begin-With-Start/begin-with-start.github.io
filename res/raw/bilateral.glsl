#extension GL_OES_EGL_image_external : require
precision mediump float;
varying vec2 textureCoordinate;
uniform sampler2D inputImageTexture;
uniform vec2 singleStepOffset;//(1.0/width,1.0/height)
uniform float skinlevel;
highp vec2 blurCoordinates[24];

void main(){
    lowp vec4 centralColor;
    lowp float gaussianWeightTotal;
    lowp vec4 sum;
    lowp vec4 sampleColor;
    lowp float distanceFromCentralColor;
    lowp float gaussianWeight;
    highp vec2 offset = vec2(5.0*singleStepOffset.x, 0.0);
    highp float distanceNormalizationFactor = 1.9;//3.2

    if(skinlevel > 0.0) {
        offset = vec2(0.0, 5.0*singleStepOffset.y);
    }
    for (int i = 0; i < 9; i++) {
        highp vec2 blurStep = float(i - ((9 - 1) / 2)) * offset;
        blurCoordinates[i] = textureCoordinate.xy + blurStep;
    }
    centralColor = texture2D(inputImageTexture, blurCoordinates[4]);
    //gl_FragColor = centralColor;
    //return;
/*
    gaussianWeightTotal = 0.18;
    sum = centralColor * 0.18;
    sampleColor = texture2D(inputImageTexture, blurCoordinates[0]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[1]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[2]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[3]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[5]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[6]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[7]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[8]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;
*/


    gaussianWeightTotal = 0.18;
    sum = centralColor * 0.18;

    /*
    sampleColor = texture2D(inputImageTexture, blurCoordinates[0]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[1]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;*/

    sampleColor = texture2D(inputImageTexture, blurCoordinates[2]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[3]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[5]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[6]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;
/*
    sampleColor = texture2D(inputImageTexture, blurCoordinates[7]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;

    sampleColor = texture2D(inputImageTexture, blurCoordinates[8]);
    distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
    gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
    gaussianWeightTotal += gaussianWeight;
    sum += sampleColor * gaussianWeight;*/
    gl_FragColor = (sum / gaussianWeightTotal);
}