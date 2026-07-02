package com.mochimono.item;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByItemSetIdOrderBySortOrderAsc(Long itemSetId);

    @Modifying
    @Query("update Item i set i.checked = false where i.itemSetId = :itemSetId")
    void resetCheckedByItemSetId(@Param("itemSetId") Long itemSetId);

    void deleteByItemSetId(Long itemSetId);
}
