package com.mochimono.item.dto;

import jakarta.validation.constraints.NotBlank;

public record ItemRequest(@NotBlank String name) {
}
