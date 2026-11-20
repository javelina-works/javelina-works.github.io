# Table

A data table: what a tool measured, how methods compare, a grid of figures. New for the site; derived from the Prose table and the system's mono labels.

- **Column labels** (`thead th`): IBM Plex Mono 11.5px uppercase, tracked, `text-muted`, over a `line-strong` rule.
- **Cells:** 16px Figtree with tabular figures, padding `space-3`, `line` rules between rows. Row headers (`tbody th`) are `text` 500; data cells are `text-body`. Numbers align right (`jw-table__num`).
- **Never sideways:** cells wrap to fit (`overflow-wrap: anywhere`); the page never scrolls sideways.
- **Stacked on phones** (`jw-table--stack`): at 640px and below the header row hides (kept for screen readers) and each row becomes a block: the row header, then one line per cell with its column label (from `data-label`) on the left in mono and the value on the right. The ARIA roles (`table`, `row`, `cell`…) keep it a table to screen readers.
- **Chosen** cell or row (`is-selected`): a `surface` fill and the marigold `selected` ring with its `selected-hairline`, the system's one way of saying "this one".
- **Caption:** above the table, 16px `text-muted`.
- **Card** (`jw-table-wrap--card` on the wrapper): the table on its own paper card, for a table that stands alone in a section.
- **Text labels** (`jw-table--text-labels` on the table): when the column labels are phrases a reader needs, such as an article's "Practice 314 scenario (FY2025, Texas statewide)", they read as 16px Figtree 500 in `text-muted`, sentence case, instead of the mono label. The stacked labels on phones follow. With Astro, pass `class="jw-table--text-labels"`.

## Plain HTML
```html
<div class="jw-table-wrap">
  <table class="jw-table jw-table--stack" role="table">
    <caption>What we measured</caption>
    <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Measure</th><th scope="col" role="columnheader" class="jw-table__num">Value</th></tr></thead>
    <tbody role="rowgroup">
      <tr role="row"><th scope="row" role="rowheader">Area inside the fence</th><td role="cell" data-label="Value" class="jw-table__num">640 ac</td></tr>
    </tbody>
  </table>
</div>
```

## Astro
`<Table caption="…" columns={[{ key, label, align?: "end", rowHeader? }]} rows={[{ [key]: value, selected? }]} [stack={false}] [card] />` from `src/layouts/components/jw/Table.astro`. Cells are plain text; for markup in cells, write the plain HTML.

## Rules
- A table is for comparing; a list of facts about one thing is a ResultsPanel's label–value rows.
- No zebra stripes and no colored cells for meaning without words. A heat-coloured grid (the pricing page's) must still write each value in the cell.
