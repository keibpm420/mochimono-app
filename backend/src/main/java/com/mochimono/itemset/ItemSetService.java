package com.mochimono.itemset;

import com.mochimono.item.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ItemSetService {

    private final ItemSetRepository itemSetRepository;
    private final ItemRepository itemRepository;

    public ItemSetService(ItemSetRepository itemSetRepository, ItemRepository itemRepository) {
        this.itemSetRepository = itemSetRepository;
        this.itemRepository = itemRepository;
    }

    public List<ItemSet> listByUser(Long userId) {
        return itemSetRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ItemSet create(Long userId, String name) {
        ItemSet itemSet = new ItemSet();
        itemSet.setUserId(userId);
        itemSet.setName(name);
        return itemSetRepository.save(itemSet);
    }

    /** 指定IDのセットを取得し、自分のセットでなければ 403 を投げる */
    public ItemSet getOwned(Long userId, Long setId) {
        ItemSet itemSet = itemSetRepository.findById(setId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "セットが見つかりません"));
        if (!itemSet.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "このセットへのアクセス権がありません");
        }
        return itemSet;
    }

    public ItemSet rename(Long userId, Long setId, String name) {
        ItemSet itemSet = getOwned(userId, setId);
        itemSet.setName(name);
        return itemSetRepository.save(itemSet);
    }

    @Transactional
    public void delete(Long userId, Long setId) {
        ItemSet itemSet = getOwned(userId, setId);
        itemRepository.deleteByItemSetId(itemSet.getId());
        itemSetRepository.delete(itemSet);
    }

    @Transactional
    public void reset(Long userId, Long setId) {
        ItemSet itemSet = getOwned(userId, setId);
        itemRepository.resetCheckedByItemSetId(itemSet.getId());
    }
}
