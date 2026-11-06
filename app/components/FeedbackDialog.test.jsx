import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageContext } from "../i18n";
import PlayerMenu from "./PlayerMenu";

const player = { id: "a", name: "Ada", coins: 3 };
const noop = () => {};

function renderMenu(language = "en") {
  return render(
    <LanguageContext.Provider value={language}>
      <PlayerMenu player={player} onSwitch={noop} onBadges={noop} onParentMode={noop} onLanguage={noop} onLogOut={noop} />
    </LanguageContext.Provider>,
  );
}

async function openFeedback(user) {
  await user.click(screen.getByRole("button", { name: /Player options/ }));
  await user.click(screen.getByRole("menuitem", { name: /Send feedback/ }));
  return screen.getByRole("dialog", { name: "Send us feedback" });
}

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }));
  URL.createObjectURL = jest.fn(() => "blob:preview");
  URL.revokeObjectURL = jest.fn();
});

describe("Send feedback", () => {
  it("opens from the player menu, and asks for a message before sending", async () => {
    const user = userEvent.setup();
    renderMenu();
    await openFeedback(user);
    expect(screen.getByLabelText("Your message")).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please write a message first.");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the message and a picture, then says thank you", async () => {
    const user = userEvent.setup();
    renderMenu();
    await openFeedback(user);
    await user.type(screen.getByLabelText("Your message"), "We love Mochi!");
    await user.upload(screen.getByLabelText("Add a picture (optional)"), new File(["png"], "mochi.png", { type: "image/png" }));
    expect(screen.getByRole("img", { name: "The picture you chose" })).toHaveAttribute("src", "blob:preview");
    await user.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Thank you! Your message has been sent."));
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/feedback");
    expect(options.body.get("message")).toBe("We love Mochi!");
    expect(options.body.get("image").name).toBe("mochi.png");
    expect(options.body.get("language")).toBe("en");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("won't take a file that isn't a picture, and lets a picture be removed", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderMenu();
    await openFeedback(user);
    const input = screen.getByLabelText("Add a picture (optional)");
    await user.upload(input, new File(["%PDF"], "notes.pdf", { type: "application/pdf" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose a PNG, JPG, GIF or WebP picture.");
    await user.upload(input, new File(["png"], "mochi.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: "Remove picture" }));
    expect(screen.queryByRole("img", { name: "The picture you chose" })).not.toBeInTheDocument();
  });

  it("says when it couldn't send, keeping the message, in Chinese too", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, json: async () => ({ error: "notSetUp" }) }));
    const user = userEvent.setup();
    renderMenu("zh");
    await user.click(screen.getByRole("button", { name: /Player options|選項/ }));
    await user.click(screen.getByRole("menuitem", { name: /意見回饋/ }));
    expect(screen.getByRole("dialog", { name: "給我們意見" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("你的訊息"), "很好玩！");
    await user.click(screen.getByRole("button", { name: "傳送" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("對不起，訊息未能傳送，請稍後再試。"));
    expect(screen.getByLabelText("你的訊息")).toHaveValue("很好玩！");
  });
});
