import { apiFetch } from '../lib/api';
import { getVkLaunchQueryString, hasVkLaunchParams as hasSignedVkLaunchParams } from '../lib/vkMiniApp';

export function getVkConfig() {
  return apiFetch('/vk/config', { auth: false });
}

export function loginWithVkLaunchParams(launchParams = getVkLaunchQueryString()) {
  return apiFetch('/vk/launch', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ launch_params: launchParams }),
  });
}

export function hasVkLaunchParams(search) {
  return hasSignedVkLaunchParams(search);
}
