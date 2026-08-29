import { _ as __nuxt_component_0 } from './nuxt-link-C-nOCECy.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toValue, reactive, watchEffect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useAsyncData, _ as __nuxt_component_0$1 } from './index-6nQcL_GX.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { useRoute } from 'vue-router';
import { z as hash, y as defu, n as joinURL, A as getRequestHeaders } from '../nitro/nitro.mjs';
import { f as fetchDefaults, u as useNuxtApp, a as useRuntimeConfig } from './server.mjs';
import { isPlainObject } from '@vue/shared';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './composables-CkNDFoWs.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'perfect-debounce';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "WikiViewer",
  __ssrInlineRender: true,
  props: {
    html: {}
  },
  setup(__props) {
    const props = __props;
    const content = ref(props.html || "");
    watchEffect(() => {
      content.value = props.html || "";
    });
    function decodeEntities(input) {
      if (!input) return "";
      return input.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    }
    const processed = computed(() => {
      const res = { html: content.value || "", toc: [] };
      if (!content.value) return res;
      let raw = decodeEntities(content.value);
      raw = raw.replace(/<!--\s*SC_OFF\s*-->/g, "").replace(/<!--\s*SC_ON\s*-->/g, "");
      {
        res.html = raw;
        return res;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 p-4 lg:p-8" }, _attrs))} data-v-ebdd125e><aside class="sticky top-4 self-start space-y-4" data-v-ebdd125e><div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4" data-v-ebdd125e><div class="flex items-center gap-2 mb-2" data-v-ebdd125e>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:book-open-page-variant",
        class: "text-cyan-300"
      }, null, _parent));
      _push(`<h2 class="text-sm font-semibold tracking-wide text-cyan-200" data-v-ebdd125e>Quick Navigation</h2></div><nav class="space-y-1 max-h-[60vh] overflow-auto pr-2" data-v-ebdd125e><!--[-->`);
      ssrRenderList(processed.value.toc, (item) => {
        _push(`<button class="block w-full text-left text-xs lg:text-sm px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" style="${ssrRenderStyle(item.level === 3 ? "margin-left: 12px" : "")}" data-v-ebdd125e>${ssrInterpolate(item.text)}</button>`);
      });
      _push(`<!--]--></nav></div><div class="backdrop-blur-xl bg-white/10 border border-white/10 shadow-xl rounded-2xl p-4" data-v-ebdd125e><div class="flex items-center gap-2 mb-2" data-v-ebdd125e>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:lightning-bolt",
        class: "text-yellow-300"
      }, null, _parent));
      _push(`<h2 class="text-sm font-semibold tracking-wide text-yellow-200" data-v-ebdd125e>High-Intensity Tips</h2></div><ul class="text-xs lg:text-sm space-y-2 text-slate-200" data-v-ebdd125e><li data-v-ebdd125e>Use the Quick Navigation to jump to steps fast.</li><li data-v-ebdd125e>Look for bold headings for key objectives.</li><li data-v-ebdd125e>Collapse long sections on mobile via your browser’s reader.</li></ul></div></aside><section class="space-y-4" data-v-ebdd125e><div class="backdrop-blur-2xl bg-white/10 border border-white/10 shadow-2xl rounded-3xl p-6 lg:p-8" data-v-ebdd125e><article class="prose prose-invert max-w-none" data-v-ebdd125e><div data-v-ebdd125e>${processed.value.html ?? ""}</div></article></div></section></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/WikiViewer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const WikiViewer = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-ebdd125e"]]), { __name: "WikiViewer" });
const allowClient = false;
const serverBasePath = "__api_party";
const CACHE_KEY_PREFIX = "$apiParty";
function isFormData(obj) {
  return obj instanceof FormData;
}
async function formDataToObject(formData) {
  const obj = {
    __type: "form-data"
  };
  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob) {
      const serializedBlob = {
        ...await serializeBlob(value),
        name: value.name,
        __type: "blob"
      };
      if (Array.isArray(obj[key]))
        obj[key].push(serializedBlob);
      else if (obj[key])
        obj[key] = [obj[key], serializedBlob];
      else
        obj[key] = serializedBlob;
    } else {
      if (Array.isArray(obj[key]))
        obj[key].push(value);
      else if (obj[key])
        obj[key] = [obj[key], value];
      else
        obj[key] = value;
    }
  }
  return obj;
}
async function serializeBlob(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const binary = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  const base64 = globalThis.btoa(binary);
  return {
    data: base64,
    type: blob.type,
    size: blob.size
  };
}
function mergeFetchHooks(...hooks) {
  const result = {
    onRequest: [],
    onResponse: [],
    onRequestError: [],
    onResponseError: []
  };
  for (const hook of hooks) {
    maybePush(result.onRequest, hook.onRequest);
    maybePush(result.onResponse, hook.onResponse);
    maybePush(result.onRequestError, hook.onRequestError);
    maybePush(result.onResponseError, hook.onResponseError);
  }
  return result;
}
function maybePush(array, values) {
  if (values) {
    if (Array.isArray(values)) {
      array.push(...values);
    } else {
      array.push(values);
    }
  }
}
function resolvePathParams(path, params) {
  if (params) {
    for (const [key, value] of Object.entries(params))
      path = path.replace(`{${key}}`, encodeURIComponent(String(toValue(value))));
  }
  return path;
}
async function serializeMaybeEncodedBody(value) {
  if (isFormData(value))
    return await formDataToObject(value);
  return value;
}
function mergeHeaders(...headers) {
  return new Headers(headers.filter(Boolean).flatMap((h) => [...new Headers(h)]));
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestHeaders(include) {
  const event = useRequestEvent();
  const _headers = event ? getRequestHeaders(event) : {};
  if (!include || !event) {
    return _headers;
  }
  const headers = /* @__PURE__ */ Object.create(null);
  for (const _key of include) {
    const key = _key.toLowerCase();
    const header = _headers[key];
    if (header) {
      headers[key] = header;
    }
  }
  return headers;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
function getPromiseMap(nuxt) {
  return nuxt._pendingRequests ||= /* @__PURE__ */ new Map();
}
async function _$api(endpointId, path, opts = {}) {
  const nuxt = useNuxtApp();
  const apiParty = useRuntimeConfig().public.apiParty;
  const {
    path: pathParams,
    query,
    headers,
    method,
    body,
    client = allowClient === "always",
    key,
    cache: _cache,
    $fetch = useRequestFetch(),
    ...fetchOptions
  } = defu(
    opts,
    nuxt.$apiParty?.endpoints?.[endpointId]?.defaults,
    nuxt.$apiParty?.defaults
  );
  if (client && !allowClient)
    throw new Error('Client-side API requests are disabled. Set "client: true" in the module options to enable them.');
  const enablePayloadCache = typeof _cache === "boolean" ? _cache : false;
  const cache = typeof _cache === "boolean" ? _cache ? "default" : "no-store" : _cache;
  let _key;
  const getCacheKey = () => {
    if (_key)
      return _key;
    _key = key || CACHE_KEY_PREFIX + hash([
      endpointId,
      path,
      pathParams,
      query,
      method,
      ...isFormData(body) ? [] : [body]
    ]);
    return _key;
  };
  const endpoint = apiParty.endpoints[endpointId];
  {
    const k = getCacheKey();
    if ((nuxt.isHydrating || enablePayloadCache) && nuxt.payload.data[k]) {
      return nuxt.payload.data[k];
    }
    if (enablePayloadCache) {
      const result = getPromiseMap(nuxt).get(k);
      if (result) {
        return result;
      }
    }
  }
  const fetchHooks = mergeFetchHooks(fetchOptions, {
    async onRequest(ctx) {
      await nuxt.callHook("api-party:request", ctx);
      await nuxt.callHook(`api-party:request:${endpointId}`, ctx);
    },
    async onResponse(ctx) {
      await nuxt.callHook(`api-party:response:${endpointId}`, ctx);
      await nuxt.callHook("api-party:response", ctx);
    }
  });
  const serverFetcher = async () => await $fetch(joinURL("/api", serverBasePath, endpointId), {
    ...fetchOptions,
    ...fetchHooks,
    cache,
    method: "POST",
    body: {
      path: resolvePathParams(path, pathParams),
      query,
      headers: [...mergeHeaders(
        headers,
        endpoint.cookies ? useRequestHeaders(["cookie"]) : void 0
      )],
      method,
      body: await serializeMaybeEncodedBody(body)
    }
  });
  const request = serverFetcher().then((response) => {
    {
      const k = getCacheKey();
      nuxt.payload.data[k] = response;
      getPromiseMap(nuxt).delete(k);
    }
    return response;
  }).catch((error) => {
    {
      const k = getCacheKey();
      nuxt.payload.data[k] = void 0;
      getPromiseMap(nuxt).delete(k);
    }
    throw error;
  });
  {
    const k = getCacheKey();
    getPromiseMap(nuxt).set(k, request);
  }
  return request;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _request = computed(() => toValue(request));
  const key = computed(() => toValue(opts.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]));
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watchSources,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
  };
  const asyncData = useAsyncData(watchSources === false ? key.value : key, (_, { signal }) => {
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal, ..._fetchOptions });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  const segments = [
    toValue(opts.method)?.toUpperCase() || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const obj = {};
      for (const entry of value.entries()) {
        const [key, val] = entry;
        obj[key] = val instanceof File ? val.name : val;
      }
      segments.push(hash(obj));
    } else if (isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
function _useApiData(endpointId, path, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  {
    opts.cache ??= true;
  }
  const {
    path: pathParams,
    client = allowClient === "always",
    cache,
    $fetch,
    ...fetchOptions
  } = opts;
  const _path = computed(() => resolvePathParams(toValue(path), toValue(pathParams)));
  const _key = computed(() => toValue(opts.key) || CACHE_KEY_PREFIX + hash([
    autoKey,
    endpointId,
    _path.value,
    toValue(opts.query),
    toValue(opts.method),
    ...isFormData(toValue(opts.body)) ? [] : [toValue(opts.body)]
  ]));
  if (toValue(client) && !allowClient)
    throw new Error('Client-side API requests are disabled. Set "client: true" in the module options to enable them.');
  return useFetch(_path, {
    ...fetchOptions,
    key: _key,
    $fetch: ((request, opts2) => _$api(endpointId, request, {
      ...opts2,
      $fetch: toValue($fetch),
      cache: toValue(cache),
      client: toValue(client),
      key: _key.value
    }))
  }, "$qzbKHNwPIy");
}
const useRedditData = (...args) => _useApiData("reddit", ...args);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[page]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const slug = String(route.params.page || "");
    const { data, error, status } = useRedditData(`r/CODZombies/wiki/${encodeURIComponent(slug)}.json?t=${Date.now()}`);
    const htmlComputed = computed(() => {
      const raw = data?.value;
      return raw?.data?.content_html || "<p>No content</p>";
    });
    const html = ref(htmlComputed.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-7xl mx-auto py-6 lg:py-10" }, _attrs))}><header class="px-4 lg:px-8 mb-4"><div class="flex items-center justify-between"><h1 class="text-2xl lg:text-3xl font-bold text-white capitalize">${ssrInterpolate(unref(slug).replace(/-/g, " "))}</h1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-sm text-cyan-300 hover:text-cyan-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Back to search`);
          } else {
            return [
              createTextVNode("Back to search")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header>`);
      if (unref(status).value === "pending") {
        _push(`<div class="px-4 lg:px-8"><div class="animate-pulse h-8 w-48 bg-white/10 rounded-lg mb-3"></div><div class="animate-pulse h-64 bg-white/10 rounded-2xl"></div></div>`);
      } else if (unref(status).value === "error") {
        _push(`<div class="px-4 lg:px-8"><div class="backdrop-blur-xl bg-red-400/15 border border-red-500/30 text-red-200 rounded-2xl p-4"> Failed to load wiki content. Try again. </div></div>`);
      } else {
        _push(`<div class="px-0">`);
        _push(ssrRenderComponent(WikiViewer, { html: html.value }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/wiki/[page].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_page_-DyJA733O.mjs.map
