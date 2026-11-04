// Chinese four-character idioms (成語) for 5-6 year olds, in two modules of twenty. Each question
// shows a picture, the idiom with one character missing, its meaning and an example sentence using
// it; the learner picks the missing character. `blank` is the missing character's position (a word
// the picture helps with), and `wrong` holds three characters of the same kind that don't make an
// idiom. Each `example` has the idiom in it.

// 第一篇.
const firstIdioms = [
  { idiom: "打草驚蛇", jyutping: "daa2 cou2 ging1 se4", picture: "startle-snake", meaning: "比喻做事不機密，使對方起了警覺。", example: "我們去捉蝴蝶，大家要靜靜的，不要打草驚蛇。", blank: 3, wrong: "龍貓魚" },
  { idiom: "畫蛇添足", jyutping: "waak6 se4 tim1 zuk1", picture: "snake-legs", meaning: "比喻做多餘的事，非但無益，反而不恰當。", example: "小貓已經畫得很好看了，再加上翅膀就是畫蛇添足。", blank: 3, wrong: "手頭眼" },
  { idiom: "守株待兔", jyutping: "sau2 zyu1 doi6 tou3", picture: "wait-rabbit", meaning: "比喻不知或不想努力，心存僥倖，妄想不勞而獲。", example: "不練習就想贏比賽，就像守株待兔一樣。", blank: 3, wrong: "狗鳥馬" },
  { idiom: "掩耳盜鈴", jyutping: "jim2 ji5 dou6 ling4", picture: "steal-bell", meaning: "比喻自己欺騙自己，盲目掩飾事實。", example: "弟弟用手遮住眼睛，以為媽媽看不見他偷吃糖果，真是掩耳盜鈴。", blank: 1, wrong: "口目鼻" },
  { idiom: "狐假虎威", jyutping: "wu4 gaa2 fu2 wai1", picture: "fox-tiger", meaning: "比喻藉別人的威勢來欺壓人。", example: "小明跟在哥哥後面大聲叫，真是狐假虎威。", blank: 2, wrong: "牛羊兔" },
  { idiom: "一諾千金", jyutping: "jat1 nok6 cin1 gam1", picture: "keep-promise", meaning: "形容說話算數，極有信用。", example: "媽媽說會陪我砌積木，她一諾千金，真的陪我砌了。", blank: 2, wrong: "三五十" },
  { idiom: "鐵杵磨針", jyutping: "tit3 cyu5 mo4 zam1", picture: "iron-needle", meaning: "比喻只要有恆心、有毅力，下苦功去做，再難的事情也能成功。", example: "每天練習寫字，就像鐵杵磨針，字會越寫越漂亮。", blank: 3, wrong: "刀筆石" },
  { idiom: "大驚小怪", jyutping: "daai6 ging1 siu2 gwaai3", picture: "fuss", meaning: "對一點小事情或常見的事情過分驚慌或驚奇。", example: "只是一隻小螞蟻，不用大驚小怪。", blank: 2, wrong: "多中高" },
  { idiom: "千金一刻", jyutping: "cin1 gam1 jat1 hak1", picture: "golden-moment", meaning: "形容時間非常寶貴。", example: "睡覺前和爸爸講故事的時間千金一刻，我最喜歡了。", blank: 1, wrong: "銀年山" },
  { idiom: "分秒必爭", jyutping: "fan1 miu5 bit1 zang1", picture: "every-second", meaning: "形容抓緊時間做事。", example: "校車快到了，我要分秒必爭地穿好鞋子。", blank: 1, wrong: "天年月" },
  { idiom: "日上三竿", jyutping: "jat6 soeng5 saam1 gon1", picture: "late-riser", meaning: "形容人起牀很晚。", example: "哥哥睡到日上三竿才起床。", blank: 0, wrong: "月星雲" },
  { idiom: "將勤補拙", jyutping: "zoeng1 kan4 bou2 zyut3", picture: "practice", meaning: "指用勤奮努力來彌補天資的笨拙。", example: "我跑得不快，所以將勤補拙，每天都多跑一會兒。", blank: 1, wrong: "懶快慢" },
  { idiom: "五顏六色", jyutping: "ng5 ngaan4 luk6 sik1", picture: "colourful", meaning: "形容色彩繽紛、種類繁多。", example: "公園裏的花五顏六色，真漂亮！", blank: 2, wrong: "七八三" },
  { idiom: "手舞足蹈", jyutping: "sau2 mou5 zuk1 dou6", picture: "dance-joy", meaning: "揮手舉足，舞動跳躍。", example: "收到生日禮物，妹妹高興得手舞足蹈。", blank: 1, wrong: "拍寫洗" },
  { idiom: "手忙腳亂", jyutping: "sau2 mong4 goek3 lyun6", picture: "flustered", meaning: "形容做事慌亂，失去條理。", example: "今天起床晚了，我手忙腳亂地穿校服。", blank: 2, wrong: "頭口眼" },
  { idiom: "愚公移山", jyutping: "jyu4 gung1 ji4 saan1", picture: "move-mountain", meaning: "比喻努力不懈，終能達成目標。", example: "這幅拼圖很大，但只要有愚公移山的精神，就一定能砌好。", blank: 3, wrong: "水石樹" },
  { idiom: "苦盡甘來", jyutping: "fu2 zeon6 gam1 loi4", picture: "sweet-after-bitter", meaning: "比喻逐步進入佳境。", example: "我學踏單車跌倒了很多次，現在終於學會了，真是苦盡甘來！", blank: 2, wrong: "酸辣鹹" },
  { idiom: "一知半解", jyutping: "jat1 zi1 bun3 gaai2", picture: "half-understand", meaning: "形容了解不深。", example: "我對這個故事一知半解，要請老師再講一次。", blank: 2, wrong: "全三十" },
  { idiom: "井底之蛙", jyutping: "zeng2 dai2 zi1 waa1", picture: "frog-well", meaning: "比喻見識狹窄的人。", example: "多看圖書，才不會做井底之蛙。", blank: 3, wrong: "魚貓鳥" },
  { idiom: "半途而廢", jyutping: "bun3 tou4 ji4 fai3", picture: "give-up-halfway", meaning: "比喻事情尚未做成功便停下來，做事有始無終。", example: "拼圖還沒有砌完，不要半途而廢。", blank: 1, wrong: "天年夜" },
];

