package com.mochimono.item.dto;

import jakarta.validation.constraints.NotBlank;

/** parentItemId を指定すると、そのアイテムの子アイテムとして作成する(省略時はトップレベル) */
public record ItemRequest(@NotBlank String name, Long parentItemId) {
}
