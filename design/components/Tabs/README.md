# Tabs

A few related panels in one place, one shown at a time: the FAQ's three topics, a tool's views. New for the site; derived from the system rules.

- **Tab row** (`jw-tabs__list`, `role="tablist"`): tabs wrap onto a second row on a phone; the page never scrolls sideways.
- **Tab** (`jw-tabs__tab`, `role="tab"`): a 44px button with a `line-strong` edge and `radius-sm`, 16px Figtree 500 in `text-body`.
  - Hover: `surface` fill and `text`.
  - Chosen (`aria-selected="true"`): a paper tab (`surface`, `text`) with the marigold `selected` ring and its `selected-hairline` outside, the same ring as a selected chip or plant marker.
  - Focus: `shadow-focus`; a chosen tab keeps its ring inside the focus ring.
  - Never orange: choosing a tab is not an action.
- **Panel** (`jw-tabs__panel`, `role="tabpanel"`, `tabindex="0"`): no frame of its own; it holds cards, an accordion or Prose.
- **Keyboard:** Left/Right (and Up/Down) move to the next tab and show it; Home and End go to the first and last. Only the chosen tab is in the Tab order (roving tabindex).
- **Without JavaScript:** the tab row is hidden and every panel shows, each under its own heading (`jw-tabs__panel-title`). One inline line right after the markup adds `is-ready` and hides the other panels before they paint, so there is no jump. The module script then adds clicks and keys.
- A `#hash` that points into a hidden panel (for example `/faq/#faq-group-1-3-2`) opens that panel's tab.
- It fires `jw-tabs-change` (bubbles; `detail.index`, `detail.tab`) when the choice changes.

## Plain HTML
```html
<div class="jw-tabs" data-jw-tabs>
  <div class="jw-tabs__list" role="tablist" aria-label="Question topics">
    <button type="button" class="jw-tabs__tab" role="tab" id="tab-item-1" aria-controls="tab-1" aria-selected="true" tabindex="0">The instant ballpark</button>
    <button type="button" class="jw-tabs__tab" role="tab" id="tab-item-2" aria-controls="tab-2" aria-selected="false" tabindex="-1">Clearing brush</button>
  </div>
  <div class="jw-tabs__panel" role="tabpanel" id="tab-1" aria-labelledby="tab-item-1" tabindex="0">
    <h2 class="jw-tabs__panel-title t-heading-3">The instant ballpark</h2>
    …
  </div>
  <div class="jw-tabs__panel" role="tabpanel" id="tab-2" aria-labelledby="tab-item-2" tabindex="0">…</div>
</div>
<script>/* the inline is-ready line, see Tabs.astro */</script>
```

## Astro
```astro
<Tabs label="Question topics" tabs={[{ id: "tab-1", tabId: "tab-item-1", label: "The instant ballpark" }, …]} selected={0}>
  <TabPanel id="tab-1" tabId="tab-item-1" label="The instant ballpark" headingLevel={2}>…</TabPanel>
</Tabs>
```
From `src/layouts/components/jw/Tabs.astro` and `TabPanel.astro`. The MDX shortcode `<Tabs><Tab name="…">…</Tab></Tabs>` renders the same markup.

## Rules
- Two to five tabs, each named in two to four plain words.
- Don't hide what most people need behind a second tab; tabs are for parallel material.
- On the ground or on a card. Never on a wall or a sheen.
