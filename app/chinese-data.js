// Chinese character recognition topics, in Traditional Chinese with Cantonese (jyutping) readings.
// Words sharing a `group` mean the same thing (啡 and 棕 are both brown) or have look-alike
// pictures (麵 and 粉 are both noodles; 衫 and 衣 are both tops), so they're never offered
// as choices for each other.
// `phrases` are everyday words where children will see the character.
const topics = [
  {
    id: "colours",
    name: "顏色",
    english: "Colours",
    icon: "/images/icons/chinese-colours.svg",
    color: "pink",
    words: [
      { character: "紅", jyutping: "hung4", english: "red", picture: "red" },
      { character: "橙", jyutping: "caang2", english: "orange", picture: "orange" },
      { character: "黃", jyutping: "wong4", english: "yellow", picture: "yellow" },
      { character: "綠", jyutping: "luk6", english: "green", picture: "green" },
      { character: "青", jyutping: "ceng1", english: "cyan", picture: "cyan" },
      { character: "藍", jyutping: "laam4", english: "blue", picture: "blue" },
      { character: "紫", jyutping: "zi2", english: "purple", picture: "purple" },
      { character: "啡", jyutping: "fe1", english: "brown", picture: "brown", group: "brown" },
      { character: "棕", jyutping: "zung1", english: "brown", picture: "brown", group: "brown" },
      { character: "白", jyutping: "baak6", english: "white", picture: "white" },
      { character: "黑", jyutping: "hak1", english: "black", picture: "black" },
      { character: "灰", jyutping: "fui1", english: "grey", picture: "grey" },
      { character: "彩色", jyutping: "coi2 sik1", english: "colourful", picture: "rainbow" },
    ],
  },
  {
    id: "food",
    name: "食物",
    english: "Food",
    icon: "/images/icons/chinese-food.svg",
    color: "yellow",
    words: [
      { character: "餅", jyutping: "beng2", english: "biscuit", picture: "biscuit", phrases: ["餅乾", "月餅"] },
      { character: "飯", jyutping: "faan6", english: "rice", picture: "rice", phrases: ["白飯", "飯碗"] },
      { character: "糖", jyutping: "tong4", english: "sweet", picture: "sweet", phrases: ["糖果", "蜜糖"] },
      { character: "肉", jyutping: "juk6", english: "meat", picture: "meat", phrases: ["牛肉", "肌肉"] },
      { character: "菜", jyutping: "coi3", english: "vegetable", picture: "bok-choy", phrases: ["蔬菜", "菠菜"] },
      { character: "蛋", jyutping: "daan2", english: "egg", picture: "egg", phrases: ["雞蛋", "復活蛋"] },
      { character: "糕", jyutping: "gou1", english: "cake", picture: "cake", phrases: ["蛋糕", "年糕"] },
      { character: "麵", jyutping: "min6", english: "noodles", picture: "noodles", phrases: ["拉麵", "麵粉"], group: "noodles" },
      { character: "包", jyutping: "baau1", english: "bun", picture: "bun", phrases: ["麵包", "菜肉包"] },
      { character: "粉", jyutping: "fan2", english: "rice noodles", picture: "rice-noodles", phrases: ["米粉", "粉麵"], group: "noodles" },
      { character: "魚", jyutping: "jyu4", english: "fish", picture: "fish", phrases: ["魚蛋", "蒸魚"] },
      { character: "奶", jyutping: "naai5", english: "milk", picture: "milk", phrases: ["牛奶", "豆奶"] },
      { character: "豆", jyutping: "dau6", english: "peas", picture: "peas", phrases: ["豆腐", "青豆"] },
    ],
  },
  {
    id: "fruit",
    pictures: "/images/game-asset/food",
    name: "水果",
    english: "Fruit",
    icon: "/images/icons/chinese-fruit.svg",
    color: "green",
    words: [
      { character: "蘋", jyutping: "ping4", english: "apple", picture: "apple", phrases: ["蘋果"] },
      { character: "芒", jyutping: "mong1", english: "mango", picture: "mango", phrases: ["芒果"] },
      { character: "莓", jyutping: "mui2", english: "strawberry", picture: "strawberry", phrases: ["草莓", "藍莓"] },
      { character: "梨", jyutping: "lei4", english: "pear", picture: "pear", phrases: ["梨子"] },
      { character: "瓜", jyutping: "gwaa1", english: "watermelon", picture: "watermelon", phrases: ["西瓜", "木瓜"] },
      { character: "葡", jyutping: "pou4", english: "grapes", picture: "grapes", phrases: ["葡萄"] },
      { character: "橙", jyutping: "caang2", english: "orange", picture: "orange", phrases: ["鮮橙"] },
      { character: "蕉", jyutping: "ziu1", english: "banana", picture: "banana", phrases: ["香蕉"] },
      { character: "菠", jyutping: "bo1", english: "pineapple", picture: "pineapple", phrases: ["菠蘿"] },
      { character: "檸", jyutping: "ning4", english: "lemon", picture: "lemon", phrases: ["檸檬"] },
    ],
  },
  {
    id: "animals",
    pictures: "/images/game-asset/animals",
    name: "動物",
    english: "Animals",
    icon: "/images/icons/chinese-animals.svg",
    color: "peach",
    words: [
      { character: "虎", jyutping: "fu2", english: "tiger", picture: "tiger", phrases: ["老虎"] },
      { character: "狗", jyutping: "gau2", english: "dog", picture: "dog", phrases: ["小狗"] },
      { character: "雞", jyutping: "gai1", english: "chicken", picture: "chicken", phrases: ["母雞", "公雞"] },
      { character: "貓", jyutping: "maau1", english: "cat", picture: "cat", phrases: ["花貓", "狸貓"] },
      { character: "馬", jyutping: "maa5", english: "horse", picture: "horse", phrases: ["白馬", "河馬"] },
      { character: "豬", jyutping: "zyu1", english: "pig", picture: "pig", phrases: ["野豬"] },
      { character: "熊", jyutping: "hung4", english: "bear", picture: "bear", phrases: ["黑熊", "北極熊"] },
      { character: "牛", jyutping: "ngau4", english: "cow", picture: "cow", phrases: ["水牛"] },
      { character: "羊", jyutping: "joeng4", english: "sheep", picture: "sheep", phrases: ["山羊", "綿羊"] },
      { character: "獅", jyutping: "si1", english: "lion", picture: "lion", phrases: ["獅子"] },
      { character: "鼠", jyutping: "syu2", english: "mouse", picture: "mouse", phrases: ["老鼠"] },
      { character: "鵝", jyutping: "ngo4", english: "swan", picture: "swan", phrases: ["天鵝"] },
      { character: "兔", jyutping: "tou3", english: "rabbit", picture: "rabbit", phrases: ["白兔"] },
      { character: "象", jyutping: "zoeng6", english: "elephant", picture: "elephant", phrases: ["大象"] },
    ],
  },
  {
    id: "clothes",
    name: "衣物",
    english: "Clothes",
    icon: "/images/icons/chinese-clothes.svg",
    color: "blue",
    words: [
      { character: "帽", jyutping: "mou2", english: "hat", picture: "hat", phrases: ["帽子"] },
      { character: "裙", jyutping: "kwan4", english: "skirt", picture: "skirt", phrases: ["裙子"] },
      { character: "褲", jyutping: "fu3", english: "trousers", picture: "trousers", phrases: ["褲子"] },
      { character: "衫", jyutping: "saam1", english: "shirt", picture: "shirt", phrases: ["恤衫"], group: "tops" },
      { character: "襪", jyutping: "mat6", english: "socks", picture: "socks", phrases: ["襪子"] },
      { character: "鞋", jyutping: "haai4", english: "shoes", picture: "shoes", phrases: ["鞋子"] },
      { character: "衣", jyutping: "ji1", english: "top", picture: "top", phrases: ["上衣"], group: "tops" },
    ],
  },
];

