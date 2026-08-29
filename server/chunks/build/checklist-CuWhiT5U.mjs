import { defineComponent, useSSRContext, ref, watch, computed, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RunChecklist",
  __ssrInlineRender: true,
  setup(__props) {
    const round = ref(1);
    const showOptional = ref(true);
    const search = ref("");
    const baseItems = [
      { id: "spawn-setup", label: "Spawn: build points / doors", group: "Early Spawn", done: false },
      { id: "flora-ee", label: "Aether Flora EE (if doing early)", group: "Early Spawn", optional: true, done: false },
      { id: "janus-entry", label: "Enter Janus hub", group: "Janus Phase", done: false },
      { id: "janus-prep", label: "Janus: initial setup / route check", group: "Janus Phase", done: false },
      { id: "blackwater-run", label: "Blackwater Lake: collect needed items", group: "Resource Collection", done: false },
      { id: "ashwood-run", label: "Ashwood: gather all accessible items", group: "Resource Collection", done: false },
      { id: "carcass-exit115", label: "Exit 115: get carcass (only < round 8 start)", group: "Conditional (<8)", condition: (s) => s.round < 8, done: false },
      { id: "farm-jar-place", label: "Farm: place jar", group: "Farm Prep", done: false },
      { id: "axe-foot", label: "Farm: axe foot step", group: "Farm Prep", done: false },
      { id: "klaus-boss", label: "Janus: defeat Klaus boss / obtain part", group: "Klaus Phase", done: false },
      { id: "summon-klaus", label: "Summon Klaus companion", group: "Klaus Phase", done: false },
      { id: "canister-start", label: "Start canister fill process", group: "Canister Fill", done: false },
      { id: "canister-ashwood", label: "Fill canister at Ashwood", group: "Canister Fill", done: false },
      { id: "canister-blackwater", label: "Fill canister at Blackwater", group: "Canister Fill", done: false },
      { id: "canister-farm", label: "Fill canister at Farm", group: "Canister Fill", done: false },
      { id: "wonder-weapon-complete", label: "Complete Wonder Weapon steps", group: "Farm Multi-task", done: false },
      { id: "jar-horse", label: "Jar horse step", group: "Farm Multi-task", done: false },
      { id: "twins-whisp-perk", label: "Twins / Whisp perk EE (optional)", group: "Farm Multi-task", optional: true, done: false },
      { id: "power-followup", label: "Activate / route to power after perk EE", group: "Farm Multi-task", optional: true, done: false }
    ];
    const items = ref([]);
    function load() {
      const raw = localStorage.getItem("run-checklist");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.items)) {
            const map = {};
            baseItems.forEach((i) => {
              map[i.id] = { ...i };
            });
            parsed.items.forEach((saved) => {
              if (map[saved.id]) map[saved.id].done = !!saved.done;
            });
            items.value = Object.values(map);
          } else {
            items.value = baseItems.map((i) => ({ ...i }));
          }
          if (typeof parsed.round === "number") round.value = parsed.round;
        } catch {
          items.value = baseItems.map((i) => ({ ...i }));
        }
      } else {
        items.value = baseItems.map((i) => ({ ...i }));
      }
    }
    function persist() {
      localStorage.setItem("run-checklist", JSON.stringify({ round: round.value, items: items.value }));
    }
    watch([items, round], persist, { deep: true });
    function visibleItem(item) {
      if (item.condition && !item.condition({ round: round.value })) return false;
      if (!showOptional.value && item.optional) return false;
      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase();
        if (!item.label.toLowerCase().includes(q)) return false;
      }
      return true;
    }
    const grouped = computed(() => {
      const map = {};
      items.value.forEach((i) => {
        if (visibleItem(i)) {
          (map[i.group] ||= []).push(i);
        }
      });
      return Object.entries(map).map(([group, arr]) => ({ group, arr }));
    });
    const progress = computed(() => {
      const vis = items.value.filter(visibleItem);
      const done = vis.filter((i) => i.done).length;
      return { done, total: vis.length, pct: vis.length ? Math.round(done / vis.length * 100) : 0 };
    });
    function quickRouteSuggestion() {
      const r = round.value;
      if (r < 5) return "Finish spawn points + optional Flora EE.";
      if (r < 8) return "Prioritize carcass at Exit 115 before Klaus.";
      if (r === 8) return "Klaus boss at Janus then summon; start canister.";
      return "Focus canister fills then consolidate Farm multitasks.";
    }
    load();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "checklist-wrapper" }, _attrs))} data-v-2c1f8cfe><div class="header-panel" data-v-2c1f8cfe><div class="flex flex-wrap items-center gap-3" data-v-2c1f8cfe><div class="round-box" data-v-2c1f8cfe><div class="label" data-v-2c1f8cfe>Round</div><div class="flex items-center gap-2" data-v-2c1f8cfe><button class="btn-mini" data-v-2c1f8cfe>-</button><input type="number"${ssrRenderAttr("value", round.value)} min="1" class="round-input" data-v-2c1f8cfe><button class="btn-mini" data-v-2c1f8cfe>+</button></div></div><div class="progress-box" data-v-2c1f8cfe><div class="label" data-v-2c1f8cfe>Progress</div><div class="bar" data-v-2c1f8cfe><div class="fill" style="${ssrRenderStyle({ width: progress.value.pct + "%" })}" data-v-2c1f8cfe></div></div><div class="stats" data-v-2c1f8cfe>${ssrInterpolate(progress.value.done)}/${ssrInterpolate(progress.value.total)} (${ssrInterpolate(progress.value.pct)}%)</div></div><div class="flex items-center gap-2" data-v-2c1f8cfe><input${ssrRenderAttr("value", search.value)} placeholder="Search" class="search-input" data-v-2c1f8cfe><label class="toggle-opt" data-v-2c1f8cfe><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(showOptional.value) ? ssrLooseContain(showOptional.value, null) : showOptional.value) ? " checked" : ""} data-v-2c1f8cfe> <span data-v-2c1f8cfe>Optional</span></label></div><div class="flex items-center gap-2 ml-auto" data-v-2c1f8cfe><button class="btn" data-v-2c1f8cfe>Reset</button><button class="btn" title="Copy remaining tasks" data-v-2c1f8cfe>Copy Remaining</button></div></div><div class="route-hint" data-v-2c1f8cfe>Route Hint: ${ssrInterpolate(quickRouteSuggestion())}</div></div><div class="groups" data-v-2c1f8cfe><!--[-->`);
      ssrRenderList(grouped.value, (g) => {
        _push(`<div class="group-block" data-v-2c1f8cfe><div class="group-header" data-v-2c1f8cfe><h3 data-v-2c1f8cfe>${ssrInterpolate(g.group)}</h3><div class="actions" data-v-2c1f8cfe><button class="btn-mini" title="Mark all done" data-v-2c1f8cfe>✔</button><button class="btn-mini" title="Unmark all" data-v-2c1f8cfe>⟳</button></div></div><ul class="item-list" data-v-2c1f8cfe><!--[-->`);
        ssrRenderList(g.arr, (item) => {
          _push(`<li class="${ssrRenderClass(["item", item.done ? "done" : "", item.optional ? "optional" : ""])}" data-v-2c1f8cfe><div class="check" data-v-2c1f8cfe>`);
          if (item.done) {
            _push(`<span data-v-2c1f8cfe>✔</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="label-text" data-v-2c1f8cfe>${ssrInterpolate(item.label)}</div>`);
          if (item.optional) {
            _push(`<div class="opt-tag" data-v-2c1f8cfe>OPT</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RunChecklist.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-2c1f8cfe"]]), { __name: "RunChecklist" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "checklist",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_RunChecklist = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl mx-auto py-8 px-4" }, _attrs))} data-v-cbbedc44><div class="mb-6 text-center" data-v-cbbedc44><h1 class="text-2xl font-bold text-white tracking-wide" data-v-cbbedc44>Run Progress Checklist</h1><p class="text-slate-300 text-sm mt-2" data-v-cbbedc44>Track your route steps, hide optional tasks, and adapt mid-run without losing flow.</p></div>`);
      _push(ssrRenderComponent(_component_RunChecklist, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/checklist.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const checklist = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cbbedc44"]]);

export { checklist as default };
//# sourceMappingURL=checklist-CuWhiT5U.mjs.map
