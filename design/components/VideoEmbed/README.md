# VideoEmbed

A video in the page that loads nothing from YouTube or Vimeo until someone chooses to watch it: the MDX VideoInline shortcode. New for the site; derived from the Figure and the shell button. The privacy policy says "Nothing loads from YouTube until you choose to watch a video", and this keeps that true for videos in the page as the Dialog does for the home page's.

- A 16:9 frame (`radius-md`, `shell-3` behind) holding the poster, if there is one (dimmed a little at night like any photo), with a shell "Play video" button on a plate in the middle. Text never sits straight on the photo: the label is on the button's own shell plate.
- A press builds the player in place (privacy-enhanced `youtube-nocookie.com`, or Vimeo with `dnt=1`) and starts it; the press counts as the gesture that lets it play with sound.
- A local video (`provider: "html5"`) is a plain `<video controls>`. If it was set to autoplay, it plays muted, and not at all under reduced motion.
- Nothing moves before the press.

## Plain HTML
```html
<div class="jw-video" data-jw-video="https://www.youtube-nocookie.com/embed/ID?autoplay=1&rel=0&playsinline=1" data-jw-video-title="Video">
  <img src="poster.webp" alt="" width="1280" height="720">
  <button type="button" class="jw-btn jw-btn--shell jw-video__play" data-jw-video-play>Play video</button>
</div>
```

## Astro
`<VideoEmbed src="ID" [provider="youtube|vimeo|html5"] [poster] [title] [playLabel] [type] [autoplay] />` from `src/layouts/components/jw/VideoEmbed.astro`. Its script builds the player on the press.

## Rules
- Never build a third-party player before a press, never autoplay a third-party video.
- Give the player a title that says what the video is.
