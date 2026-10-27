import { fn } from "storybook/test";
import { topicsByGame } from "../badges";
import Breadcrumbs from "./Breadcrumbs";
import { AboutButton, HowToPlayButton } from "./HowToPlayDialog";
import TopicMenu from "./TopicMenu";

const crumbs = (label, href) => <Breadcrumbs items={[{ label: "Home", href: "/" }, { label, href }]} />;

export default {
  title: "Components/Menus/TopicMenu",
  component: TopicMenu,
  args: { onSelectTopic: fn(), progressFor: () => 0 },
};

export const CvcSounds = {
  args: { isCvc: true, topics: topicsByGame.cvc, breadcrumbs: crumbs("CVC Sounds", "/cvc"), titleAction: <AboutButton onClick={fn()} /> },
};
export const ConsonantDigraphs = { args: { isCvc: true, isDigraph: true, topics: topicsByGame.digraphs, breadcrumbs: crumbs("Consonant Digraphs", "/digraphs") } };
export const LetterJumbleMovers = {
  args: { topics: topicsByGame["letter-jumble"], progressFor: (topic) => (topic.id === "animals" ? 4 : 0), breadcrumbs: crumbs("Letter Jumble for Movers", "/letter-jumble"), titleAction: <HowToPlayButton language="en" onClick={fn()} /> },
};
export const Chinese = { args: { isChinese: true, topics: topicsByGame.chinese, breadcrumbs: crumbs("中文認字 · 入門篇", "/chinese") } };
export const MeasureWords = { args: { isChinese: true, isMeasure: true, topics: topicsByGame["measure-words"], breadcrumbs: crumbs("量詞配對", "/measure-words") } };
export const Idioms = { args: { isChinese: true, isIdiom: true, topics: topicsByGame.idioms, breadcrumbs: crumbs("成語", "/idioms") } };
