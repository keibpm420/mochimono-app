import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getSet, resetSet } from '@/api/sets';
import { updateItem } from '@/api/items';

/** 末端(子を持たない)アイテムの数を数える */
function countLeaves(item) {
    if (!item.children || item.children.length === 0) return 1;
    return item.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

/** チェック済みの末端アイテムの数を数える */
function countCheckedLeaves(item) {
    if (!item.children || item.children.length === 0)
        return item.checked ? 1 : 0;
    return item.children.reduce(
        (sum, child) => sum + countCheckedLeaves(child),
        0
    );
}

/** アイテム(子を含む)がすべてチェック済みかどうか */
function isItemDone(item) {
    return countCheckedLeaves(item) === countLeaves(item);
}

/** 指定したidのアイテムのchecked状態を、何階層下にあっても再帰的に更新する */
function updateCheckedRecursive(items, itemId, checked) {
    return items.map((item) => {
        if (item.id === itemId) return { ...item, checked };
        if (item.children?.length > 0) {
            return {
                ...item,
                children: updateCheckedRecursive(
                    item.children,
                    itemId,
                    checked
                ),
            };
        }
        return item;
    });
}

function ItemRow({ item, onToggle }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
            <Checkbox
                checked={item.checked}
                onCheckedChange={() => onToggle(item)}
            />
            <span
                className={
                    item.checked ? 'text-muted-foreground line-through' : ''
                }
            >
                {item.name}
            </span>
        </label>
    );
}

const ACCORDION_DURATION_MS = 400;
/** ics.media「CSSのlinear()でUIが軽快になる」で紹介されているスプリングイージング */
const ACCORDION_SPRING_EASING =
    'linear(0, 0.0107, 0.0398, 0.0834, 0.138, 0.2003, 0.2677, 0.3379, 0.4089, 0.4791, 0.5471, 0.612, 0.6731, 0.7297, 0.7815, 0.8283, 0.87, 0.9068, 0.9388, 0.9662, 0.9892, 1.0083, 1.0237, 1.0357, 1.0449, 1.0514, 1.0556, 1.058, 1.0587, 1.0581, 1.0563, 1.0538, 1.0506, 1.0469, 1.043, 1.0388, 1.0347, 1.0306, 1.0266, 1.0228, 1.0192, 1.0159, 1.0128, 1.0101, 1.0076, 1.0055, 1.0036, 1.002, 1.0006, 0.9995, 0.9986, 0.9979, 0.9974, 0.997, 0.9967, 0.9966, 0.9966, 0.9966, 0.9967, 0.9968, 0.997, 0.9972, 0.9975, 0.9977, 0.998, 0.9982, 0.9984, 0.9987, 0.9989, 0.9991, 0.9992, 0.9994, 0.9996, 0.9997, 0.9998, 0.9999, 1, 1, 1.0001, 1.0001, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0002, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1, 1, 1)';

