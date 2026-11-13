# X Video Volume Memory

A small Chrome extension that remembers the volume you set on X (Twitter) videos and applies it to every video you watch, so you no longer have to turn each one down from 100%.

## Features

- Set the volume on any video once and every other video uses it.
- The level is remembered after you reload the page or restart the browser.
- The mute button does not overwrite your saved level, so unmuting returns to it.
- A popup lets you turn the extension on or off and set the volume by hand.
- Works on `x.com` and `twitter.com`. No data leaves your browser.

## Install

The extension is not on the Chrome Web Store, so load it manually:

1. Download or clone this repository and keep the folder somewhere permanent.
2. Open `chrome://extensions` in Chrome (or any Chromium browser such as Edge or Brave).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `x-volume-memory` folder.

If you move or delete the folder, Chrome removes the extension.

## Use

Drag the volume slider on any X video. That level is saved and used for all other videos. Click the extension icon to turn it off or set the volume from there.

## How it works

A content script runs on x.com and listens for volume changes on video elements. It saves a level only when the change comes from your own mouse or keyboard input, not when the page's player resets it. It then applies the saved level to every video as it loads or starts playing. The level is stored with `chrome.storage.local`.

## Permissions

- `storage`: to save your volume and the on/off setting.
- Access to `https://x.com/*` and `https://twitter.com/*`: to run on those sites only.

## Limitations

- Videos that autoplay muted in the feed still start muted. Only the volume level is remembered, not the mute state.
- If X changes how its video player works, the extension may need an update.

## License

MIT. See [LICENSE](LICENSE).
