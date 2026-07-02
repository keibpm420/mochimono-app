package com.mochimono.itemset.dto;

import com.mochimono.item.dto.ItemResponse;

import java.time.Instant;
import java.util.List;

public record ItemSetDetailResponse(
        Long id,
        String name,
        Instant createdAt,
        Instant updatedAt,
        List<ItemResponse> items
) {
}
