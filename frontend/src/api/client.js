// 本番ビルド時は VITE_API_BASE_URL でバックエンドの実URLを指定する。
// 未指定時はローカル開発用に「今アクセスしているホスト名の8080番」を使う(LAN内のスマホ実機からのアクセスにも対応)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8080`;
const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `リクエストに失敗しました (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // JSONでないエラーレスポンスは無視してデフォルトメッセージを使う
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}
