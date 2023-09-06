#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D in_scene_depth;

layout(set = 0, binding = 2) uniform UniformBufferObject {
    highp vec4 viewport;
} ubo;

layout(location = 0) in highp vec2 in_uv;

layout(location = 0) out highp vec4 out_color;

void main()
{
    const highp float _Scale = 4.0;
    const highp float _DepthThreshold = 0.2;

    highp vec4 color       = subpassLoad(in_color).rgba;
    highp ivec2 screen_size = textureSize(in_scene_depth, 0);

    highp float px = (ubo.viewport.x + in_uv.x * ubo.viewport.z);
    highp float py = (ubo.viewport.y + in_uv.y * ubo.viewport.w);
    highp vec2 uv = vec2(px / float(screen_size.x), py / float(screen_size.y));

    /////line extractions
    highp float halfScaleFloor = floor(_Scale * 0.5);
    highp float halfScaleCeil = ceil(_Scale * 0.5);

    highp vec2 texelSize = vec2(1.0) / vec2(screen_size);

    highp vec2 bottomLeftUV = uv - vec2(texelSize.x, texelSize.y) * halfScaleFloor;
    highp vec2 topRightUV = uv + vec2(texelSize.x, texelSize.y) * halfScaleCeil;  
    highp vec2 bottomRightUV = uv + vec2(texelSize.x * halfScaleCeil, -texelSize.y * halfScaleFloor);
    highp vec2 topLeftUV = uv + vec2(-texelSize.x * halfScaleFloor, texelSize.y * halfScaleCeil);

    highp float depth0 = texture(in_scene_depth, bottomLeftUV).r;
    highp float depth1 = texture(in_scene_depth, topRightUV).r;
    highp float depth2 = texture(in_scene_depth, bottomRightUV).r;
    highp float depth3 = texture(in_scene_depth, topLeftUV).r;

    highp float depthFiniteDifference0 = depth1 - depth0;
    highp float depthFiniteDifference1 = depth3 - depth2;
    highp float edgeDepth = sqrt(pow(depthFiniteDifference0, 2.0) + pow(depthFiniteDifference1, 2.0)) * 100.0;

    edgeDepth = edgeDepth > _DepthThreshold ? 1.0 : 0.0;

    out_color = vec4(edgeDepth, edgeDepth, edgeDepth, 1.0) + color;

    //debug
    // highp float depth = texture(in_scene_depth, in_uv).r;
    // out_color = vec4(depth, depth, depth, 1);
    //out_color = vec4(uv, 0, 1);
    //out_color = vec4(1, 1, 1, 1);
}