// 第二篇.
const secondIdioms = [
  { idiom: "精力充沛", jyutping: "zing1 lik6 cung1 pui3", picture: "full-of-energy", meaning: "很有力氣，一點也不累。", example: "弟弟精力充沛，跑了一整天也不累。", blank: 1, wrong: "心水火" },
  { idiom: "人山人海", jyutping: "jan4 saan1 jan4 hoi2", picture: "crowd", meaning: "人非常非常多。", example: "新年的花市人山人海，我要拖着媽媽的手。", blank: 3, wrong: "河湖江" },
  { idiom: "一石二鳥", jyutping: "jat1 sek6 ji6 niu5", picture: "one-stone-two-birds", meaning: "做一件事，得到兩個好處。", example: "走路上學可以做運動，又可以看風景，真是一石二鳥。", blank: 3, wrong: "魚貓狗" },
  { idiom: "對牛彈琴", jyutping: "deoi3 ngau4 taan4 kam4", picture: "cow-music", meaning: "跟聽不懂的人說話，白費力氣。", example: "跟小狗講數學，就像對牛彈琴。", blank: 1, wrong: "羊馬豬" },
  { idiom: "光陰似箭", jyutping: "gwong1 jam1 ci5 zin3", picture: "time-flies", meaning: "時間過得像箭一樣快。", example: "光陰似箭，我快要升小一了。", blank: 3, wrong: "刀弓槍" },
  { idiom: "目不轉睛", jyutping: "muk6 bat1 zyun2 zing1", picture: "staring", meaning: "眼睛一動也不動地看着。", example: "妹妹目不轉睛地看着魚缸裏的金魚。", blank: 0, wrong: "耳口手" },
  { idiom: "怒髮衝冠", jyutping: "nou6 faat3 cung1 gun1", picture: "very-angry", meaning: "非常非常生氣。", example: "哥哥的模型被弄壞了，他氣得怒髮衝冠。", blank: 0, wrong: "喜哀樂" },
  { idiom: "沒精打彩", jyutping: "mut6 zing1 daa2 coi2", picture: "no-energy", meaning: "沒有精神，提不起勁。", example: "小明昨晚太晚睡，今天上課沒精打彩。", blank: 1, wrong: "糖水米" },
  { idiom: "迫不及待", jyutping: "bik1 bat1 kap6 doi6", picture: "cant-wait", meaning: "心急得不能再等。", example: "放學鐘聲一響，我迫不及待地跑去找媽媽。", blank: 3, wrong: "坐站行" },
  { idiom: "斤斤計較", jyutping: "gan1 gan1 gai3 gaau3", picture: "fair-share", meaning: "很小的事情也要爭，不肯吃虧。", example: "分餅乾時，弟弟斤斤計較，一定要和我一樣多。", blank: 0, wrong: "兩尺寸" },
  { idiom: "五彩繽紛", jyutping: "ng5 coi2 ban1 fan1", picture: "fireworks", meaning: "顏色很多，很好看。", example: "天上的煙花五彩繽紛，真漂亮！", blank: 0, wrong: "一二三" },
  { idiom: "目中無人", jyutping: "muk6 zung1 mou4 jan4", picture: "show-off", meaning: "覺得自己最厲害，看不起別人。", example: "他贏了比賽就目中無人，大家都不想和他玩。", blank: 0, wrong: "耳口鼻" },
  { idiom: "見義勇為", jyutping: "gin3 ji6 jung5 wai4", picture: "brave-helper", meaning: "看見別人有危險或被欺負，勇敢地去幫忙。", example: "有同學被欺負，小美見義勇為，馬上告訴老師。", blank: 0, wrong: "聽說吃" },
  { idiom: "不拘小節", jyutping: "bat1 keoi1 siu2 zit3", picture: "easy-going", meaning: "不太在意小事情。", example: "叔叔不拘小節，坐在草地上和我們一起吃午餐。", blank: 2, wrong: "大中高" },
  { idiom: "平易近人", jyutping: "ping4 ji6 gan6 jan4", picture: "friendly", meaning: "態度親切，大家都喜歡接近他。", example: "校長平易近人，每天都笑着和我們打招呼。", blank: 2, wrong: "遠走看" },
  { idiom: "一派胡言", jyutping: "jat1 paai3 wu4 jin4", picture: "nonsense", meaning: "說的全是亂說的話。", example: "他說小貓會飛，真是一派胡言！", blank: 3, wrong: "字書筆" },
  { idiom: "自言自語", jyutping: "zi6 jin4 zi6 jyu5", picture: "talk-to-self", meaning: "自己跟自己說話。", example: "妹妹一邊玩公仔，一邊自言自語。", blank: 3, wrong: "笑哭唱" },
  { idiom: "提心吊膽", jyutping: "tai4 sam1 diu3 daam2", picture: "scared", meaning: "非常擔心和害怕。", example: "打雷的晚上，我提心吊膽地躲在被子裏。", blank: 1, wrong: "手腳頭" },
  { idiom: "忐忑不安", jyutping: "taan2 tik1 bat1 on1", picture: "nervous", meaning: "心裏很緊張，靜不下來。", example: "表演快開始了，我心裏忐忑不安。", blank: 3, wrong: "好樂美" },
  { idiom: "洗耳恭聽", jyutping: "sai2 ji5 gung1 ting3", picture: "listening", meaning: "很專心、很有禮貌地聽別人說話。", example: "老師講故事時，我們都洗耳恭聽。", blank: 1, wrong: "手腳面" },
];

