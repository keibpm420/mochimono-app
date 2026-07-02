package com.mochimono.item;

import com.mochimono.itemset.ItemSet;
import com.mochimono.itemset.ItemSetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemSetRepository itemSetRepository;

    public ItemService(ItemRepository itemRepository, ItemSetRepository itemSetRepository) {
        this.itemRepository = itemRepository;
        this.itemSetRepository = itemSetRepository;
    }

    public List<Item> listBySet(Long setId) {
        return itemRepository.findByItemSetIdOrderBySortOrderAsc(setId);
    }

    public Item addItem(Long userId, Long setId, String name) {
        ItemSet itemSet = getOwnedItemSet(userId, setId);

        Item item = new Item();
        item.setItemSetId(itemSet.getId());
        item.setName(name);
        item.setSortOrder(itemRepository.findByItemSetIdOrderBySortOrderAsc(setId).size());
        return itemRepository.save(item);
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

    public void delete(Long userId, Long itemId) {
        Item item = getOwnedItem(userId, itemId);
        itemRepository.delete(item);
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
