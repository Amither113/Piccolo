#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

precision highp float;
vec2 lookup(highp vec3 color, float _COLORS){
    vec3 c;
    c.x = color.r * ((_COLORS - 1.0f) / _COLORS);
    c.y = color.g * ((_COLORS - 1.0f) / _COLORS);
    c.z = color.b * ((_COLORS - 1.0f) / _COLORS);

    float slice = c.z * _COLORS - 0.5f / _COLORS;
    float s = fract(slice);
    slice -= s;

    float uu = max(0.0f, c.x + slice) / _COLORS;
    float vv = max(0.0f, c.y);

    return vec2(uu, vv);
}

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;
    
    highp vec2 uv = lookup(color.rgb, _COLORS);
    highp vec4 color_sampled = texture(color_grading_lut_texture_sampler, uv);

    out_color = color_sampled;
}
