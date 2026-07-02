import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getSet, resetSet } from '@/api/sets';
import { updateItem } from '@/api/items';

export default function SetDetailPage() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSet();
  }, [id]);

  async function loadSet() {
    setLoading(true);
    try {
      setSet(await getSet(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(item) {
    const nextChecked = !item.checked;
    setSet((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i)),
    }));
    try {
      await updateItem(item.id, { checked: nextChecked });
    } catch (err) {
      setError(err.message);
      await loadSet();
    }
  }

  async function handleReset() {
    try {
      await resetSet(id);
      await loadSet();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-md px-4 py-6 text-muted-foreground">読み込み中...</p>;
  }
  if (error && !set) {
    return <p className="mx-auto max-w-md px-4 py-6 text-destructive">{error}</p>;
  }
  if (!set) {
    return null;
  }

  const allChecked = set.items.length > 0 && set.items.every((i) => i.checked);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/sets" className="text-sm text-muted-foreground hover:underline">
          ← 一覧へ戻る
        </Link>
        <Link to={`/sets/${id}/edit`} className="text-sm text-muted-foreground hover:underline">
          編集
        </Link>
      </div>

      <h1 className="mb-1 text-2xl font-bold">{set.name}</h1>
      {allChecked && <p className="mb-4 text-sm font-medium text-green-600">全部チェックできました✓</p>}

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {set.items.length === 0 ? (
        <p className="my-6 text-muted-foreground">アイテムがありません。「編集」から追加してください。</p>
      ) : (
        <ul className="mb-6 flex flex-col gap-3">
          {set.items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
                <Checkbox checked={item.checked} onCheckedChange={() => handleToggle(item)} />
                <span className={item.checked ? 'text-muted-foreground line-through' : ''}>{item.name}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" className="w-full" onClick={handleReset}>
        チェックをリセット
      </Button>
    </div>
  );
}
