#pragma once

#include "runtime/function/render/render_pass.h"

namespace Piccolo
{
    struct ToonPassInitInfo : RenderPassInitInfo
    {
        RHIRenderPass* render_pass;
        RHIImageView* input_attachment;
    };

    class ToonPass : public RenderPass
    {
    public:
        void initialize(const RenderPassInitInfo* init_info) override final;
        void preparePassData(std::shared_ptr<RenderResourceBase> render_resource) override final;
        void draw() override final;

        void updateAfterFramebufferRecreate(RHIImageView* input_attachment);

    private:
        void prepareUniformBuffer();
        void updateUniformBuffer();
        void setupDescriptorSetLayout();
        void setupPipelines();
        void setupDescriptorSet();

        RHIViewport m_viewport_params;
        RHIBuffer* m_compute_uniform_buffer = nullptr;
        void*      m_particle_compute_buffer_mapped {nullptr};
        struct viewUniformBufferObject
        {
            Vector4  viewport; // x, y, width, height
        } m_ubo;
    };
} // namespace Piccolo
