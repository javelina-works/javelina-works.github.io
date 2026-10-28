/*
 * Javelina Works Ballpark embed loader.
 *
 *   <div data-javelina-ballpark data-partner="your-slug"></div>
 *   <script src="https://javelinaworks.com/embed/ballpark.js" async></script>
 *
 * Replaces each [data-javelina-ballpark] element's contents with an iframe of
 * https://javelinaworks.com/embed/ballpark/ and keeps the iframe as tall as
 * its content. Optional attributes:
 *   data-partner      attribution slug, ^[a-z0-9-]{1,40}$ (others ignored)
 *   data-background   "transparent" to let the host page show through
 *   data-title        iframe title (accessibility)
 *   data-src-base     origin to load from (testing: staging or localhost)
 *
 * The container also re-dispatches the tool's messages as bubbling DOM
 * events ("javelina-ballpark:ready", "...:height", "...:estimate") with the
 * message in event.detail. See docs/embed-ballpark.md.
 */
(function () {
  "use strict";
  if (window.JavelinaBallpark) {
    window.JavelinaBallpark.mount();
    return;
  }

  var DEFAULT_BASE = "https://javelinaworks.com";
  var SLUG = /^[a-z0-9-]{1,40}$/;
  var PREFIX = "javelina-ballpark:";
  var frames = [];

  function mount(el) {
    if (el.getAttribute("data-javelina-mounted")) return;
    var base = (el.getAttribute("data-src-base") || DEFAULT_BASE).replace(
      /\/+$/,
      "",
    );
    var src;
    try {
      src = new URL(base + "/embed/ballpark/", location.href);
    } catch (e) {
      return;
    }
    el.setAttribute("data-javelina-mounted", "1");
    var partner = el.getAttribute("data-partner");
    if (partner && SLUG.test(partner)) src.searchParams.set("partner", partner);
    if (el.getAttribute("data-background") === "transparent")
      src.searchParams.set("bg", "transparent");

    var frame = document.createElement("iframe");
    frame.src = src.href;
    frame.title =
      el.getAttribute("data-title") ||
      "Brush clearing cost estimate by Javelina Works";
    // "I'm standing on it" uses the visitor's location; cross-origin frames
    // need explicit permission from the host page.
    frame.setAttribute("allow", "geolocation");
    frame.setAttribute("loading", "lazy");
    // A starting height until the first height message lands (and so lazy
    // loading has a box to observe).
    frame.style.cssText =
      "display:block;width:100%;border:0;height:960px;background:transparent;";
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(frame);
    frames.push({ frame: frame, origin: src.origin, el: el });
  }

  function mountAll() {
    var els = document.querySelectorAll("[data-javelina-ballpark]");
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.type !== "string") return;
    if (data.type.indexOf(PREFIX) !== 0) return;
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      // Only trust messages from our own iframe, served from its origin.
      if (event.source !== f.frame.contentWindow) continue;
      if (event.origin !== f.origin) return;
      if (data.type === PREFIX + "height") {
        var h = Number(data.height);
        if (h > 0 && h < 20000) f.frame.style.height = Math.ceil(h) + "px";
      }
      var evt;
      try {
        evt = new CustomEvent(data.type, { detail: data, bubbles: true });
      } catch (e) {
        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(data.type, true, false, data);
      }
      f.el.dispatchEvent(evt);
      return;
    }
  });

  window.JavelinaBallpark = { mount: mountAll };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
