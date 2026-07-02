import { apiFetch } from './client';

export function listSets() {
  return apiFetch('/api/sets');
}

export function createSet(name) {
  return apiFetch('/api/sets', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function getSet(id) {
  return apiFetch(`/api/sets/${id}`);
}

export function renameSet(id, name) {
  return apiFetch(`/api/sets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

export function deleteSet(id) {
  return apiFetch(`/api/sets/${id}`, { method: 'DELETE' });
}

export function resetSet(id) {
  return apiFetch(`/api/sets/${id}/reset`, { method: 'POST' });
}

export function addItem(setId, name) {
  return apiFetch(`/api/sets/${setId}/items`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}
