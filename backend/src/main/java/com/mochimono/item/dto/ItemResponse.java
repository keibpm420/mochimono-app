package com.mochimono.item.dto;

import com.mochimono.item.Item;

import java.util.List;

public record ItemResponse(Long id, String name, boolean checked, int sortOrder, List<ItemResponse> children) {
    public static ItemResponse from(Item item, List<ItemResponse> children) {
        return new ItemResponse(item.getId(), item.getName(), item.isChecked(), item.getSortOrder(), children);
    }
}
