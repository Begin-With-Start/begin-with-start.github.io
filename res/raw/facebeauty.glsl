precision mediump float;

varying highp vec2 textureCoordinate;
varying highp vec2 textureCoordinate2;

uniform sampler2D inputImageTexture;
uniform sampler2D inputImageTexture2;
uniform highp vec2 singleStepOffset;//(1.0/width,1.0/height)
uniform highp float whiten;
uniform highp float soften;
highp vec2 blurCoordinates1[8];
highp vec2 blurCoordinates2[8];

void main(){
	lowp vec4 centralColor = texture2D(inputImageTexture2, textureCoordinate2);
	lowp vec4 blurredImageColor = texture2D(inputImageTexture, textureCoordinate);
	//blurCoordinates2[0] = textureCoordinate2.xy + singleStepOffset * vec2(-1.0, -1.0);
	blurCoordinates2[1] = textureCoordinate2.xy + singleStepOffset * vec2(0.0, -1.0);
	//blurCoordinates2[2] = textureCoordinate2.xy + singleStepOffset * vec2(1.0, -1.0);
	blurCoordinates2[3] = textureCoordinate2.xy + singleStepOffset * vec2(-1.0, 0.0);
	blurCoordinates2[4] = textureCoordinate2.xy + singleStepOffset * vec2(1.0, 0.0);
	//blurCoordinates2[5] = textureCoordinate2.xy + singleStepOffset * vec2(-1.0, 1.0);
	blurCoordinates2[6] = textureCoordinate2.xy + singleStepOffset * vec2(0.0, 1.0);
	//blurCoordinates2[7] = textureCoordinate2.xy + singleStepOffset * vec2(1.0, 1.0);

	//blurCoordinates1[0] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, -1.0);
	blurCoordinates1[1] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -1.0);
	//blurCoordinates1[2] = textureCoordinate.xy + singleStepOffset * vec2(1.0, -1.0);
	blurCoordinates1[3] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, 0.0);
	blurCoordinates1[4] = textureCoordinate.xy + singleStepOffset * vec2(1.0, 0.0);
	//blurCoordinates1[5] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, 1.0);
	blurCoordinates1[6] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 1.0);
	//blurCoordinates1[7] = textureCoordinate.xy + singleStepOffset * vec2(1.0, 1.0);

	lowp vec3 tmp = blurredImageColor.rgb - centralColor.rgb + 0.5;
	//tmp += (texture2D(inputImageTexture, blurCoordinates1[0]).rgb-texture2D(inputImageTexture2, blurCoordinates2[0]).rgb + 0.5);
	tmp += (texture2D(inputImageTexture, blurCoordinates1[1]).rgb-texture2D(inputImageTexture2, blurCoordinates2[1]).rgb + 0.5);
	//tmp += (texture2D(inputImageTexture, blurCoordinates1[2]).rgb-texture2D(inputImageTexture2, blurCoordinates2[2]).rgb + 0.5);
	tmp += (texture2D(inputImageTexture, blurCoordinates1[3]).rgb-texture2D(inputImageTexture2, blurCoordinates2[3]).rgb + 0.5);
	tmp += (texture2D(inputImageTexture, blurCoordinates1[4]).rgb-texture2D(inputImageTexture2, blurCoordinates2[4]).rgb + 0.5);
	//tmp += (texture2D(inputImageTexture, blurCoordinates1[5]).rgb-texture2D(inputImageTexture2, blurCoordinates2[5]).rgb + 0.5);
	tmp += (texture2D(inputImageTexture, blurCoordinates1[6]).rgb-texture2D(inputImageTexture2, blurCoordinates2[6]).rgb + 0.5);
	//tmp += (texture2D(inputImageTexture, blurCoordinates1[7]).rgb-texture2D(inputImageTexture2, blurCoordinates2[7]).rgb + 0.5);
	tmp = tmp / 5.0;
	tmp = tmp + centralColor.rgb - 0.5;
	if(((centralColor.r>0.372549 && centralColor.g > 0.156863 && centralColor.b > 0.078431 && (centralColor.r - centralColor.b > 0.058823) && (centralColor.r - centralColor.g > 0.058823)) || (centralColor.r > 0.784313 && centralColor.g > 0.823529 && centralColor.b > 0.666667 && abs(centralColor.r - centralColor.b)<= 0.058823 && centralColor.r > centralColor.b && centralColor.g > centralColor.b))) {
	 gl_FragColor.rgb = mix(centralColor.rgb, tmp, soften);
	} else {
	 gl_FragColor.rgb = mix(centralColor.rgb, tmp, soften/2.0);
	}
	lowp vec3 ss = 2.0 * gl_FragColor.rgb - gl_FragColor.rgb*gl_FragColor.rgb;
	gl_FragColor = vec4(mix(gl_FragColor.rgb, ss, whiten), centralColor.a);
}