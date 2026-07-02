package com.mochimono.itemset.dto;

import jakarta.validation.constraints.NotBlank;

public record ItemSetRequest(@NotBlank String name) {
}
