varying highp vec2 textureCoordinate;
precision mediump float;

uniform sampler2D inputImageTexture;
uniform vec2 singleStepOffset;
highp vec2 coordinates[9];

void main()
{ 
	highp vec3 centralColor = texture2D(inputImageTexture, textureCoordinate).rgb;
    coordinates[0] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, -1.0);
    coordinates[1] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -1.0);
    coordinates[2] = textureCoordinate.xy + singleStepOffset * vec2(1.0, -1.0);
    coordinates[3] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, 0.0);
    coordinates[4] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 0.0);
    coordinates[5] = textureCoordinate.xy + singleStepOffset * vec2(1.0, 0.0);
    coordinates[6] = textureCoordinate.xy + singleStepOffset * vec2(-1.0, 1.0);
    coordinates[7] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 1.0);
    coordinates[8] = textureCoordinate.xy + singleStepOffset * vec2(1.0, 1.0);
    mediump float kIntensity0 = texture2D(inputImageTexture, coordinates[0]).r;
    mediump float kIntensity1 = texture2D(inputImageTexture, coordinates[1]).r;
    mediump float kIntensity2 = texture2D(inputImageTexture, coordinates[2]).r;
    mediump float kIntensity3 = texture2D(inputImageTexture, coordinates[3]).r;
    mediump float kIntensity4 = texture2D(inputImageTexture, coordinates[4]).r;
    mediump float kIntensity5 = texture2D(inputImageTexture, coordinates[5]).r;
    mediump float kIntensity6 = texture2D(inputImageTexture, coordinates[6]).r;
    mediump float kIntensity7 = texture2D(inputImageTexture, coordinates[7]).r;
    mediump float kIntensity8 = texture2D(inputImageTexture, coordinates[8]).r;
    mediump float h = -kIntensity0 - 2.0*kIntensity1-kIntensity2+kIntensity6+2.0*kIntensity7+kIntensity8;
    mediump float v = -kIntensity0 - 2.0 * kIntensity3 - kIntensity6 + kIntensity2 + 2.0 * kIntensity5 + kIntensity8;
    mediump float mag = length(vec2(h, v)) * 0.5;
    gl_FragColor = vec4(vec3(mag*1.7,mag*0.5,mag*0.5), 1.0);
} 