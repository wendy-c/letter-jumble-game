// Chinese four-character idioms (成語) for 5-6 year olds: each question shows a picture or a
// short comic and the idiom's meaning; the learner picks the matching idiom.
// Idioms sharing a `group` mean nearly the same thing, so they're never offered together.
const idioms = [
  { idiom: "打草驚蛇", jyutping: "daa2 cou2 ging1 se4", picture: "startle-snake", meaning: "比喻做事不機密，使對方起了警覺。" },
  { idiom: "畫蛇添足", jyutping: "waak6 se4 tim1 zuk1", picture: "snake-legs", meaning: "比喻做多餘的事，非但無益，反而不恰當。" },
  { idiom: "守株待兔", jyutping: "sau2 zyu1 doi6 tou3", picture: "wait-rabbit", meaning: "比喻不知或不想努力，心存僥倖，妄想不勞而獲。", group: "lazy" },
  { idiom: "掩耳盜鈴", jyutping: "jim2 ji5 dou6 ling4", picture: "steal-bell", meaning: "比喻自己欺騙自己，盲目掩飾事實。" },
  { idiom: "狐假虎威", jyutping: "wu4 gaa2 fu2 wai1", picture: "fox-tiger", meaning: "比喻藉別人的威勢來欺壓人。" },
  { idiom: "一諾千金", jyutping: "jat1 nok6 cin1 gam1", picture: "keep-promise", meaning: "形容說話算數，極有信用。" },
  { idiom: "鐵杵磨針", jyutping: "tit3 cyu5 mo4 zam1", picture: "iron-needle", meaning: "比喻只要有恆心、有毅力，下苦功去做，再難的事情也能成功。", group: "perseverance" },
  { idiom: "大驚小怪", jyutping: "daai6 ging1 siu2 gwaai3", picture: "fuss", meaning: "對一點小事情或常見的事情過分驚慌或驚奇。" },
  { idiom: "千金一刻", jyutping: "cin1 gam1 jat1 hak1", picture: "golden-moment", meaning: "形容時間非常寶貴。", group: "time" },
  { idiom: "分秒必爭", jyutping: "fan1 miu5 bit1 zang1", picture: "every-second", meaning: "形容抓緊時間做事。", group: "time" },
  { idiom: "日上三竿", jyutping: "jat6 soeng5 saam1 gon1", picture: "late-riser", meaning: "形容人起牀很晚。" },
  { idiom: "將勤補拙", jyutping: "zoeng1 kan4 bou2 zyut3", picture: "practice", meaning: "指用勤奮努力來彌補天資的笨拙。", group: "perseverance" },
  { idiom: "五顏六色", jyutping: "ng5 ngaan4 luk6 sik1", picture: "colourful", meaning: "形容色彩繽紛、種類繁多。" },
  { idiom: "手舞足蹈", jyutping: "sau2 mou5 zuk1 dou6", picture: "dance-joy", meaning: "揮手舉足，舞動跳躍。" },
  { idiom: "手忙腳亂", jyutping: "sau2 mong4 goek3 lyun6", picture: "flustered", meaning: "形容做事慌亂，失去條理。" },
  { idiom: "愚公移山", jyutping: "jyu4 gung1 ji4 saan1", picture: "move-mountain", meaning: "比喻努力不懈，終能達成目標。", group: "perseverance" },
  { idiom: "苦盡甘來", jyutping: "fu2 zeon6 gam1 loi4", picture: "sweet-after-bitter", meaning: "比喻逐步進入佳境。" },
  { idiom: "一知半解", jyutping: "jat1 zi1 bun3 gaai2", picture: "half-understand", meaning: "形容了解不深。" },
  { idiom: "井底之蛙", jyutping: "zeng2 dai2 zi1 waa1", picture: "frog-well", meaning: "比喻見識狹窄的人。" },
  { idiom: "半途而廢", jyutping: "bun3 tou4 ji4 fai3", picture: "give-up-halfway", meaning: "比喻事情尚未做成功便停下來，做事有始無終。", group: "lazy" },
];

const optionCount = 4;

// The right idiom plus three others with different meanings, picked and ordered the same way
// every time (a fixed shuffle seeded by the question's position).
function idiomOptions(index) {
  const entry = idioms[index];
  const others = idioms
    .map((other, otherIndex) => ({ other, order: (index * 7 + otherIndex * 13 + otherIndex * otherIndex * 5) % 101 }))
    .filter(({ other }) => other !== entry && !(entry.group && other.group === entry.group))
    .sort((first, second) => first.order - second.order)
    .map(({ other }) => other);

  const wrong = [];
  for (const candidate of others) {
    if (wrong.length === optionCount - 1) break;
    if (!(candidate.group && wrong.some((chosen) => chosen.group === candidate.group))) wrong.push(candidate);
  }
  const options = wrong.map((option) => ({ idiom: option.idiom, correct: false }));
  options.splice((index * 3) % optionCount, 0, { idiom: entry.idiom, correct: true });
  return options;
}

export const idiomTopics = [
  {
    id: "idioms",
    name: "成語",
    english: "Idioms",
    icon: "/images/icons/idioms.svg",
    color: "peach",
    words: idioms.map((entry, index) => ({
      ...entry,
      character: entry.idiom,
      // `answers` lets the shared word menu and progress code treat idioms like words.
      answers: [entry.idiom],
      picture: `/images/idioms/${entry.picture}.svg`,
      category: "成語",
      color: "peach",
      options: idiomOptions(index),
    })),
  },
];