// The missing character and the three wrong ones, with the right answer moved around.
function idiomOptions(entry, index) {
  const options = [...entry.wrong].map((character) => ({ character, correct: false }));
  options.splice((index * 3) % (options.length + 1), 0, { character: entry.idiom[entry.blank], correct: true });
  return options;
}

// A module of idioms, as a topic.
const idiomTopic = ({ id, name, english, icon, color, idioms }) => ({
  id,
  name,
  english,
  icon,
  color,
  words: idioms.map((entry, index) => ({
    ...entry,
    character: entry.idiom[entry.blank],
    // `answers` lets the shared word menu and progress code treat idioms like words.
    answers: [entry.idiom],
    picture: `/images/idioms/${entry.picture}.svg`,
    category: "成語",
    color,
    options: idiomOptions(entry, index),
  })),
});

// The first module keeps the id "idioms", so what's been saved about it still counts.
export const idiomTopics = [
  idiomTopic({ id: "idioms", name: "第一篇", english: "Idioms 1", icon: "/images/icons/idioms-1.svg", color: "peach", idioms: firstIdioms }),
  idiomTopic({ id: "idioms-2", name: "第二篇", english: "Idioms 2", icon: "/images/icons/idioms-2.svg", color: "lilac", idioms: secondIdioms }),
];