// The 5-6 year old game recognises whole words. Some pictures are close cousins (a police
// officer and keeping the peace, a postman and sending a letter), so `groups` keeps them apart.
const advancedTopics = [
  {
    id: "jobs",
    name: "職業",
    english: "Jobs",
    icon: "/images/icons/chinese-jobs.svg",
    color: "blue",
    words: [
      { character: "警察", jyutping: "ging2 caat3", english: "police officer", picture: "police", groups: ["police"] },
      { character: "消防員", jyutping: "siu1 fong4 jyun4", english: "firefighter", picture: "firefighter", groups: ["fire"] },
      { character: "醫生", jyutping: "ji1 sang1", english: "doctor", picture: "doctor", groups: ["doctor"] },
      { character: "護士", jyutping: "wu6 si6", english: "nurse", picture: "nurse" },
      { character: "理髮師", jyutping: "lei5 faat3 si1", english: "barber", picture: "barber" },
      { character: "侍應生", jyutping: "si6 jing3 saang1", english: "waiter", picture: "waiter" },
      { character: "廚師", jyutping: "cyu4 si1", english: "chef", picture: "chef", groups: ["chef"] },
      { character: "郵差", jyutping: "jau4 caai1", english: "postman", picture: "postman", groups: ["mail"] },
      { character: "交通警察", jyutping: "gaau1 tung1 ging2 caat3", english: "traffic police officer", picture: "traffic-police", groups: ["police"] },
      { character: "救護員", jyutping: "gau3 wu6 jyun4", english: "paramedic", picture: "paramedic" },
      { character: "飛行服務員", jyutping: "fei1 hang4 fuk6 mou6 jyun4", english: "flight attendant", picture: "flight-attendant", groups: ["flight"] },
      { character: "獸醫", jyutping: "sau3 ji1", english: "vet", picture: "vet" },
      { character: "牙醫", jyutping: "ngaa4 ji1", english: "dentist", picture: "dentist" },
      { character: "送遞員", jyutping: "sung3 dai6 jyun4", english: "courier", picture: "courier", groups: ["mail"] },
      { character: "保安員", jyutping: "bou2 on1 jyun4", english: "security guard", picture: "security-guard", groups: ["police"] },
      { character: "飛機師", jyutping: "fei1 gei1 si1", english: "pilot", picture: "pilot", groups: ["flight"] },
      { character: "老師", jyutping: "lou5 si1", english: "teacher", picture: "teacher", groups: ["teaching"] },
      { character: "醫治病人", jyutping: "ji1 zi6 beng6 jan4", english: "treating a patient", picture: "treating-patient", groups: ["doctor", "sick"] },
      { character: "時裝設計師", jyutping: "si4 zong1 cit3 gai3 si1", english: "fashion designer", picture: "fashion-designer", groups: ["fashion"] },
      { character: "售貨員", jyutping: "sau6 fo3 jyun4", english: "shop assistant", picture: "shop-assistant", groups: ["shop"] },
      { character: "烘焙師", jyutping: "hung3 bui6 si1", english: "baker", picture: "baker", groups: ["chef"] },
      { character: "新聞主播", jyutping: "san1 man4 zyu2 bo3", english: "news anchor", picture: "news-anchor", groups: ["news"] },
      { character: "電器技工", jyutping: "din6 hei3 gei6 gung1", english: "electrician", picture: "electrician" },
      { character: "建築工人", jyutping: "gin3 zuk1 gung1 jan4", english: "construction worker", picture: "construction-worker" },
      { character: "機場特警", jyutping: "gei1 coeng4 dak6 ging2", english: "airport special police", picture: "airport-police", groups: ["police"] },
      { character: "時裝模特兒", jyutping: "si4 zong1 mou4 dak6 ji4", english: "fashion model", picture: "fashion-model", groups: ["fashion"] },
      { character: "製衣工人", jyutping: "zai3 ji1 gung1 jan4", english: "garment worker", picture: "garment-worker", groups: ["fashion"] },
      { character: "收銀員", jyutping: "sau1 ngan4 jyun4", english: "cashier", picture: "cashier", groups: ["shop"] },
      { character: "運動員", jyutping: "wan6 dung6 jyun4", english: "athlete", picture: "athlete" },
      { character: "記者", jyutping: "gei3 ze2", english: "reporter", picture: "reporter", groups: ["news"] },
      { character: "視光師", jyutping: "si6 gwong1 si1", english: "optometrist", picture: "optometrist", groups: ["doctor"] },
      { character: "科學家", jyutping: "fo1 hok6 gaa1", english: "scientist", picture: "scientist" },
      { character: "太空人", jyutping: "taai3 hung1 jan4", english: "astronaut", picture: "astronaut" },
      { character: "探險家", jyutping: "taam3 him2 gaa1", english: "explorer", picture: "explorer" },
    ],
  },
  {
    id: "home",
    name: "家",
    english: "Home",
    icon: "/images/icons/chinese-home.svg",
    color: "peach",
    // A room's picture shows things that are also words (a living room has a sofa and TV),
    // so rooms and their furniture share a look-alike group.
    words: [
      { character: "客廳", jyutping: "haak3 teng1", english: "living room", picture: "living-room", groups: ["living"] },
      { character: "廚房", jyutping: "cyu4 fong4", english: "kitchen", picture: "kitchen", groups: ["kitchen"] },
      { character: "浴室", jyutping: "juk6 sat1", english: "bathroom", picture: "bathroom" },
      { character: "睡房", jyutping: "seoi6 fong2", english: "bedroom", picture: "bedroom", groups: ["bed"] },
      { character: "書房", jyutping: "syu1 fong2", english: "study", picture: "study", groups: ["study"] },
      { character: "窗戶", jyutping: "coeng1 wu6", english: "window", picture: "window", groups: ["window"] },
      { character: "床褥", jyutping: "cong4 juk6", english: "mattress", picture: "mattress", groups: ["bed"] },
      { character: "椅子", jyutping: "ji2 zi2", english: "chair", picture: "chair", groups: ["study"] },
      { character: "桌子", jyutping: "coek3 zi2", english: "table", picture: "table", groups: ["study"] },
      { character: "衣櫃", jyutping: "ji1 gwai6", english: "wardrobe", picture: "wardrobe" },
      { character: "杯子", jyutping: "bui1 zi2", english: "cup", picture: "cup" },
      { character: "碗碟", jyutping: "wun2 dip6", english: "bowls and plates", picture: "dishes", groups: ["kitchen"] },
      { character: "電燈", jyutping: "din6 dang1", english: "light", picture: "light" },
      { character: "時鐘", jyutping: "si4 zung1", english: "clock", picture: "clock" },
      { character: "沙發", jyutping: "saa1 faat3", english: "sofa", picture: "sofa", groups: ["living"] },
      { character: "電視", jyutping: "din6 si6", english: "television", picture: "television", groups: ["living"] },
      { character: "電腦", jyutping: "din6 nou5", english: "computer", picture: "computer", groups: ["study"] },
      { character: "空氣淨化機", jyutping: "hung1 hei3 zing6 faa3 gei1", english: "air purifier", picture: "air-purifier" },
      { character: "露台", jyutping: "lou6 toi4", english: "balcony", picture: "balcony", groups: ["window"] },
      { character: "游泳池", jyutping: "jau4 wing6 ci4", english: "swimming pool", picture: "pool" },
    ],
  },
  {
    id: "animals-advanced",
    pictures: "/images/game-asset/animals",
    name: "動物",
    english: "Animals",
    icon: "/images/icons/chinese-animals-advanced.svg",
    color: "green",
    // Look-alikes kept apart: the spotted cats, the bears, the apes, the horse shapes, the sea
    // animals, the birds, and the winged creatures (bat, butterfly, moth).
    words: [
      { character: "鸚鵡", jyutping: "jing1 mou5", english: "parrot", picture: "parrot", groups: ["bird"] },
      { character: "海豚", jyutping: "hoi2 tyun4", english: "dolphin", picture: "dolphin", groups: ["sea"] },
      { character: "駱駝", jyutping: "lok3 to4", english: "camel", picture: "camel" },
      { character: "老虎", jyutping: "lou5 fu2", english: "tiger", picture: "tiger" },
      { character: "獅子", jyutping: "si1 zi2", english: "lion", picture: "lion" },
      { character: "熊貓", jyutping: "hung4 maau1", english: "panda", picture: "panda", groups: ["bear"] },
      { character: "鼴鼠", jyutping: "jin2 syu2", english: "mole", picture: "mole" },
      { character: "鯨魚", jyutping: "king4 jyu4", english: "whale", picture: "whale", groups: ["sea"] },
      { character: "北極熊", jyutping: "bak1 gik6 hung4", english: "polar bear", picture: "polar-bear", groups: ["bear"] },
      { character: "花豹", jyutping: "faa1 paau3", english: "leopard", picture: "leopard", groups: ["spotted"] },
      { character: "獵豹", jyutping: "lip6 paau3", english: "cheetah", picture: "cheetah", groups: ["spotted"] },
      { character: "猴子", jyutping: "hau4 zi2", english: "monkey", picture: "monkey", groups: ["ape"] },
      { character: "斑馬", jyutping: "baan1 maa5", english: "zebra", picture: "zebra", groups: ["horse"] },
      { character: "狐狸", jyutping: "wu4 lei4", english: "fox", picture: "fox" },
      { character: "鴕鳥", jyutping: "to4 niu5", english: "ostrich", picture: "ostrich", groups: ["bird"] },
      { character: "袋鼠", jyutping: "doi6 syu2", english: "kangaroo", picture: "kangaroo" },
      { character: "驢子", jyutping: "lou4 zi2", english: "donkey", picture: "donkey", groups: ["horse"] },
      { character: "大猩猩", jyutping: "daai6 sing1 sing1", english: "gorilla", picture: "gorilla", groups: ["ape"] },
      { character: "蝙蝠", jyutping: "pin1 fuk1", english: "bat", picture: "bat", groups: ["wings"] },
      { character: "蜘蛛", jyutping: "zi1 zyu1", english: "spider", picture: "spider" },
      { character: "蝴蝶", jyutping: "wu4 dip6", english: "butterfly", picture: "butterfly", groups: ["wings"] },
      { character: "蜜蜂", jyutping: "mat6 fung1", english: "bee", picture: "bee" },
      { character: "蜻蜓", jyutping: "cing1 ting4", english: "dragonfly", picture: "dragonfly" },
      { character: "飛蛾", jyutping: "fei1 ngo4", english: "moth", picture: "moth", groups: ["wings"] },
    ],
  },
  {
    id: "places",
    name: "地點",
    english: "Places",
    icon: "/images/icons/chinese-places.svg",
    color: "pink",
    // Look-alikes kept apart: the two cinemas (戲院 and 電影院) and the school hall's stage, and the
    // places with rides and slides.
    words: [
      { character: "學校", jyutping: "hok6 haau6", english: "school", picture: "school" },
      { character: "音樂室", jyutping: "jam1 ngok6 sat1", english: "music room", picture: "music-room" },
      { character: "操場", jyutping: "cou1 coeng4", english: "school field", picture: "school-field" },
      { character: "課室", jyutping: "fo3 sat1", english: "classroom", picture: "classroom" },
      { character: "禮堂", jyutping: "lai5 tong4", english: "school hall", picture: "school-hall", groups: ["stage"] },
      { character: "超級市場", jyutping: "ciu1 kap1 si5 coeng4", english: "supermarket", picture: "supermarket" },
      { character: "遊樂場", jyutping: "jau4 lok6 coeng4", english: "playground", picture: "playground", groups: ["rides"] },
      { character: "圖書館", jyutping: "tou4 syu1 gun2", english: "library", picture: "library" },
      { character: "沙灘", jyutping: "saa1 taan1", english: "beach", picture: "beach" },
      { character: "郊野公園", jyutping: "gaau1 je5 gung1 jyun4", english: "country park", picture: "country-park" },
      { character: "商場", jyutping: "soeng1 coeng4", english: "shopping mall", picture: "shopping-mall" },
      { character: "戲院", jyutping: "hei3 jyun2", english: "theatre", picture: "theatre", groups: ["stage"] },
      { character: "電影院", jyutping: "din6 jing2 jyun2", english: "cinema", picture: "cinema", groups: ["stage"] },
      { character: "餐廳", jyutping: "caan1 teng1", english: "restaurant", picture: "restaurant" },
      { character: "主題公園", jyutping: "zyu2 tai4 gung1 jyun4", english: "theme park", picture: "theme-park", groups: ["rides"] },
      { character: "醫院", jyutping: "ji1 jyun2", english: "hospital", picture: "hospital" },
      { character: "警署", jyutping: "ging2 cyu5", english: "police station", picture: "police-station" },
      { character: "郵政局", jyutping: "jau4 zing3 guk6", english: "post office", picture: "post-office" },
      { character: "消防局", jyutping: "siu1 fong4 guk6", english: "fire station", picture: "fire-station" },
      { character: "銀行", jyutping: "ngan4 hong4", english: "bank", picture: "bank" },
      { character: "街市", jyutping: "gaai1 si5", english: "wet market", picture: "wet-market" },
    ],
  },
];

