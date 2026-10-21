#!/bin/sh
# Redraws every topic's badge into public/images/badges/<game>/<topic>.svg.
# Run it from the project root after adding or renaming a topic: sh scripts/make-badges.sh
set -e
tmp=$(mktemp -d)
npx --yes esbuild@0.24 app/badges.js --bundle --format=esm --platform=node --log-level=error --outfile="$tmp/badges.mjs"
node --input-type=module -e "
const { topicsByGame } = await import('$tmp/badges.mjs');
const topics = Object.fromEntries(Object.entries(topicsByGame).map(([game, list]) => [game, list.map((topic) => ({
  id: topic.id, name: topic.name, icon: topic.icon ?? null, pattern: topic.pattern ?? null, color: topic.color,
}))]));
console.log(JSON.stringify(topics));
" > "$tmp/topics.json"
python3 scripts/make-badges.py "$PWD" "$tmp/topics.json"
rm -rf "$tmp"
