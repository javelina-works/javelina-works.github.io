# StepCards

The steps of a job as paper cards in a numbered list, on a shell band: "How a job runs" on /services/, "Our workflow" (eight steps, `#how-a-job-runs`) on brush targeting, "How a survey goes" and "How a follow-up goes" (`#how-it-goes`). New for the site; derived from the prototype's shell band of three step cards (`design/reference/night-lamp/*-2.webp`) and the Surface card.

- **Where:** the cards sit on a `band-shell` sheen band (the band takes the lamp's pool). The section's heading sits on the page ground just above the band, never on the sheen. The anchor id goes on the section that holds both, so a jump lands on the heading.
- **Card:** `jw-surface--card` (on the band: no border, `shadow-raise-on-band`, or `castShadow` so the shadow moves with the lamp), padding `space-6` (`space-5` with four across, `space-5` / `space-4` on phones), `space-2` between its parts. Every card in a row is the same height.
- **Step label:** the `eyebrow` style (IBM Plex Mono 10.5px, uppercase, tracked) in `label`: rust by day, ember at night. Emphasis marks in the label ("Step *01*") read plain.
- **Title:** `heading-3` (22px) in `text`. **Text:** 17px `text-body`.
- **Button** (optional): a compact `quiet` button (44px tall), pinned to the foot of the card. Never the glowing primary: the header lamp is the page's one glowing action, and a step's link is a way to read more, not the page's action.
- **Columns** (`jw-stepcards`): one on phones. `jw-stepcards--3`: three from 901px. `jw-stepcards--4` (four or eight steps): two from 641px, four from 1024px. Otherwise two from 641px, three from 1024px.
- **No motion and no script:** every step is in view at once (it replaces a scroll-driven timeline whose rail lit one step at a time).

## Plain HTML
```html
<section id="how-it-goes" aria-labelledby="how-it-goes-title">
  <div class="jw-container"><div class="jw-sechead"><h2 class="t-heading-1 jw-sechead__title" id="how-it-goes-title">How a survey goes</h2></div></div>
  <div class="jw-surface jw-surface--band-shell jw-section jw-section--band" data-jw-pool="band">
    <div class="jw-container">
      <ol class="jw-stepcards jw-stepcards--4" role="list">
        <li class="jw-stepcards__item">
          <div class="jw-surface jw-surface--card jw-stepcard">
            <p class="jw-eyebrow jw-stepcard__num">Step <em>01</em></p>
            <h3 class="t-heading-3 jw-stepcard__title">A visit</h3>
            <p class="jw-stepcard__text">We walk the boundaries with you, settle what is off the table, and pick where the depot goes.</p>
          </div>
        </li>
        <li class="jw-stepcards__item">
          <div class="jw-surface jw-surface--card jw-stepcard">
            <p class="jw-eyebrow jw-stepcard__num">Step <em>04</em></p>
            <h3 class="t-heading-3 jw-stepcard__title">The map, the count, and a firm quote</h3>
            <p class="jw-stepcard__text">You can stop here with no obligation, or carry straight on into a treatment job.</p>
            <div class="jw-stepcard__action"><a class="jw-btn jw-btn--quiet jw-btn--sm" href="/services/brush-targeting/#how-a-job-runs">See the full job</a></div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</section>
```
With `castShadow`, each card is wrapped in `.jw-lit[data-jw-shadow]` with two `.jw-cast` spans (see Surface); `.jw-stepcards__item > .jw-lit` stretches it.

## Astro
`<StepBand id="how-it-goes" titleHtml="How a survey goes" steps={[{ stepHtml, titleHtml, textHtml, button?: { label, href } }]} />` from `src/layouts/components/services/StepBand.astro`. `sections/HowItWorks.astro` and `sections/StepTimeline.astro` render it from content.

## Rules
- Three to eight steps. One idea a step: what happens, and who does it.
- The heading stays on the ground above the band; the band holds only the cards.
- At most one quiet button a card, to the page that tells more.
