import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSet, renameSet, deleteSet, addItem } from '@/api/sets';
import { deleteItem } from '@/api/items';

/** ルート=0, 子=1, 孫=2 まで作れる(バックエンドのMAX_DEPTHと合わせる) */
const MAX_DEPTH = 2;

/** アイテム自身を含まない、配下の子孫アイテムの総数 */
function countDescendants(item) {
  if (!item.children || item.children.length === 0) return 0;
  return item.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function EditItemNode({ item, depth, onDelete, childForm, newChildInputRef }) {
  const canAddChild = depth < MAX_DEPTH;
  const isFormOpenHere = childForm.openFor === item.id;

  return (
    <li className="rounded-md border">
      <div className="flex items-center justify-between py-1 pl-3 pr-1">
        <span>{item.name}</span>
        <Button variant="ghost" onClick={() => onDelete(item)}>
          削除
        </Button>
      </div>

      {item.children?.length > 0 && (
        <ul className="flex flex-col gap-2 border-t p-3 pt-2">
          {item.children.map((child) => (
            <EditItemNode
              key={child.id}
              item={child}
              depth={depth + 1}
              onDelete={onDelete}
              childForm={childForm}
              newChildInputRef={newChildInputRef}
            />
          ))}
        </ul>
      )}

      {canAddChild && (
        <div className="border-t p-3 pt-2">
          {isFormOpenHere ? (
            <form onSubmit={(e) => childForm.onSubmit(e, item.id)} className="flex gap-2">
              <Input
                ref={newChildInputRef}
                autoFocus
                placeholder="子アイテム名"
                value={childForm.value}
                onChange={(e) => childForm.onChange(e.target.value)}
              />
              <Button type="submit">追加</Button>
              <Button type="button" variant="outline" onClick={() => childForm.onClose()}>
                やめる
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => childForm.onOpen(item.id)}>
              ＋ 子アイテムを追加
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export default function SetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [name, setName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [childFormOpenFor, setChildFormOpenFor] = useState(null);
  const [newChildName, setNewChildName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const newItemInputRef = useRef(null);
  const newChildInputRef = useRef(null);

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

  /** 追加・削除のたびに画面全体を「読み込み中」に差し替えるとinputごと消えてフォーカスが外れるので、
   *  一覧の再取得だけ行いフォーム部分は再マウントしない */
  async function refreshSet() {
    try {
      setSet(await getSet(id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await renameSet(id, name.trim());
      await refreshSet();
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
      await refreshSet();
      newItemInputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddChild(e, parentItemId) {
    e.preventDefault();
    if (!newChildName.trim()) return;
    try {
      await addItem(id, newChildName.trim(), parentItemId);
      setNewChildName('');
      await refreshSet();
      newChildInputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteItem(item) {
    const descendants = countDescendants(item);
    if (descendants > 0) {
      if (!window.confirm(`「${item.name}」を削除すると、中の${descendants}件のアイテムも一緒に削除されます。よろしいですか?`)) {
        return;
      }
    }
    try {
      await deleteItem(item.id);
      await refreshSet();
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

  const childForm = {
    openFor: childFormOpenFor,
    value: newChildName,
    onOpen: (itemId) => {
      setChildFormOpenFor(itemId);
      setNewChildName('');
    },
    onClose: () => setChildFormOpenFor(null),
    onChange: setNewChildName,
    onSubmit: handleAddChild,
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Button variant="outline" size="sm" className="mb-2" render={<Link to={`/sets/${id}`} />}>
        ← チェックリストへ戻る
      </Button>

      <h1 className="mb-6 text-2xl font-bold">セット編集</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <form onSubmit={handleRename} className="mb-8 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">名前を保存</Button>
      </form>

      <h2 className="mb-2 text-lg font-semibold">アイテム</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        アイテムの中にさらに子アイテムを追加でき、最大3階層(例: スーツ→右ポケット→スマホ)まで入れ子にできます。
      </p>
      <ul className="mb-4 flex flex-col gap-3">
        {set.items.map((item) => (
          <EditItemNode
            key={item.id}
            item={item}
            depth={0}
            onDelete={handleDeleteItem}
            childForm={childForm}
            newChildInputRef={newChildInputRef}
          />
        ))}
      </ul>

      <form onSubmit={handleAddItem} className="mb-10 flex gap-2">
        <Input
          ref={newItemInputRef}
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
