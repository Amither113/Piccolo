#pragma once

#include "runtime/function/render/render_pass.h"

namespace Piccolo
{
    struct ToonPassInitInfo : RenderPassInitInfo
    {
        RHIRenderPass* render_pass;
        RHIImageView* input_attachment;
        RHIImageView*  depth_image_view;
        RHIImageView*  normal_image_view;
    };

    class ToonPass : public RenderPass
    {
    public:
        void initialize(const RenderPassInitInfo* init_info) override final;
        void preparePassData(std::shared_ptr<RenderResourceBase> render_resource) override final;
        void draw() override final;

        void updateAfterFramebufferRecreate(RHIImageView* input_attachment, RHIImageView* normal_image_view);
        void setDepthAndNormalImage(RHIImage* depth_image, RHIImage* normal_image);

    private:
        void prepareUniformBuffer();
        void updateUniformBuffer();
        void setupDescriptorSetLayout();
        void setupPipelines();
        void setupDescriptorSet();

        RHIImage*     m_src_depth_image       = nullptr;
        RHIImage*     m_src_normal_image      = nullptr;
        RHIImageView* m_depth_image_view  = nullptr;
        RHIImageView* m_normal_image_view = nullptr;

        RHIViewport m_viewport_params;
        RHIBuffer* m_compute_uniform_buffer = nullptr;
        void*      m_particle_compute_buffer_mapped {nullptr};
        struct viewUniformBufferObject
        {
            Vector4  viewport; // x, y, width, height
        } m_ubo;
    };
} // namespace Piccolo
