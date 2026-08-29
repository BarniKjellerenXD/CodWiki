import { defineComponent, ref, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ImageLightbox",
  __ssrInlineRender: true,
  props: {
    src: {},
    alt: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const overlayRef = ref(null);
    ref(null);
    ref(null);
    const scale = ref(1);
    const translateX = ref(0);
    const translateY = ref(0);
    const isDragging = ref(false);
    ref(0);
    ref(0);
    function reset() {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }
    watch(() => props.src, () => {
      reset();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
        tabindex: "0",
        ref_key: "overlayRef",
        ref: overlayRef
      }, _attrs))} data-v-6b987825><div class="absolute inset-0" data-v-6b987825><div class="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto" data-v-6b987825><button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" data-v-6b987825>+ </button><button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" data-v-6b987825>- </button><button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" data-v-6b987825>Reset </button><a class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20"${ssrRenderAttr("href", __props.src)} target="_blank" rel="noopener noreferrer" data-v-6b987825>Open</a><button class="px-3 py-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20" data-v-6b987825>Close</button></div><div class="absolute inset-0 overflow-hidden select-none z-10" data-v-6b987825><img${ssrRenderAttr("src", __props.src)}${ssrRenderAttr("alt", __props.alt)} class="max-w-none will-change-transform" style="${ssrRenderStyle({
        transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
        transformOrigin: "center center",
        cursor: isDragging.value ? "grabbing" : "grab",
        userSelect: "none"
      })}" draggable="false" data-v-6b987825></div><div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/80 text-sm px-3 py-1.5 rounded-md bg-white/10 border border-white/20" data-v-6b987825> Scroll to zoom • Drag to pan • Esc to close </div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ImageLightbox.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-6b987825"]]), { __name: "ImageLightbox" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=ImageLightbox-CHYo0OGC.mjs.map
