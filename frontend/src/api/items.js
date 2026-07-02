import { apiFetch } from './client';

export function updateItem(id, { name, checked } = {}) {
  return apiFetch(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, checked }),
  });
}

export function deleteItem(id) {
  return apiFetch(`/api/items/${id}`, { method: 'DELETE' });
}
