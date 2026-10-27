import { fn } from "storybook/test";
import { dragons } from "../dragon-data";
import DragonScene from "./DragonScene";

const rooms = (dragon) => ["treat", "groom", "activity"].map((kind) => dragon.rooms[kind]);

// Just the 3D scene, in a box the size of the den's stage.
export default {
  title: "Components/Dragons/DragonScene",
  component: DragonScene,
  args: { onPet: fn(), command: null },
  decorators: [(Story) => <div className="dragon-stage-wrap" style={{ position: "relative", height: 460, maxWidth: 640, borderRadius: 24, overflow: "hidden" }}><Story /></div>],
};

export const Mochi = { args: { dragon: "mochi", name: "Mochi", rooms: rooms(dragons.mochi), room: dragons.mochi.rooms.treat } };
export const Tofu = { args: { dragon: "tofu", name: "Tofu", rooms: rooms(dragons.tofu), room: dragons.tofu.rooms.activity } };
