import { _ as __nuxt_component_0 } from './nuxt-link-C-nOCECy.mjs';
import { defineComponent, ref, mergeProps, withCtx, createBlock, createCommentVNode, createVNode, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
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
import '@iconify/vue';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const mapSlug = ref("");
    const featuredGuides = [
      {
        title: "Rex Infernus",
        to: "/guides/rex-infernus",
        desc: "Complete map breakdown: main quest, wonder tools, and the Warden boss fight.",
        img: "/images/rex-infernus-thumb.jpg"
      },
      {
        title: "Ashes of the Damned",
        to: "/guides/ashes-of-the-damned",
        desc: "Complete map breakdown, quests, relics, and more.",
        img: "/images/ashes-thumb.jpg"
      },
      {
        title: "Astra Malorum",
        to: "/guides/astra-malorum",
        desc: "Space observatory guide: main quest, LGM-1, and secrets.",
        img: "/images/astra-thumb.jpg"
      },
      {
        title: "Paradox Junction",
        to: "/guides/paradox-junction",
        desc: "Multi-dimensional map guide: main quest and features.",
        img: "/images/paradox-thumb.jpg"
      },
      {
        title: "Totenreich",
        to: "/guides/totenreich",
        desc: "Undead realm guide: main quest, traps, and secrets.",
        img: "/images/totenreich-thumb.jpg"
      },
      {
        title: "Kowakujō",
        to: "/guides/kowakujo",
        desc: "Japanese castle map guide: main quest, wonder weapon, and more.",
        img: "/images/kowakujo-thumb.jpg"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl mx-auto py-10 px-4" }, _attrs))}><div class="text-center mb-8"><h1 class="text-3xl font-bold text-white">COD Zombies Wiki Viewer</h1><p class="text-slate-300 mt-2">Type a map slug to open its wiki page, or use the quick entries below.</p></div><div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4 sm:p-6"><div class="flex flex-col sm:flex-row gap-3"><input${ssrRenderAttr("value", mapSlug.value)} type="text" placeholder="e.g. ashes-of-the-damned" class="flex-1 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"><button class="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold">Open Wiki</button></div></div><div class="mt-8"><h2 class="text-lg font-semibold text-slate-200 mb-3">Quick Entries</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><!--[-->`);
      ssrRenderList(featuredGuides, (g) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: g.to,
          to: g.to,
          class: "group backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition flex flex-col"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (g.img) {
                _push2(`<div class="h-32 w-full overflow-hidden relative"${_scopeId}><img${ssrRenderAttr("src", g.img)}${ssrRenderAttr("alt", g.title)} class="object-cover w-full h-full group-hover:scale-[1.06] transition-transform duration-400"${_scopeId}><div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent"${_scopeId}></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="p-4 flex flex-col flex-1 justify-between"${_scopeId}><div class="flex items-start justify-between gap-2"${_scopeId}><div${_scopeId}><div class="font-semibold"${_scopeId}>${ssrInterpolate(g.title)}</div><div class="text-xs text-white/70"${_scopeId}>${ssrInterpolate(g.desc)}</div></div><span class="opacity-0 group-hover:opacity-100 text-cyan-300 text-sm"${_scopeId}>→</span></div></div>`);
            } else {
              return [
                g.img ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "h-32 w-full overflow-hidden relative"
                }, [
                  createVNode("img", {
                    src: g.img,
                    alt: g.title,
                    class: "object-cover w-full h-full group-hover:scale-[1.06] transition-transform duration-400"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" })
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "p-4 flex flex-col flex-1 justify-between" }, [
                  createVNode("div", { class: "flex items-start justify-between gap-2" }, [
                    createVNode("div", null, [
                      createVNode("div", { class: "font-semibold" }, toDisplayString(g.title), 1),
                      createVNode("div", { class: "text-xs text-white/70" }, toDisplayString(g.desc), 1)
                    ]),
                    createVNode("span", { class: "opacity-0 group-hover:opacity-100 text-cyan-300 text-sm" }, "→")
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CkIUT2IB.mjs.map
