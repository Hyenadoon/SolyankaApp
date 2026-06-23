import bridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';

const VK_PARAM_PREFIX = 'vk_';
const SIGN_PARAM = 'sign';

const vkRuntime = {
  initialized: false,
  isVkMiniApp: false,
  launchParams: null,
  config: null,
  lastError: null,
};

function getCurrentSearch() {
  if (typeof window === 'undefined') {
    return '';
  }

  if (window.location.search) {
    return window.location.search;
  }

  const hash = window.location.hash || '';
  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex >= 0) {
    return hash.slice(hashQueryIndex);
  }

  return '';
}

function normalizeSearch(search = '') {
  return search.startsWith('?') ? search : `?${search}`;
}

function fallbackParseLaunchParams(search = getCurrentSearch()) {
  const params = new URLSearchParams(normalizeSearch(search));
  const launchParams = {};

  params.forEach((value, key) => {
    if (key === SIGN_PARAM || key.startsWith(VK_PARAM_PREFIX)) {
      launchParams[key] = value;
    }
  });

  return launchParams;
}

export function parseVkLaunchParams(search = getCurrentSearch()) {
  if (!search) {
    return {};
  }

  try {
    return parseURLSearchParamsForGetLaunchParams(normalizeSearch(search));
  } catch {
    return fallbackParseLaunchParams(search);
  }
}

export function serializeVkLaunchParams(launchParams = {}) {
  const params = new URLSearchParams();

  Object.entries(launchParams).forEach(([key, value]) => {
    if ((key === SIGN_PARAM || key.startsWith(VK_PARAM_PREFIX)) && value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

export function getVkLaunchQueryString() {
  const fromUrl = parseVkLaunchParams(getCurrentSearch());
  const queryFromUrl = serializeVkLaunchParams(fromUrl);

  if (queryFromUrl) {
    return queryFromUrl;
  }

  return serializeVkLaunchParams(vkRuntime.launchParams || {});
}

export function hasVkLaunchParams(search = getCurrentSearch()) {
  const launchParams = parseVkLaunchParams(search);
  const fallbackParams = vkRuntime.launchParams || {};

  return Boolean((launchParams.vk_user_id || fallbackParams.vk_user_id) && (launchParams.sign || fallbackParams.sign));
}

export function shouldUseVkRuntime() {
  return hasVkLaunchParams() || bridge.isEmbedded() || bridge.isWebView();
}

function applyVkInsets(insets = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('--vk-bridge-inset-top', `${Number(insets.top) || 0}px`);
  root.style.setProperty('--vk-bridge-inset-right', `${Number(insets.right) || 0}px`);
  root.style.setProperty('--vk-bridge-inset-bottom', `${Number(insets.bottom) || 0}px`);
  root.style.setProperty('--vk-bridge-inset-left', `${Number(insets.left) || 0}px`);
}

function handleBridgeEvent(event) {
  const { type, data } = event.detail || {};

  if (type === 'VKWebAppUpdateConfig' && data) {
    vkRuntime.config = data;
    applyVkInsets(data.insets);
  }
}

export function getVkRuntimeState() {
  return { ...vkRuntime };
}

export async function initVkMiniApp() {
  if (vkRuntime.initialized) {
    return getVkRuntimeState();
  }

  vkRuntime.isVkMiniApp = shouldUseVkRuntime();
  vkRuntime.launchParams = parseVkLaunchParams(getCurrentSearch());
  vkRuntime.initialized = true;

  bridge.subscribe(handleBridgeEvent);

  if (!vkRuntime.isVkMiniApp) {
    return getVkRuntimeState();
  }

  try {
    await bridge.send('VKWebAppInit');
  } catch (error) {
    vkRuntime.lastError = error;
  }

  try {
    vkRuntime.config = await bridge.send('VKWebAppGetConfig');
    applyVkInsets(vkRuntime.config?.insets);
  } catch (error) {
    vkRuntime.lastError = error;
  }

  try {
    vkRuntime.launchParams = await bridge.send('VKWebAppGetLaunchParams');
  } catch (error) {
    vkRuntime.lastError = error;
  }

  return getVkRuntimeState();
}

export function getVkUserInfo(options = {}) {
  return bridge.send('VKWebAppGetUserInfo', options);
}

export { bridge };
