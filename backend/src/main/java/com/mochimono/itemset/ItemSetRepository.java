package com.mochimono.itemset;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemSetRepository extends JpaRepository<ItemSet, Long> {
    List<ItemSet> findByUserIdOrderByCreatedAtDesc(Long userId);
}
