package com.mochimono.itemset.dto;

import com.mochimono.itemset.ItemSet;

import java.time.Instant;

public record ItemSetSummaryResponse(Long id, String name, Instant createdAt, Instant updatedAt) {
    public static ItemSetSummaryResponse from(ItemSet itemSet) {
        return new ItemSetSummaryResponse(itemSet.getId(), itemSet.getName(), itemSet.getCreatedAt(), itemSet.getUpdatedAt());
    }
}
