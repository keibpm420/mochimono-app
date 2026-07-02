package com.mochimono.itemset;

import com.mochimono.item.Item;
import com.mochimono.item.ItemService;
import com.mochimono.item.dto.ItemRequest;
import com.mochimono.item.dto.ItemResponse;
import com.mochimono.itemset.dto.ItemSetDetailResponse;
import com.mochimono.itemset.dto.ItemSetRequest;
import com.mochimono.itemset.dto.ItemSetSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sets")
public class ItemSetController {

    private final ItemSetService itemSetService;
    private final ItemService itemService;

    public ItemSetController(ItemSetService itemSetService, ItemService itemService) {
        this.itemSetService = itemSetService;
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemSetSummaryResponse> list(@AuthenticationPrincipal Long userId) {
        return itemSetService.listByUser(userId).stream()
                .map(ItemSetSummaryResponse::from)
                .toList();
    }

    @PostMapping
    public ItemSetSummaryResponse create(@AuthenticationPrincipal Long userId, @Valid @RequestBody ItemSetRequest request) {
        return ItemSetSummaryResponse.from(itemSetService.create(userId, request.name()));
    }

    @GetMapping("/{id}")
    public ItemSetDetailResponse detail(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        ItemSet itemSet = itemSetService.getOwned(userId, id);
        List<ItemResponse> items = itemService.listTreeBySet(itemSet.getId());
        return new ItemSetDetailResponse(
                itemSet.getId(), itemSet.getName(), itemSet.getCreatedAt(), itemSet.getUpdatedAt(), items
        );
    }

    @PutMapping("/{id}")
    public ItemSetSummaryResponse rename(
            @AuthenticationPrincipal Long userId, @PathVariable Long id, @Valid @RequestBody ItemSetRequest request
    ) {
        return ItemSetSummaryResponse.from(itemSetService.rename(userId, id, request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        itemSetService.delete(userId, id);
    }

    @PostMapping("/{id}/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        itemSetService.reset(userId, id);
    }

    @PostMapping("/{id}/items")
    public ItemResponse addItem(
            @AuthenticationPrincipal Long userId, @PathVariable Long id, @Valid @RequestBody ItemRequest request
    ) {
        Item item = itemService.addItem(userId, id, request.name(), request.parentItemId());
        return ItemResponse.from(item, List.of());
    }
}
