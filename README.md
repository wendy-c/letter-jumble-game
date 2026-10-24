# The Rainbow Academy

A kawaii magic-academy learning app for children aged 3–6, built with Next.js. Children spell
English words, read Chinese characters (with Cantonese audio), earn rainbow coins, collect
badges, and spend their coins on Mochi the Rainbow Dragon.

## The games

The front page groups the games under four headings:

| Heading | Game | Ages | What it is |
| --- | --- | --- | --- |
| Phonics | CVC Sounds | 3–4 | Fill in the beginning, middle or ending letter of a three-letter word. 12 words per round. |
| | Consonant Digraphs | 3–4 | Fill the missing digraph (ch, sh, th, ph, wh, ck, ng) in a word. 10 words per round. |
| Cambridge YLE training | Letter Jumble for Starters | 5–6 | Spell Cambridge Starters words from jumbled letters (8 topics, from Pets and Farm to Home). |
| | Letter Jumble for Movers | 5–6 | The same game with Cambridge Movers words (8 topics). |
| 中文 | 中文認字 · 入門篇 | 3–4 | Read a character, pick its picture. |
| | 中文認字 · 進階篇 | 5–6 | Two- to five-character words: jobs, home, animals, places. |
| | 量詞配對 | 5–6 | Pick the noun that goes with a measure word (一個橙). 20 questions per round. |
| | 成語 | 5–6 | Fill the missing character of a four-character idiom, from a picture and its meaning. |
| Visit Mochi | Mochi the Rainbow Dragon | All | A 3D pet dragon. Spend coins on treats, grooming and activities. Save 100 coins to unlock her shy friend Tofu; then the game opens in Rainbow Village. |

### How rounds work

- Every topic deals its questions in a random order. The right answer's position and the
  scrambled letters also change with each deal.
- **Each question has one try.** A right answer earns a rainbow coin. A wrong answer shows the
  right answer on a card, then moves to the next question.
- At the end of a topic the child sees their score (e.g. 8 / 10). **Only a perfect score earns
  the topic's badge.** Badges are shown under *My badges* in the player menu.
- Leaving a topic part-way keeps the child's place, order and answers so far.

### Players and Parent mode

- Each child is a player with a name and an age group (3–4 or 5–6). They only see the games for
  their age to begin with.
- **Parent mode** is in the player menu, behind a grown-up maths question. Use it to turn any game
  on or off for each child.

### Where things are saved

Everything is saved in the browser's `localStorage` under the key `letter-jumble:players`:
players, coins, progress, dealt questions, answers and badges. There is no server or account.
Clearing the site's data, or using another browser or device, starts afresh.

## Getting started

You need **Node.js 20.9 or newer** and npm.

```sh
npm install
npm run dev
```

Then open <http://localhost:3000>.

To try it on a phone or tablet on the same Wi-Fi, open the computer's IP address instead, e.g.
`http://192.168.1.20:3000`. The *Network* address `npm run dev` prints is the one to use. Private
network addresses and `.local` names are allowed in `allowedDevOrigins` in `next.config.js`.
Restart the dev server after changing that file.

For a production build:

```sh
npm run build
npm start
```

### Sound and voices

- Sound effects are made in the browser with the Web Audio API, so there are no audio files.
- Spoken words use the browser's built-in speech (Web Speech API).
- Chinese is read in Cantonese, which needs a Cantonese (`zh-HK`) voice on the device. On a Mac,
  add one in *System Settings → Accessibility → Spoken Content → System voice → Manage Voices*,
  e.g. "Sinji".

### The 3D dragon

Mochi is drawn with [three.js](https://threejs.org/) and needs WebGL. The code is in
`app/lib/dragon/scene.js`. It's only loaded when the dragon's page is opened. Without WebGL, the
page shows a friendly message instead.

## Tests

There are two kinds of tests.

**Unit and page tests** use Jest and Testing Library:

```sh
npm test
```

- If Jest sits silently and never starts, Watchman (the file watcher) is stuck. Run
  `npx jest --watchman=false` instead.
- To run one file: `npx jest app/page.test.jsx`.

**End-to-end tests** use Cypress and need the dev server running in another terminal:

```sh
npm run dev          # terminal 1
npm run test:e2e     # terminal 2
```

- If Cypress fails with *Cannot find module …/Cypress.app/…/index.js*, the terminal (often
  VS Code's) has set `ELECTRON_RUN_AS_NODE`. Run `unset ELECTRON_RUN_AS_NODE` first.
- If tests time out waiting for a page to load, the dev server was still compiling. Open
  <http://localhost:3000> once and run them again.
- `cypress/e2e/dragon-mobile.cy.js` checks that every button in Mochi's den can be tapped on
  phone-sized screens.

### Making tests predictable

The page tests pin `Math.random` (in `app/page.test.jsx`) so shuffles keep the original order.
Cypress does the same just after each page loads (in `cypress/e2e/game.cy.js`). Tests that open a
topic directly by its address seed the dealt questions in `localStorage`.

## Project layout

```
app/
  page.jsx, [game]/, [game]/[topic]/   Routes: "/" picker, "/<game>" topics, "/<game>/<topic>" play
  components/GameApp.jsx               The app: routing, dealing, answers, scores, pop-ups
  components/                          One component per screen or piece (DragonDen, IdiomGame…)
  games-data.js                        The games, their ages and front-page headings
  game-data.js, starters-data.js       Letter Jumble (Movers, Starters) words and pictures
  cvc-data.js                          CVC words and letter choices
  chinese-data.js                      中文認字 topics, words, phrases and picture options
  measure-words-data.js, idioms-data.js
  dragon-data.js                       Mochi's treats, grooming and activities (cost, duration)
  badges.js                            All topics by game, and each topic's badge
  lib/use-players.js                   Players and everything saved about them
  lib/spelling.js                      Shuffles, scrambles and spelling helpers
  lib/speech.js, lib/sounds.js         Voices and sound effects
  lib/dragon/scene.js                  The 3D dragon scene, Mochi, Tofu and their animations
public/images/                         Pictures (mostly hand-made SVGs)
scripts/                               Generators for badges, pictures, the dragons' rooms and the village
cypress/e2e/                           End-to-end tests
```

## Adding content

- **A word or topic:** add it to the game's data file. Each data file has a test that checks the
  words and that every picture file exists.
  - Pictures are either an emoji or a path under `public/images/`.
  - A new topic needs an `id`, `name`, `icon` and `color` (`peach`, `lilac`, `blue`, `green`,
    `yellow` or `pink`).
- **A Chinese word:** words that look alike share a `groups` value, so their pictures are never
  offered together as choices.
- **A new topic's badge:** run `sh scripts/make-badges.sh` after adding or renaming topics. It
  redraws every badge in `public/images/badges/`, and a test fails if one is missing.
- **A new game:**
  1. Add it to `games-data.js`, with its `group` and `ages`.
  2. Add its topics to `topicsByGame` in `badges.js`.
  3. Add a branch for how it plays in `GameApp.jsx`.
- **The dragons' rooms:** `python3 scripts/make-rooms.py .` redraws `public/images/dragon/`: Mochi's
  home, bathroom and beach, and Tofu's reading nook, bathroom and kitchen.
- **Rainbow Village:** `python3 scripts/make-village.py` redraws `public/images/village/`.
- **Hand-drawn pictures:** `python3 scripts/draw-pictures.py` redraws the 地點 places and other
  pictures it lists. Faces go only on people and animals.
- **A dragon's treats and activities:** add them to `dragon-data.js`. An action can reuse another's
  animation (`animation`) or get its own in `lib/dragon/scene.js`.
