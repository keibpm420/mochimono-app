package com.mochimono.item;

import com.mochimono.item.dto.ItemResponse;
import com.mochimono.itemset.ItemSet;
import com.mochimono.itemset.ItemSetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ItemService {

    /** アイテムの入れ子は3階層まで(ルート=0, 子=1, 孫=2) */
    private static final int MAX_DEPTH = 2;

    private final ItemRepository itemRepository;
    private final ItemSetRepository itemSetRepository;

    public ItemService(ItemRepository itemRepository, ItemSetRepository itemSetRepository) {
        this.itemRepository = itemRepository;
        this.itemSetRepository = itemSetRepository;
    }

    public List<Item> listBySet(Long setId) {
        return itemRepository.findByItemSetIdOrderBySortOrderAsc(setId);
    }

    /** セット内の全アイテムを親子ツリー構造で取得する */
    public List<ItemResponse> listTreeBySet(Long setId) {
        List<Item> allItems = itemRepository.findByItemSetIdOrderBySortOrderAsc(setId);
        Map<Long, List<Item>> itemsByParentId = allItems.stream()
                .filter(item -> item.getParentItemId() != null)
                .collect(Collectors.groupingBy(Item::getParentItemId));

        return allItems.stream()
                .filter(item -> item.getParentItemId() == null)
                .map(item -> toResponseTree(item, itemsByParentId))
                .toList();
    }

    private ItemResponse toResponseTree(Item item, Map<Long, List<Item>> itemsByParentId) {
        List<ItemResponse> children = itemsByParentId.getOrDefault(item.getId(), List.of()).stream()
                .map(child -> toResponseTree(child, itemsByParentId))
                .toList();
        return ItemResponse.from(item, children);
    }

    public Item addItem(Long userId, Long setId, String name, Long parentItemId) {
        ItemSet itemSet = getOwnedItemSet(userId, setId);

        if (parentItemId != null) {
            Item parent = itemRepository.findById(parentItemId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "親アイテムが見つかりません"));
            if (!parent.getItemSetId().equals(itemSet.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "親アイテムが同じセットに属していません");
            }
            if (depthOf(parent) >= MAX_DEPTH) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "これ以上深い階層には追加できません");
            }
        }

        Item item = new Item();
        item.setItemSetId(itemSet.getId());
        item.setParentItemId(parentItemId);
        item.setName(name);
        item.setSortOrder(itemRepository.countByItemSetIdAndParentItemId(setId, parentItemId));
        return itemRepository.save(item);
    }

    /** ルートからの深さ(ルート=0)を親をたどって数える */
    private int depthOf(Item item) {
        int depth = 0;
        Long parentId = item.getParentItemId();
        while (parentId != null) {
            depth++;
            Item parent = itemRepository.findById(parentId).orElse(null);
            parentId = parent != null ? parent.getParentItemId() : null;
        }
        return depth;
    }

    public Item update(Long userId, Long itemId, String name, Boolean checked) {
        Item item = getOwnedItem(userId, itemId);
        if (name != null) {
            item.setName(name);
        }
        if (checked != null) {
            item.setChecked(checked);
        }
        return itemRepository.save(item);
    }

    @Transactional
    public void delete(Long userId, Long itemId) {
        Item item = getOwnedItem(userId, itemId);
        deleteDescendants(item.getId());
        itemRepository.delete(item);
    }

    /** 子・孫アイテムを再帰的に削除する */
    private void deleteDescendants(Long parentId) {
        List<Item> children = itemRepository.findByParentItemId(parentId);
        for (Item child : children) {
            deleteDescendants(child.getId());
        }
        itemRepository.deleteByParentItemId(parentId);
    }

    private ItemSet getOwnedItemSet(Long userId, Long setId) {
        ItemSet itemSet = itemSetRepository.findById(setId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "セットが見つかりません"));
        if (!itemSet.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "このセットへのアクセス権がありません");
        }
        return itemSet;
    }

    private Item getOwnedItem(Long userId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "アイテムが見つかりません"));
        getOwnedItemSet(userId, item.getItemSetId());
        return item;
    }
}
