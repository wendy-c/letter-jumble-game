#!/bin/sh
# Draws the logo with its name, public/images/logo-name.png and logo-name-beta.png (540x192,
# shown at 270x96), from scripts/logo/logo.html with headless Chrome. Needs the internet for
# the Fredoka font. Run from the project root: sh scripts/make-logo.sh
set -e
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PAGE="file://$(pwd)/scripts/logo/logo.html"
for version in "" "beta"; do
  out="public/images/logo-name${version:+-$version}.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --default-background-color=00000000 --force-device-scale-factor=2 --window-size=270,96 \
    --virtual-time-budget=5000 --screenshot="$(pwd)/$out" "$PAGE${version:+?$version}" 2>/dev/null
  echo "$out"
done
