#version 100

#ifndef CONFIG_BONE_COUNT
#define CONFIG_BONE_COUNT 16
#endif // CONFIG_BONE_COUNT

#ifndef CONFIG_WEIGHT_COUNT
#define CONFIG_WEIGHT_COUNT 1
#endif // CONFIG_WEIGHT_COUNT

precision highp float;

uniform mat4  uMVP;

uniform mat4  uMatrixImage;

uniform mat4  uBoneList[CONFIG_BONE_COUNT];

attribute vec4 aPosition;
attribute vec4 aTexCoords;
attribute vec4 aBoneIndexList;
attribute vec4 aBoneWeightList;

varying vec2 vTexCoords;

vec4 Skin(vec4 position)
{
  vec4 skinned = vec4(0, 0, 0, 0);
  for (int i = 0; i < CONFIG_WEIGHT_COUNT; ++ i) {
    int index = int(aBoneIndexList[i]);
    skinned += aBoneWeightList[0] * uBoneList[index] * position;
  }
  return skinned;
}

void main()
{
  vTexCoords = (uMatrixImage * aTexCoords).xy;

  gl_Position = uMVP * Skin(aPosition);
}
