import fs from "node:fs";
import path from "node:path";
import { starterCategories } from "./starters-data";

const publicDir = path.join(__dirname, "..", "public");

describe("Letter Jumble - Starters", () => {
  it("has the Pets and Farm and Wild Animals words", () => {
    const words = (id) => starterCategories.find((topic) => topic.id === id).words.map((word) => word.word);
    expect(words("pets-and-farm")).toEqual([
      "cat", "dog", "bird", "duck", "chicken", "cow", "sheep", "goat", "horse", "pig", "donkey", "frog", "fish", "lizard", "mouse", "mice", "pet",
    ]);
    expect(words("wild-animals")).toEqual([
      "bear", "elephant", "giraffe", "hippo", "bat", "kangaroo", "monkey", "panda", "parrot", "penguin", "polar bear", "snake", "spider",
      "tiger", "zebra", "crocodile", "dolphin", "jellyfish", "shark", "whale",
    ]);
  });

  it("has the six topics added after them, with two spellings where either is right", () => {
    expect(starterCategories.map((topic) => topic.name)).toEqual([
      "Pets and Farm", "Wild Animals", "Fruit and Vegetables", "Food and Drinks", "Body and Face", "Clothing and Accessories", "People", "Home",
    ]);
    const answers = (id) => starterCategories.find((topic) => topic.id === id).words.map((word) => word.answers.join("/"));
    expect(answers("fruit-and-vegetables")).toEqual([
      "apple", "banana", "coconut", "grape", "kiwi", "lemon", "lime", "mango", "orange", "pineapple", "watermelon",
      "bean", "carrot", "onion", "pea", "potato", "tomato",
    ]);
    expect(answers("food-and-drinks")).toEqual([
      "bread", "burger", "cake", "candy/sweet", "chicken", "chocolate", "egg", "fish", "fries/chips", "ice cream", "meat", "pasta", "pie",
      "rice", "sausage", "soup", "drink", "fruit juice", "milk", "milkshake", "lemonade", "water",
    ]);
    expect(answers("body-and-face")).toEqual([
      "ear", "eye", "face", "hair", "mouth", "nose", "tooth", "teeth", "arm", "body", "foot/feet", "hand", "head", "leg", "tail",
    ]);
    expect(answers("clothing-and-accessories")).toEqual([
      "clothes", "dress", "jacket", "jeans", "pants/trousers", "shirt", "skirt", "t-shirt", "sweater", "coat", "shorts", "socks", "shoes",
      "bag", "glasses", "hat", "handbag", "watch",
    ]);
    expect(answers("people")).toEqual([
      "family", "mother", "mom", "father", "dad", "parents", "grandma", "grandpa", "brother", "sister", "baby", "cousin", "boy", "girl",
      "child", "children", "friend", "man", "men", "woman", "women", "person", "people", "teacher",
    ]);
    expect(answers("home")).toEqual([
      "house", "home", "room", "bathroom", "bedroom", "dining room", "kitchen", "living room", "hall", "garden", "balcony", "bed",
      "bookcase", "chair", "armchair", "desk", "door", "window", "floor", "wall", "picture", "clock", "lamp", "mirror", "mat", "rug",
      "sofa", "table", "television", "phone", "radio",
    ]);
  });

  it("has a picture for every word, and every picture file exists", () => {
    const files = starterCategories.flatMap((topic) => [topic.icon, ...topic.words.map((word) => word.picture)]).filter((picture) => picture.startsWith("/"));
    starterCategories.flatMap((topic) => topic.words).forEach((word) => expect(word.picture).toBeTruthy());
    expect(files.filter((file) => !fs.existsSync(path.join(publicDir, file)))).toEqual([]);
  });
});