function ItemGroup({ item, onToggle }) {
    const checkedCount = countCheckedLeaves(item);
    const total = countLeaves(item);

    const detailsRef = useRef(null);
    const summaryRef = useRef(null);
    const contentRef = useRef(null);
    const animationRef = useRef(null);
    const isExpandingRef = useRef(false);
    const isClosingRef = useRef(false);

    /** details要素の高さをWeb Animation APIでアニメーションさせて閉じる。
     *  Animation.finished を待ってから、閉じきったタイミングでopen属性を外す */
    async function shrink() {
        isClosingRef.current = true;
        const detailsEl = detailsRef.current;
        const startHeight = `${detailsEl.offsetHeight}px`;
        const endHeight = `${summaryRef.current.offsetHeight}px`;

        animationRef.current?.cancel();
        detailsEl.style.overflow = 'hidden';
        animationRef.current = detailsEl.animate(
            { height: [startHeight, endHeight] },
            { duration: ACCORDION_DURATION_MS, easing: ACCORDION_SPRING_EASING }
        );

        try {
            await animationRef.current.finished;
            detailsEl.open = false;
            detailsEl.style.overflow = '';
        } catch {
            // 新しいアニメーションにキャンセルされた場合は何もしない(新しい方に処理を任せる)
        } finally {
            isClosingRef.current = false;
        }
    }

    /** open属性を先に立ててコンテンツを可視化してから、高さをアニメーションさせて開く */
    async function expand() {
        isExpandingRef.current = true;
        const detailsEl = detailsRef.current;
        detailsEl.open = true;
        const startHeight = `${summaryRef.current.offsetHeight}px`;
        const endHeight = `${summaryRef.current.offsetHeight + contentRef.current.offsetHeight}px`;

        animationRef.current?.cancel();
        detailsEl.style.overflow = 'hidden';
        animationRef.current = detailsEl.animate(
            { height: [startHeight, endHeight] },
            { duration: ACCORDION_DURATION_MS, easing: ACCORDION_SPRING_EASING }
        );

        try {
            await animationRef.current.finished;
            detailsEl.style.overflow = '';
        } catch {
            // 新しいアニメーションにキャンセルされた場合は何もしない(新しい方に処理を任せる)
        } finally {
            isExpandingRef.current = false;
        }
    }

    function handleSummaryClick(e) {
        e.preventDefault();

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            detailsRef.current.open = !detailsRef.current.open;
            return;
        }

        if (isClosingRef.current || !detailsRef.current.open) {
            expand();
        } else if (isExpandingRef.current || detailsRef.current.open) {
            shrink();
        }
    }

    return (
        <details ref={detailsRef} className="group rounded-md border">
            <summary
                ref={summaryRef}
                onClick={handleSummaryClick}
                className="flex cursor-pointer list-none items-center justify-between p-3 marker:content-none"
            >
                <span className="font-medium">{item.name}</span>
                <span
                    className={
                        checkedCount === total
                            ? 'rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-600'
                            : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
                    }
                >
                    {checkedCount}/{total}
                </span>
            </summary>
            <ul ref={contentRef} className="flex flex-col gap-2 border-t p-3 pt-2">
                {item.children.map((child) => (
                    <li key={child.id}>
                        <ItemNode item={child} onToggle={onToggle} />
                    </li>
                ))}
            </ul>
        </details>
    );
}

function ItemNode({ item, onToggle }) {
    if (item.children?.length > 0) {
        return <ItemGroup item={item} onToggle={onToggle} />;
    }
    return <ItemRow item={item} onToggle={onToggle} />;
}

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
            items: updateCheckedRecursive(prev.items, item.id, nextChecked),
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
        return (
            <p className="mx-auto max-w-md px-4 py-6 text-muted-foreground">
                読み込み中...
            </p>
        );
    }
    if (error && !set) {
        return (
            <p className="mx-auto max-w-md px-4 py-6 text-destructive">
                {error}
            </p>
        );
    }
    if (!set) {
        return null;
    }

    const allChecked = set.items.length > 0 && set.items.every(isItemDone);

    return (
        <div className="mx-auto max-w-md px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    render={<Link to="/sets" />}
                >
                    ← 一覧へ戻る
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    render={<Link to={`/sets/${id}/edit`} />}
                >
                    編集
                </Button>
            </div>

            <h1 className="mb-4 text-2xl font-bold">{set.name}</h1>
            {allChecked && (
                <p className="mb-4 text-sm font-medium text-green-600">
                    全部チェックできました✓
                </p>
            )}

            {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

            {set.items.length === 0 ? (
                <p className="my-6 text-muted-foreground">
                    アイテムがありません。「編集」から追加してください。
                </p>
            ) : (
                <ul className="mb-6 flex flex-col gap-3">
                    {set.items.map((item) => (
                        <li key={item.id}>
                            <ItemNode item={item} onToggle={handleToggle} />
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
