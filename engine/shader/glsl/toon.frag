#version 450 

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;
layout(set = 0, binding = 1) uniform sampler2D in_scene_depth;
layout(set = 0, binding = 2) uniform UniformBufferObject {
    highp vec4 viewport;
} ubo;
layout(set = 0, binding = 3, rgba8) uniform readonly highp image2D in_normal;

layout(location = 0) in highp vec2 in_uv;

layout(location = 0) out highp vec4 out_color;

void main()
{
    const highp float _Scale = 1.5;
    const highp float _DepthThreshold = 0.05;
    const highp float _NormalThreshold = 0.6;

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

    //depth
    highp float depth0 = texture(in_scene_depth, bottomLeftUV).r;
    highp float depth1 = texture(in_scene_depth, topRightUV).r;
    highp float depth2 = texture(in_scene_depth, bottomRightUV).r;
    highp float depth3 = texture(in_scene_depth, topLeftUV).r;

    highp float depthFiniteDifference0 = depth1 - depth0;
    highp float depthFiniteDifference1 = depth3 - depth2;
    highp float edgeDepth = sqrt(pow(depthFiniteDifference0, 2.0) + pow(depthFiniteDifference1, 2.0)) * 100.0;

    edgeDepth = edgeDepth > _DepthThreshold ? 1.0 : 0.0;

    //normal
    highp vec3 normal0 = (imageLoad(in_normal, ivec2(bottomLeftUV * vec2(screen_size))).rgb) * 2 - 1;
    highp vec3 normal1 = (imageLoad(in_normal, ivec2(topRightUV * vec2(screen_size))).rgb) * 2 - 1;
    highp vec3 normal2 = (imageLoad(in_normal, ivec2(bottomRightUV * vec2(screen_size))).rgb) * 2 - 1;
    highp vec3 normal3 = (imageLoad(in_normal, ivec2(topLeftUV * vec2(screen_size))).rgb) * 2 - 1;

    highp vec3 normalFiniteDifference0 = normal1 - normal0;
    highp vec3 normalFiniteDifference1 = normal3 - normal2;
    highp float edgeNormal = sqrt(dot(normalFiniteDifference0, normalFiniteDifference1) + dot(normalFiniteDifference1, normalFiniteDifference0));

    edgeNormal = edgeNormal > _NormalThreshold ? 1: 0;

    //
    highp float edge = max(edgeDepth, edgeNormal);
    edge = edgeDepth;
    out_color = vec4(edge, edge, edge, 1.0) + color;

    //debug
    //highp vec3 normal = (imageLoad(in_normal, ivec2(px, py)).rgb) ;
    //out_color = vec4(normal, 1.0);
}
