precision highp float;
varying highp vec2 textureCoordinate;
uniform sampler2D inputImageTexture;

#define MAX_KEYPOINTS_NUM 115

uniform highp vec2 imageSize;
uniform vec2 keypoints[MAX_KEYPOINTS_NUM];
uniform vec2 ptsModify[MAX_KEYPOINTS_NUM];
uniform lowp float scale;

vec2 localTranslation(vec2 x, vec2 c, vec2 m, float r_max, float delta, float ratio)
{
     vec2 xPos = x;
     vec2 xToUse = vec2(ratio * x.x, x.y);
     vec2 cToUse = vec2(ratio * c.x, c.y);
     float r = distance(xToUse, cToUse);

     if (r < r_max) {
         vec2 dir = normalize(m - c);
         float dist = r_max * r_max - r * r;
         float f = dist / (dist + (r-delta) * (r-delta));
         xPos =  xPos - f*f*delta*dir;
     }
     return xPos;
}

vec2 localScale(vec2 x, vec2 c, vec2 m, float r_max, float a, float ratio)
{
     float r= distance(x, c);
     if (r < r_max) {
         float fs = 1.0 - (r/r_max-1.0)*(r/r_max-1.0)*a;
         return x + fs*r;
     }
     return x;
}

vec2 facialCountour(vec2 ctrlpoint, float scale, float ratio)
{
     vec2 face_center = keypoints[46];
     vec2 posToUse = vec2(scale * (ctrlpoint.x - face_center.x) + face_center.x,
                          scale * (ctrlpoint.y - face_center.y) + face_center.y);
     return posToUse;
}

void main()
{
     float x_y = imageSize.x / imageSize.y;
     float face_width = abs(keypoints[16].x - keypoints[0].x);
     float eye_height = distance(keypoints[37], keypoints[41]);
     vec2 coordToUse = textureCoordinate.xy;

     for (int i = 0; i <= 7; i++)
     {
         vec2 ctrlpoint = keypoints[i];
         vec2 ctrlpoint2 = ptsModify[i];
         coordToUse = localTranslation(coordToUse, ctrlpoint, ctrlpoint2, scale*2.0, 0.75, x_y);
     }
     for (int i = 9; i <= 16; i++)
     {
         vec2 ctrlpoint = keypoints[i];
         vec2 ctrlpoint2 = ptsModify[i];
         coordToUse = localTranslation(coordToUse, ctrlpoint, ctrlpoint2, scale*2.0, 0.75, x_y);
     }

     for (int i = 36; i <= 47; i++)
     {
         vec2 ctrlpoint = keypoints[i];
         vec2 ctrlpoint2 = ptsModify[i];
         coordToUse = localTranslation(coordToUse, ctrlpoint, ctrlpoint2, scale*0.1, 0.85, x_y);
     }

     highp vec4 bgColor = texture2D(inputImageTexture, coordToUse);

     //确定关键点位置
     coordToUse = vec2(x_y * textureCoordinate.x, textureCoordinate.y);
     for (int index = 0; index < MAX_KEYPOINTS_NUM; index++) {
         vec2 centerToUse = vec2(x_y * keypoints[index].x, keypoints[index].y);
         if(distance(coordToUse , centerToUse) < 0.005 )
         {
             bgColor = vec4(1.0, 0.0, 0.0, 1.0);
         }

         vec2 centerToUse2 = vec2(x_y * ptsModify[index].x, ptsModify[index].y);
         if(distance(coordToUse , centerToUse2) < 0.005 )
         {
             bgColor = vec4(0.0, 1.0, 0.0, 1.0);
         }
     }
     gl_FragColor = bgColor;
 }