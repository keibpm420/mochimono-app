package com.mochimono.item.dto;

/** name, checked はどちらも省略可能。渡された項目だけ更新する */
public record ItemUpdateRequest(String name, Boolean checked) {
}
