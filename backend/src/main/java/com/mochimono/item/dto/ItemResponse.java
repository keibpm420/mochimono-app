package com.mochimono.item.dto;

import com.mochimono.item.Item;

public record ItemResponse(Long id, String name, boolean checked, int sortOrder) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(item.getId(), item.getName(), item.isChecked(), item.getSortOrder());
    }
}
