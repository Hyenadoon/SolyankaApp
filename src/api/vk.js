import { apiFetch } from '../lib/api';

function getLaunchQuery() {
  if (typeof window === 'undefined') return '';
  return window.location.search.replace(/^\?/, '');
}

export function getVkConfig() {
  return apiFetch('/vk/config', { auth: false });
}

export function loginWithVkLaunchParams(launchParams = getLaunchQuery()) {
  return apiFetch('/vk/launch', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ launch_params: launchParams }),
  });
}

export function hasVkLaunchParams(search = getLaunchQuery()) {
  return /(^|&)vk_user_id=/.test(search) && /(^|&)sign=/.test(search);
}
