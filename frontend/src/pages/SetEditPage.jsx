import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSet, renameSet, deleteSet, addItem } from '@/api/sets';
import { deleteItem } from '@/api/items';

export default function SetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [name, setName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSet();
  }, [id]);

  async function loadSet() {
    setLoading(true);
    try {
      const data = await getSet(id);
      setSet(data);
      setName(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await renameSet(id, name.trim());
      await loadSet();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      await addItem(id, newItemName.trim());
      setNewItemName('');
      await loadSet();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await deleteItem(itemId);
      await loadSet();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSet() {
    if (!window.confirm('このセットを削除しますか?元に戻せません。')) return;
    try {
      await deleteSet(id);
      navigate('/sets');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-md px-4 py-6 text-muted-foreground">読み込み中...</p>;
  }
  if (!set) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Link to={`/sets/${id}`} className="mb-4 inline-block text-sm text-muted-foreground hover:underline">
        ← チェックリストへ戻る
      </Link>

      <h1 className="mb-6 text-2xl font-bold">セット編集</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <form onSubmit={handleRename} className="mb-8 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">名前を保存</Button>
      </form>

      <h2 className="mb-2 text-lg font-semibold">アイテム</h2>
      <ul className="mb-4 flex flex-col gap-2">
        {set.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-md border p-3">
            <span>{item.name}</span>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
              削除
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddItem} className="mb-10 flex gap-2">
        <Input
          placeholder="新しいアイテム名"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button type="submit">追加</Button>
      </form>

      <Button variant="destructive" className="w-full" onClick={handleDeleteSet}>
        このセットを削除
      </Button>
    </div>
  );
}
