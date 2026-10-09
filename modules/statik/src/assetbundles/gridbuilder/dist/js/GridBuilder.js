/**
 * Control panel layer for "Content row" content builder blocks.
 *
 * The row stays two native fields: a layout button group (gridLayout) and a Matrix of cell entries in cards view
 * (gridCells), one entry per column from left to right. This layer only changes how they are shown and edited:
 *  - the cards are laid out like the columns of the row's layout, each with its width on the page;
 *  - columns without content show a placeholder to add content (types that don't fit that width are listed disabled, with the width they need), or to merge
 *    it with the column next to it;
 *  - "+" buttons on the left and right add a column (up to 3, or 2 on pages where the builder is 2/3 wide);
 *  - a card dragged (by its move handle) onto an empty column of another row moves there: Craft can't move a nested
 *    entry to another owner, so it is duplicated into that row (like Copy + Paste) and then deleted here.
 * Empty columns only exist here: saving a row with fewer blocks than columns fails validation (GridBuilder::validateRow()).
 * Settings come from GridBuilder::cpConfig(), in a [data-grid-builder] element in the Columns field.
 * When Craft's CP changes and this breaks, the native fields keep working without it.
 */
(function ($) {
    // Column spans in sixths per layout
    const SPANS = {
        full: [6],
        halves: [3, 3],
        thirds: [2, 2, 2],
        thirdTwoThirds: [2, 4],
        twoThirdsThird: [4, 2],
    };
    // Layout after adding a column, by the new number of columns
    const LAYOUT_FOR_COLUMNS = {2: 'halves', 3: 'thirds'};
    // Layout after merging column i with column i + 1, by "<layout>:<i>"
    const MERGED_LAYOUT = {
        'halves:0': 'full',
        'thirdTwoThirds:0': 'full',
        'twoThirdsThird:0': 'full',
        'thirds:0': 'twoThirdsThird',
        'thirds:1': 'thirdTwoThirds',
    };
    const EPSILON = 0.01;

    // Every content row on the page, to find drop targets when a card is dragged out of its row
    const rows = new Set();

    const formatWidth = (width) => {
        for (const [fraction, label] of [[1, 'full'], [2 / 3, '⅔'], [1 / 2, '½'], [4 / 9, '4/9'], [1 / 3, '⅓'], [2 / 9, '2/9']]) {
            if (Math.abs(width - fraction) < EPSILON) {
                return label;
            }
        }
        return `${Math.round(width * 100)}%`;
    };

    const GridRow = Garnish.Base.extend({
        $row: null,
        $cards: null,
        nem: null,
        listbox: null,
        config: null,
        empties: null,
        slotOfId: null,
        knownIds: null,
        rendered: false,
        pendingSlot: null,
        rendering: false,
        observer: null,
        resizeObserver: null,
        placeholders: null,
        $addLeft: null,
        $addRight: null,
        sort: null,
        dragging: null,
        $errorFields: null,

        init(row, cardsContainer, nem, listbox, config) {
            this.$row = $(row);
            this.$cards = $(cardsContainer).addClass('grid-builder');
            this.nem = nem;
            this.listbox = listbox;
            this.config = config;
            this.empties = [];
            this.slotOfId = {};
            this.knownIds = new Set();
            this.placeholders = {};

            this.hideDisallowedLayouts();

            this.$addLeft = this.addColumnButton('left');
            this.$addRight = this.addColumnButton('right');

            this.listbox.on('change', () => this.render());
            this.observer = new MutationObserver(() => {
                if (!this.rendering) {
                    requestAnimationFrame(() => this.render());
                }
            });
            this.observer.observe(this.$cards[0], {childList: true, subtree: true});
            this.resizeObserver = new ResizeObserver(() => this.positionAddButtons());
            this.resizeObserver.observe(this.$cards[0]);

            rows.add(this);
            this.showSavedErrors();
            this.render();
        },

        // Layout
        // ---------------------------------------------------------------------

        getLayout() {
            const value = this.listbox.$selectedOption?.data('value') ?? '';
            const layout = value.startsWith('base64:') ? atob(value.substring(7)) : value;
            return SPANS[layout] ? layout : 'full';
        },

        setLayout(layout) {
            const index = this.listbox.$options.toArray().findIndex((option) => $(option).data('value') === `base64:${btoa(layout)}`);
            if (index !== -1) {
                this.listbox.select(index);
            }
        },

        isAllowed(layout) {
            return this.config.allowedLayouts.includes(layout);
        },

        /** Layouts that can't be used here are hidden; the selected one stays visible (marked) so it can be changed */
        hideDisallowedLayouts() {
            for (const option of this.listbox.$options.toArray()) {
                const value = $(option).data('value') ?? '';
                const layout = value.startsWith('base64:') ? atob(value.substring(7)) : value;
                const allowed = this.isAllowed(layout);
                const selected = option === this.listbox.$selectedOption?.[0];
                $(option)
                    .toggleClass('hidden', !allowed && !selected)
                    .toggleClass('grid-builder__layout-invalid', !allowed && selected)
                    .attr('title', !allowed && selected ? Craft.t('app', 'This layout has columns that are too narrow for this page.') : null);
            }
            // Rounded corners on the first/last visible button, also when the ones around it are hidden
            const $visible = this.listbox.$options.not('.hidden');
            this.listbox.$options.not($visible.first()).removeClass('btngroup-btn-first');
            this.listbox.$options.not($visible.last()).removeClass('btngroup-btn-last');
            $visible.first().addClass('btngroup-btn-first');
            $visible.last().addClass('btngroup-btn-last');
        },

        /** Width of a column on the page, as a fraction (the builder can be 2/3 of the page) */
        pageWidth(span) {
            return (span / 6) * this.config.contextWidth;
        },

        typeFits(typeId, width) {
            return !this.tooNarrow(typeId, width) && !this.tooWide(typeId, width);
        },

        tooNarrow(typeId, width) {
            return width < (this.config.minWidthPerType[typeId] ?? 0) - EPSILON;
        },

        tooWide(typeId, width) {
            return width > (this.config.maxWidthPerType?.[typeId] ?? 1) + EPSILON;
        },

        /** Why a type doesn't fit a column of this width (shown under it in the "Add content" menu), or null when it fits */
        sizeHint(typeId, width) {
            if (this.tooNarrow(typeId, width)) {
                return Craft.t('app', 'Min. width {width}', {width: formatWidth(this.config.minWidthPerType[typeId])});
            }
            if (this.tooWide(typeId, width)) {
                return Craft.t('app', 'Max. width {width}', {width: formatWidth(this.config.maxWidthPerType[typeId])});
            }
            return null;
        },

        // Rendering
        // ---------------------------------------------------------------------

        getList() {
            let $list = this.$cards.children('ul.elements');
            if (!$list.length) {
                // A row without cells: create the list the nested element manager will use for its first card
                $list = $('<ul/>', {class: 'elements card-grid'}).prependTo(this.$cards);
            }
            return $list;
        },

        render() {
            this.rendering = true;
            const $list = this.getList();
            const layout = this.getLayout();
            const spans = SPANS[layout];
            const columns = spans.length;
            const $cardItems = $list.children('li').filter((i, li) => $(li).children('.element').length);
            const ids = $cardItems.toArray().map((li) => String($(li).children('.element').data('id')));

            // A new card: put it in the column it was created for
            const newIds = ids.filter((id) => !this.knownIds.has(id));
            if (this.rendered && this.pendingSlot !== null && newIds.length === 1) {
                const slot = this.pendingSlot;
                this.pendingSlot = null;
                this.rendering = false;
                this.placeNewCard($cardItems, newIds[0], slot);
                return;
            }

            // A removed card leaves an empty column where it was
            for (const [id, slot] of Object.entries(this.slotOfId)) {
                if (!ids.includes(id) && !this.empties.includes(slot)) {
                    this.empties.push(slot);
                }
            }

            // Exactly (columns - cards) empty columns; default to the right
            const emptyCount = Math.max(0, columns - ids.length);
            this.empties = [...new Set(this.empties)].filter((slot) => slot < columns).sort((a, b) => a - b).slice(0, emptyCount);
            for (let slot = columns - 1; this.empties.length < emptyCount && slot >= 0; slot--) {
                if (!this.empties.includes(slot)) {
                    this.empties.push(slot);
                }
            }
            this.empties.sort((a, b) => a - b);

            // Columns in order: cards and placeholders; cards beyond the layout are shown full width, marked
            const items = [];
            let cardIndex = 0;
            this.slotOfId = {};
            for (let slot = 0; slot < columns; slot++) {
                if (this.empties.includes(slot)) {
                    items.push({li: this.placeholder(slot, layout, spans[slot]), span: spans[slot], slot});
                } else {
                    const li = $cardItems[cardIndex++];
                    this.slotOfId[ids[cardIndex - 1]] = slot;
                    items.push({li, span: spans[slot], slot});
                }
            }
            for (; cardIndex < $cardItems.length; cardIndex++) {
                items.push({li: $cardItems[cardIndex], span: 6, slot: null});
            }

            // Remove placeholders that are no longer used
            for (const [key, placeholder] of Object.entries(this.placeholders)) {
                if (!items.some((item) => item.li === placeholder.li)) {
                    placeholder.menu?.destroy();
                    $(placeholder.li).remove();
                    delete this.placeholders[key];
                }
            }

            // Only touch the DOM where something changed: other scripts observe these cards too
            for (const {li, span, slot} of items) {
                const width = this.pageWidth(span);
                const typeId = $(li).children('.element').data('entry-type-id');
                const tooNarrow = typeId !== undefined && this.tooNarrow(typeId, width);
                const tooWide = typeId !== undefined && this.tooWide(typeId, width);
                const label = slot === null
                    ? Craft.t('app', 'Does not fit the layout')
                    : `${formatWidth(width)} of the page${tooNarrow ? ' · too narrow' : ''}${tooWide ? ' · too wide' : ''}`;
                if (li.style.gridColumn !== `span ${span}`) {
                    li.style.gridColumn = `span ${span}`;
                }
                if (li.dataset.gridWidth !== label) {
                    li.dataset.gridWidth = label;
                    li.title = tooNarrow
                        ? Craft.t('app', 'This block needs a wider column: choose another layout or move it.')
                        : (tooWide ? Craft.t('app', 'This block needs a narrower column: choose another layout or move it.') : '');
                }
                $(li).toggleClass('grid-builder__overflow', slot === null).toggleClass('grid-builder__invalid', tooNarrow || tooWide);
                // The width badge takes the colours of the card (entry type colour), set by Craft on the card element
                const card = $(li).children('.element')[0];
                for (const [from, to] of [['--custom-titlebar-bg-color', '--grid-badge-bg'], ['--custom-border-color', '--grid-badge-border'], ['--custom-text-color', '--grid-badge-text']]) {
                    const value = card?.style.getPropertyValue(from) ?? '';
                    if (li.style.getPropertyValue(to) !== value) {
                        value ? li.style.setProperty(to, value) : li.style.removeProperty(to);
                    }
                }
            }
            const current = $list.children('li').toArray();
            if (current.length !== items.length || items.some((item, i) => item.li !== current[i])) {
                items.forEach((item) => $list[0].appendChild(item.li));
            }

            this.hideDisallowedLayouts();
            this.hookCardDrag();
            // Fixed (all columns filled, every block fits, allowed layout): the errors of the failed save no longer apply
            if (this.$errorFields && !this.empties.length && ids.length === columns && this.isAllowed(layout)
                && !items.some(({li}) => li.classList.contains('grid-builder__invalid'))) {
                this.clearSavedErrors();
            }
            const canAdd = columns < 3 && this.isAllowed(LAYOUT_FOR_COLUMNS[columns + 1]);
            this.$addLeft.add(this.$addRight).toggleClass('hidden', !canAdd);
            this.positionAddButtons();
            // Content is added through the empty columns, not the field's own "Add" button
            this.nem.$createBtn?.addClass('hidden').closest('.expandable-button--collapsed').addClass('hidden');

            ids.forEach((id) => this.knownIds.add(id));
            this.rendered = true;
            // Ignore the DOM changes made here
            this.observer.takeRecords();
            this.rendering = false;
        },

        placeNewCard($cardItems, id, slot) {
            // Cards before the new one = the filled columns left of its slot
            const filledBefore = [...Array(slot).keys()].filter((s) => !this.empties.includes(s)).length;
            const $newLi = $cardItems.filter((i, li) => String($(li).children('.element').data('id')) === id);
            const $others = $cardItems.not($newLi);
            if (filledBefore < $others.length) {
                $newLi.insertBefore($others.eq(filledBefore));
            }
            this.empties = this.empties.filter((s) => s !== slot);
            // Give the new card the slot, so render() sees it as known
            this.slotOfId[id] = slot;
            this.knownIds.add(id);
            this.nem.updateSortOrder([parseInt(id)]).catch((e) => Craft.cp.displayError(e?.response?.data?.message));
            this.render();
        },

        // Errors of a failed save
        // ---------------------------------------------------------------------

        /**
         * After a failed save Craft saves the draft again (ElementsController::actionApplyDraft()), which clears the
         * errors on nested entries: only the error summary above the form still has them. This row's errors are put
         * back on its fields from there, and the row is marked like Craft marks a block with errors.
         */
        showSavedErrors() {
            const $summaryLinks = this.$row.closest('form').find('.error-summary [data-field-error-key]');
            if (!$summaryLinks.length) {
                return;
            }
            const $fields = this.$row.find('.field[data-error-key]').filter((i, field) => $(field).closest('.matrixblock')[0] === this.$row[0]);
            this.$errorFields = $();
            for (const field of $fields.toArray()) {
                const messages = $summaryLinks
                    .filter((i, link) => link.dataset.fieldErrorKey === field.dataset.errorKey)
                    .toArray()
                    .map((link) => link.textContent.trim());
                if (messages.length) {
                    Craft.ui.addErrorsToField($(field), [...new Set(messages)]);
                    this.$errorFields = this.$errorFields.add(field);
                }
            }
            if (!this.$errorFields.length) {
                this.$errorFields = null;
                return;
            }
            this.$row.addClass('grid-builder-row--error');
            const $blocktype = this.$row.children('.titlebar').find('.blocktype').first();
            if (!$blocktype.hasClass('error')) {
                $blocktype.addClass('error grid-builder__error-label');
                $('<span/>', {'data-icon': 'alert', 'aria-label': Craft.t('app', 'Error'), class: 'grid-builder__error-icon'}).appendTo($blocktype);
            }
        },

        /** Clears the errors of the layout and columns; the row stays marked while other fields still have errors */
        clearSavedErrors() {
            const $fixed = this.$errorFields.filter('[data-attribute="gridLayout"], [data-attribute="gridCells"]');
            $fixed.each((i, field) => Craft.ui.clearErrorsFromField($(field)));
            this.$errorFields = this.$errorFields.not($fixed);
            if (this.$errorFields.length) {
                return;
            }
            this.$errorFields = null;
            this.$row.removeClass('grid-builder-row--error');
            this.$row.children('.titlebar').find('.grid-builder__error-label').removeClass('error grid-builder__error-label');
            this.$row.children('.titlebar').find('.grid-builder__error-icon').remove();
        },

        // Empty columns
        // ---------------------------------------------------------------------

        placeholder(slot, layout, span) {
            const columns = SPANS[layout].length;
            const width = this.pageWidth(span);
            const key = `${slot}:${layout}`;
            if (this.placeholders[key]) {
                return this.placeholders[key].li;
            }

            const $li = $('<li/>', {class: 'grid-builder__empty'});
            // Read when a card from another row is dropped here
            $li[0].dataset.slot = slot;
            $li[0].dataset.pageWidth = width;
            const $addBtn = Craft.ui.createButton({icon: 'plus', label: Craft.t('app', 'Add content')}).addClass('dashed').appendTo($li);
            const menuId = `grid-builder-menu-${Math.floor(Math.random() * 1000000)}`;
            $('<div/>', {id: menuId, class: 'menu menu--disclosure'}).insertAfter($addBtn);
            $addBtn.attr({'aria-controls': menuId, 'data-disclosure-trigger': 'true'}).addClass('menubtn').disclosureMenu();
            const menu = $addBtn.data('disclosureMenu');
            // Every type is listed; the ones that don't fit this column are disabled, with the width they need
            for (const attributes of this.nem.settings.createAttributes ?? []) {
                const sizeHint = this.sizeHint(attributes.attributes.typeId, width);
                menu.addItem({
                    icon: attributes.icon ? $(attributes.icon)[0] : null,
                    label: attributes.label,
                    iconColor: attributes.color,
                    disabled: sizeHint !== null,
                    description: sizeHint ?? undefined,
                    attributes: sizeHint !== null ? {'aria-disabled': 'true'} : {},
                    onActivate: async () => {
                        if (sizeHint !== null) {
                            return;
                        }
                        this.pendingSlot = slot;
                        $addBtn.addClass('loading');
                        await this.nem.createElement(attributes.attributes);
                        $addBtn.removeClass('loading');
                    },
                });
            }

            if (columns > 1) {
                const $merge = $('<div/>', {class: 'grid-builder__merge'}).appendTo($li);
                if (slot > 0) {
                    const $left = Craft.ui.createButton({icon: 'arrow-left', label: Craft.t('app', 'Merge with left')}).addClass('small').appendTo($merge);
                    this.addListener($left, 'activate', () => this.merge(slot - 1));
                }
                if (slot < columns - 1) {
                    const $right = Craft.ui.createButton({icon: 'arrow-right', label: Craft.t('app', 'Merge with right')}).addClass('small').appendTo($merge);
                    this.addListener($right, 'activate', () => this.merge(slot));
                }
            }

            this.placeholders[key] = {li: $li[0], menu};
            return $li[0];
        },

        /** Merges column i with column i + 1 (one of them is empty) */
        merge(i) {
            const layout = MERGED_LAYOUT[`${this.getLayout()}:${i}`];
            if (!layout || !this.isAllowed(layout)) {
                return;
            }
            const bothEmpty = this.empties.includes(i) && this.empties.includes(i + 1);
            this.empties = [...new Set(this.empties
                .filter((slot) => bothEmpty ? slot !== i + 1 : (slot !== i && slot !== i + 1))
                .map((slot) => slot > i + 1 ? slot - 1 : slot))];
            // The column that had content keeps it, now at position i
            for (const [id, slot] of Object.entries(this.slotOfId)) {
                if (slot === i + 1) {
                    this.slotOfId[id] = i;
                } else if (slot > i + 1) {
                    this.slotOfId[id] = slot - 1;
                }
            }
            this.setLayout(layout);
        },

        // Adding columns
        // ---------------------------------------------------------------------

        addColumnButton(side) {
            const $btn = $('<button/>', {
                type: 'button',
                class: `grid-builder__add grid-builder__add--${side}`,
                'aria-label': side === 'left' ? Craft.t('app', 'Add a column on the left') : Craft.t('app', 'Add a column on the right'),
                title: side === 'left' ? Craft.t('app', 'Add a column on the left') : Craft.t('app', 'Add a column on the right'),
                html: '<span aria-hidden="true">+</span>',
            }).appendTo(this.$cards);
            this.addListener($btn, 'activate', () => this.addColumn(side));
            return $btn;
        },

        /** The bars run along the cards, not along the buttons below them */
        positionAddButtons() {
            const list = this.$cards.children('ul.elements')[0];
            if (!list) {
                return;
            }
            for (const btn of [this.$addLeft[0], this.$addRight[0]]) {
                if (btn.style.top !== `${list.offsetTop}px` || btn.style.height !== `${list.offsetHeight}px`) {
                    btn.style.top = `${list.offsetTop}px`;
                    btn.style.height = `${list.offsetHeight}px`;
                }
            }
        },

        addColumn(side) {
            const columns = SPANS[this.getLayout()].length;
            const layout = LAYOUT_FOR_COLUMNS[columns + 1];
            if (!layout || !this.isAllowed(layout)) {
                return;
            }
            if (side === 'left') {
                this.empties = [0, ...this.empties.map((slot) => slot + 1)];
                for (const id of Object.keys(this.slotOfId)) {
                    this.slotOfId[id]++;
                }
            } else {
                this.empties = [...this.empties, columns];
            }
            this.setLayout(layout);
        },

        // Moving a card to an empty column of another row
        // ---------------------------------------------------------------------

        /** Listens to Craft's own card dragging (the nested element manager recreates it when the first card is added) */
        hookCardDrag() {
            const sort = this.nem.elementSort;
            if (!sort || sort === this.sort) {
                return;
            }
            this.sort = sort;
            sort.on('dragStart', () => this.onCardDragStart(sort));
            sort.on('drag', () => this.onCardDrag(sort));
            sort.on('dragStop', () => this.onCardDragStop(sort));
        },

        /** Empty columns in other rows of the same form; the ones this card type fits in can take it */
        onCardDragStart(sort) {
            const $element = sort.$draggee?.children('.element');
            if (!$element || $element.length !== 1) {
                return;
            }
            const typeId = $element.data('entry-type-id');
            const targets = [];
            // The buttons in empty columns would swallow the mouseup that ends the drag (see GridBuilder.css)
            document.body.classList.add('grid-builder-dragging');
            for (const row of rows) {
                if (row === this || row.nem.elementEditor !== this.nem.elementEditor || !row.$cards[0].isConnected) {
                    continue;
                }
                for (const placeholder of Object.values(row.placeholders)) {
                    const li = placeholder.li;
                    if (!li.isConnected) {
                        continue;
                    }
                    const fits = row.typeFits(typeId, parseFloat(li.dataset.pageWidth));
                    li.classList.add(fits ? 'grid-builder__drop-target' : 'grid-builder__drop-target--disabled');
                    targets.push({row, li, slot: parseInt(li.dataset.slot), fits});
                }
            }
            this.dragging = {$element, targets, over: null};
        },

        onCardDrag(sort) {
            if (!this.dragging) {
                return;
            }
            const over = this.dragging.targets.find((target) => target.fits && Garnish.hitTest(sort.mouseX, sort.mouseY, target.li)) ?? null;
            if (over !== this.dragging.over) {
                this.dragging.over?.li.classList.remove('grid-builder__drop-target--over');
                over?.li.classList.add('grid-builder__drop-target--over');
                this.dragging.over = over;
            }
        },

        onCardDragStop(sort) {
            if (!this.dragging) {
                return;
            }
            // The mouse may have moved since the last drag event
            this.onCardDrag(sort);
            const {$element, targets, over} = this.dragging;
            this.dragging = null;
            document.body.classList.remove('grid-builder-dragging');
            for (const {li} of targets) {
                li.classList.remove('grid-builder__drop-target', 'grid-builder__drop-target--disabled', 'grid-builder__drop-target--over');
            }
            if (over) {
                this.moveCard($element, over.row, over.slot);
            }
        },

        /**
         * Duplicates the card's entry into the other row's column (what Copy + Paste does, without touching the clipboard),
         * then deletes it here. In that order, a failure leaves a copy behind instead of losing the content.
         */
        async moveCard($element, target, slot) {
            const $li = $element.parent().addClass('grid-builder__moving');
            Craft.cp.announce(Craft.t('app', 'Loading'));
            try {
                // Both rows in the draft first: this can give the cards and the owners new IDs
                await this.nem.markAsDirty();
                await target.nem.markAsDirty();
                const elementId = $element.data('id');
                const response = await Craft.sendActionRequest('POST', 'elements/bulk-duplicate', {
                    data: {
                        elements: [{
                            type: $element.data('type'),
                            id: this.nem.elementEditor?.getDraftElementId(elementId) || elementId,
                            siteId: $element.data('site-id'),
                        }],
                        newAttributes: {
                            primaryOwnerId: target.nem.settings.ownerId,
                            ownerId: target.nem.settings.ownerId,
                            fieldId: target.nem.settings.fieldId,
                            siteId: target.nem.settings.ownerSiteId,
                        },
                    },
                });
                const newElements = response.data.newElements ?? [];
                if (!newElements.length) {
                    throw new Error();
                }
                // The new card goes into the column it was dropped on (placeNewCard() also saves its position)
                target.pendingSlot = slot;
                await target.nem.addElementCards(newElements);
            } catch (e) {
                $li.removeClass('grid-builder__moving');
                Craft.cp.displayError(e?.response?.data?.message ?? Craft.t('app', 'A server error occurred.'));
                return;
            }

            try {
                await this.nem.deleteElement($element);
            } catch (e) {
                // deleteElement() already shows the error; the block now exists in both rows
                $li.removeClass('grid-builder__moving');
                return;
            }
            target.nem.elementEditor?.checkForm(true);
        },

        destroy() {
            rows.delete(this);
            this.observer?.disconnect();
            this.resizeObserver?.disconnect();
            for (const placeholder of Object.values(this.placeholders)) {
                placeholder.menu?.destroy();
                $(placeholder.li).remove();
            }
            this.$addLeft?.remove();
            this.$addRight?.remove();
            this.$cards.removeClass('grid-builder');
            this.base();
        },
    });

    // Find content rows, also the ones added later (new blocks, slideouts); the Matrix JS may initialise after the markup
    const initRow = (row, attempt = 0) => {
        if (row.dataset.gridBuilder) {
            return;
        }
        const cellsField = row.querySelector('[data-attribute="gridCells"]');
        const configEl = cellsField?.querySelector('[data-grid-builder]');
        const cardsContainer = cellsField?.querySelector('.nested-element-cards');
        const nem = cardsContainer ? $(cardsContainer).data('nestedElementManager') : null;
        const listbox = $(row).find('[data-attribute="gridLayout"] .btngroup').first().data('listbox');
        if (!configEl || !nem || !listbox) {
            if (attempt < 50) {
                setTimeout(() => initRow(row, attempt + 1), 100);
            }
            return;
        }
        row.dataset.gridBuilder = 'true';
        new GridRow(row, cardsContainer, nem, listbox, JSON.parse(configEl.dataset.gridBuilder));
    };

    const scan = (root) => {
        $(root).find('.matrixblock[data-type="gridRow"]').addBack('.matrixblock[data-type="gridRow"]').each((i, row) => initRow(row));
    };

    $(() => {
        scan(document.body);
        new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector?.('.matrixblock[data-type="gridRow"], [data-attribute="gridCells"]') || node.matches?.('.matrixblock[data-type="gridRow"]')) {
                        scan(node.closest?.('.matrixblock[data-type="gridRow"]') ?? node);
                    }
                }
            }
        }).observe(document.body, {childList: true, subtree: true});
    });
})(jQuery);
