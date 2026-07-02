import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listSets, createSet } from '@/api/sets';
import { clearToken } from '@/api/client';
import { ListChecks, LogOut, Pencil, Plus } from 'lucide-react';

export default function SetListPage() {
  const [sets, setSets] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSets();
  }, []);

  async function loadSets() {
    setLoading(true);
    try {
      setSets(await listSets());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createSet(newName.trim());
      setNewName('');
      await loadSets();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">持ち物セット一覧</h1>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut data-icon="inline-start" />
          ログアウト
        </Button>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          placeholder="新しいセット名(例: 出張用)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit">
          <Plus data-icon="inline-start" />
          作成
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : sets.length === 0 ? (
        <p className="text-muted-foreground">まだセットがありません。上のフォームから作成してください。</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map((set) => (
            <Card key={set.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  <Link to={`/sets/${set.id}`} className="hover:underline">
                    {set.name}
                  </Link>
                </CardTitle>
                <Button variant="outline" size="sm" render={<Link to={`/sets/${set.id}/edit`} />}>
                  編集
                </Button>
              </CardHeader>
              <CardContent>
                <Link to={`/sets/${set.id}`}>
                  <Button variant="secondary" className="w-full">
                    チェックする
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
