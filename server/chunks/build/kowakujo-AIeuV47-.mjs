import { _ as __nuxt_component_0 } from './nuxt-link-C-nOCECy.mjs';
import { _ as __nuxt_component_1 } from './ImageLightbox-CHYo0OGC.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import './server.mjs';
import 'vue-router';
import '@iconify/vue';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "kowakujo",
  __ssrInlineRender: true,
  setup(__props) {
    const html = ref("");
    ref(null);
    const toc = ref([]);
    const pins = ref([]);
    const lightboxSrc = ref(null);
    const lightboxAlt = ref("");
    function isPinned(id) {
      return pins.value.includes(id);
    }
    const pinnedToc = computed(() => pins.value.map((id) => toc.value.find((t) => t.id === id)).filter(Boolean));
    const otherToc = computed(() => toc.value.filter((t) => !isPinned(t.id)));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ImageLightbox = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-600/10" }, _attrs))} data-v-373658ca><div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6" data-v-373658ca><section class="min-w-0" data-v-373658ca><div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-4 sm:p-6" data-v-373658ca><header class="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3" data-v-373658ca><h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300" data-v-373658ca>Kowakujō</h1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-sm text-white/70 hover:text-white underline underline-offset-4",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Back to index`);
          } else {
            return [
              createTextVNode("Back to index")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><div class="curse-banner" data-v-373658ca><div class="banner-text" data-v-373658ca>Playing Cursed Mode and already finished the Main Quest once and interacted to unlock Relics?</div><button class="banner-btn" data-v-373658ca>Go to Relics</button></div><article class="prose prose-invert max-w-none" data-v-373658ca>`);
      if (html.value) {
        _push(`<div data-v-373658ca>${html.value ?? ""}</div>`);
      } else {
        _push(`<div class="text-white/70" data-v-373658ca>Loading guide…</div>`);
      }
      _push(`</article></div></section><aside class="hidden lg:block sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto" data-v-373658ca><div class="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 p-3" data-v-373658ca><h2 class="text-base font-semibold mb-2 text-cyan-200 tracking-wide" data-v-373658ca>Chapters</h2><div class="mb-2" data-v-373658ca><div class="text-[11px] font-semibold text-white/70 mb-1" data-v-373658ca>Pinned</div><nav class="space-y-1.5" data-v-373658ca><!--[-->`);
      ssrRenderList(pinnedToc.value, (p) => {
        _push(`<div class="flex items-center gap-1.5" data-v-373658ca><button class="flex-1 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-white/10 text-white border-l-2 border-cyan-400" data-v-373658ca>${ssrInterpolate(p.text)}</button><button class="text-[11px] px-2 py-1 rounded-md bg-slate-800/60 border border-white/10 text-white/80" title="Unpin" data-v-373658ca>Unpin</button></div>`);
      });
      _push(`<!--]--></nav></div><div class="divider" aria-hidden="true" data-v-373658ca></div><nav class="space-y-1.5 no-scrollbar max-h-[46vh] overflow-y-auto mt-2" data-v-373658ca><!--[-->`);
      ssrRenderList(otherToc.value, (item) => {
        _push(`<div class="flex items-center gap-1.5" data-v-373658ca><button class="${ssrRenderClass([item.level === 1 ? "font-semibold text-white" : item.level === 2 ? "pl-5" : "pl-8", "flex-1 text-left text-[13px] px-2.5 py-1.5 rounded-md hover:bg-white/10 text-white/90 border-l-2 border-transparent hover:border-cyan-300"])}" data-v-373658ca>${ssrInterpolate(item.text)}</button><button class="text-[11px] px-2 py-1 rounded-md bg-slate-800/60 border border-white/10 text-white/80" title="Pin" data-v-373658ca>Pin</button></div>`);
      });
      _push(`<!--]--></nav></div></aside></div>`);
      if (lightboxSrc.value) {
        _push(ssrRenderComponent(_component_ImageLightbox, {
          src: lightboxSrc.value,
          alt: lightboxAlt.value,
          onClose: ($event) => lightboxSrc.value = null
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guides/kowakujo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const kowakujo = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-373658ca"]]);

export { kowakujo as default };
//# sourceMappingURL=kowakujo-AIeuV47-.mjs.map
