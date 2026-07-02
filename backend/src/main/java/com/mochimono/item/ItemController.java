package com.mochimono.item;

import com.mochimono.item.dto.ItemResponse;
import com.mochimono.item.dto.ItemUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PutMapping("/{id}")
    public ItemResponse update(
            @AuthenticationPrincipal Long userId, @PathVariable Long id, @RequestBody ItemUpdateRequest request
    ) {
        return ItemResponse.from(itemService.update(userId, id, request.name(), request.checked()), List.of());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        itemService.delete(userId, id);
    }
}