const optionCount = 4;

// A word's look-alike groups, from `group` (one) or `groups` (several).
function groupsOf(word) {
  return word.groups ?? (word.group ? [word.group] : []);
}

// The right picture plus three others, picked and ordered the same way every time.
// The other words are put in a fixed shuffled order (seeded by the word's position), and the
// first three that don't look alike (or share a picture) are used.
function pictureOptions(words, wordIndex) {
  const word = words[wordIndex];
  const sameMeaning = (other) => other === word || groupsOf(word).some((group) => groupsOf(other).includes(group));
  const shuffled = words
    .map((other, otherIndex) => ({ other, order: (wordIndex * 7 + otherIndex * 13 + otherIndex * otherIndex * 5) % 101 }))
    .filter(({ other }) => !sameMeaning(other))
    .sort((first, second) => first.order - second.order)
    .map(({ other }) => other);

  const distractors = [];
  for (const candidate of shuffled) {
    if (distractors.length === optionCount - 1) break;
    const lookAlike = (chosen) => chosen.picture === candidate.picture ||
      groupsOf(chosen).some((group) => groupsOf(candidate).includes(group));
    if (!distractors.some(lookAlike)) distractors.push(candidate);
  }
  const options = [...distractors];
  options.splice((wordIndex * 3) % optionCount, 0, word);
  return options.map((option) => ({ character: option.character, picture: option.picture, english: option.english }));
}

// A topic's pictures are in /images/game-asset/<topic id>, or in `pictures` when it shares a folder
// (both animal topics use game-asset/animals, and fruit is in game-asset/food).
const pictureFolder = (topic) => topic.pictures ?? `/images/game-asset/${topic.id}`;

function buildTopics(list) {
  return list.map((topic) => ({
    ...topic,
    words: topic.words.map((word, wordIndex, words) => ({
      ...word,
      // `answers` lets the shared word menu and progress code treat characters like spelling words.
      answers: [word.character],
      picture: `${pictureFolder(topic)}/${word.picture}.svg`,
      category: topic.name,
      color: topic.color,
      options: pictureOptions(words, wordIndex).map((option) => ({
        ...option,
        picture: `${pictureFolder(topic)}/${option.picture}.svg`,
      })),
    })),
  }));
}

export const chineseTopics = buildTopics(topics);
export const chineseAdvancedTopics = buildTopics(advancedTopics);
