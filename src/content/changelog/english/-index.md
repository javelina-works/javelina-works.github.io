---
title: Changelog
description: Track new features, bug fixes, and version history to make the most of your website’s capabilities.
metaDescription: This is a example description
draft: false

list:
  - title: Priority for projects
    version: 0.12.5
    date: 02 Feb, 2024
    content: |
      semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit
    video:
      src: /videos/test-video.mp4
      type: mp3 # video type eg: mp4, webm etc
      provider: html5 # "youtube" | "vimeo" | "html5" (default is "youtube")
      poster: /images/video-thumbnail.jpg # Optional: URL or image path for video thumbnail
      autoplay: true # Optional: true to autoplay, false to start manually (default is false)
      id: test-changelog-video-1 # required if same video is used on multiple time on same page
    types:
      - icon: Sparkles # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: New Feature
      - icon: TrendingUp # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Improvement
      - icon: CheckCircle # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Fix
      - icon: Fingerprint # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Security
      - icon: Ban # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Deprecated
      - icon: CalendarClock # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Breaking Change
    changes:
      - active: true
        title: Fixes
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          - label: Slack
            color: crimson # emerald | indigo | slate | crimson | amber
            content: |
              We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          - label: Templates
            color: amber # emerald | indigo | slate | crimson | amber
            content: |
              Fixed URL to create project templates not working after deprecating roadmap
      - active: false
        title: Improvement
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          - label: Slack
            color: crimson # emerald | indigo | slate | crimson | amber
            content: |
              We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          - label: Templates
            color: amber # emerald | indigo | slate | crimson | amber
            content: |
              Fixed URL to create project templates not working after deprecating roadmap

  - title: A new home for your projects
    version: 0.10.5
    date: 02 Jan, 2024
    content: |
      semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.
    video:
      src: /videos/test-video.mp4
      type: mp3 # video type eg: mp4, webm etc
      provider: html5 # "youtube" | "vimeo" | "html5" (default is "youtube")
      poster: /images/video-thumbnail.jpg # Optional: URL or image path for video thumbnail
      autoplay: true # Optional: true to autoplay, false to start manually (default is false)
      id: test-changelog-video-2 # required if same video is used on multiple time on same page
    types:
      - icon: Sparkles # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: New Feature
      - icon: TrendingUp # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Improvement
      - icon: CheckCircle # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Fix
      # - icon: Fingerprint # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Security
      # - icon: Ban # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Deprecated
      # - icon: CalendarClock # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Breaking Change
    changes:
      - active: true
        title: Fixes
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          # - label: Slack
          #   color: crimson # emerald | indigo | slate | crimson | amber
          #   content: |
          #     We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          # - label: Templates
          #   color: amber # emerald | indigo | slate | crimson | amber
          #   content: |
          #     Fixed URL to create project templates not working after deprecating roadmap
      - active: false
        title: Improvement
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          - label: Slack
            color: crimson # emerald | indigo | slate | crimson | amber
            content: |
              We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          - label: Templates
            color: amber # emerald | indigo | slate | crimson | amber
            content: |
              Fixed URL to create project templates not working after deprecating roadmap

  - title: "Passkeys: A fast and secure way to log in to Stella"
    version: 0.8.5
    date: 02 Feb, 2023
    content: |
      semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero
    video:
      src: /videos/test-video.mp4
      type: mp3 # video type eg: mp4, webm etc
      provider: html5 # "youtube" | "vimeo" | "html5" (default is "youtube")
      poster: /images/video-thumbnail.jpg # Optional: URL or image path for video thumbnail
      autoplay: true # Optional: true to autoplay, false to start manually (default is false)
      id: test-changelog-video-3 # required if same video is used on multiple time on same page
    types:
      - icon: Sparkles # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: New Feature
      - icon: TrendingUp # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
        label: Improvement
      # - icon: CheckCircle # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Fix
      # - icon: Fingerprint # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Security
      # - icon: Ban # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Deprecated
      # - icon: CalendarClock # [Lucide Icons](https://lucide.dev/icons/?search=) (remember to capitalize the icon name)
      #   label: Breaking Change
    changes:
      - active: true
        title: Fixes
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          - label: Slack
            color: crimson # emerald | indigo | slate | crimson | amber
            content: |
              We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          - label: Templates
            color: amber # emerald | indigo | slate | crimson | amber
            content: |
              Fixed URL to create project templates not working after deprecating roadmap
      - active: false
        title: Improvement
        list:
          - label: Cycles
            color: emerald # emerald | indigo | slate | crimson | amber
            content: |
              Auto-numbering Cycles that end with a number will now work in more cases
          - label: Archival
            color: indigo # emerald | indigo | slate | crimson | amber
            content: |
              Issue parent relationships are now preserved after projects are restored from the archive
          - label: Board
            color: slate # emerald | indigo | slate | crimson | amber
            content: |
              Fixed issues with board column headings not being properly truncated
          - label: Slack
            color: crimson # emerald | indigo | slate | crimson | amber
            content: |
              We now unfurl issue identifier mentions in Slack only if the message was posted by a Slack user who is also a user in the Linear workspace
          - label: Templates
            color: amber # emerald | indigo | slate | crimson | amber
            content: |
              Fixed URL to create project templates not working after deprecating roadmap
---
