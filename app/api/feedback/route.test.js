/**
 * @jest-environment node
 */
import { POST } from "./route";

const post = (fields) => {
  const form = new FormData();
  Object.entries(fields).forEach(([name, value]) => form.set(name, value));
  return POST(new Request("http://localhost/api/feedback", { method: "POST", body: form }));
};
const picture = (type = "image/png", size = 10) => new File([new Uint8Array(size)], "screen.png", { type });

beforeEach(() => {
  process.env.RESEND_API_KEY = "test-key";
  delete process.env.FEEDBACK_FROM;
  global.fetch = jest.fn(async () => new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
});

describe("POST /api/feedback", () => {
  it("emails the message to the Rainbow Academy, with the page and language it came from", async () => {
    const response = await post({ message: "  The dragon is lovely!  ", page: "/dragon", language: "zh" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers.Authorization).toBe("Bearer test-key");
    const email = JSON.parse(options.body);
    expect(email.to).toEqual(["learn.at.rainbowacademy@gmail.com"]);
    expect(email.from).toBe("Rainbow Academy <onboarding@resend.dev>");
    expect(email.text).toBe("The dragon is lovely!\n\n—\nSent from: /dragon (site in 繁體中文)");
    expect(email.attachments).toBeUndefined();
  });

  it("attaches the picture", async () => {
    await post({ message: "Look at this", image: picture() });
    const email = JSON.parse(fetch.mock.calls[0][1].body);
    expect(email.attachments).toEqual([{ filename: "screen.png", content: Buffer.from(new Uint8Array(10)).toString("base64") }]);
  });

  it("turns away an empty message, a picture that isn't one and one that's too big", async () => {
    expect((await post({ message: "   " })).status).toBe(400);
    expect(await (await post({ message: "Hi", image: picture("application/pdf") })).json()).toEqual({ error: "imageType" });
    expect(await (await post({ message: "Hi", image: picture("image/png", 4 * 1024 * 1024 + 1) })).json()).toEqual({ error: "imageSize" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("quietly ignores spam robots, who fill in the hidden field", async () => {
    expect(await (await post({ message: "Buy now", website: "spam.example" })).json()).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says so when it isn't set up, or the email can't be sent", async () => {
    delete process.env.RESEND_API_KEY;
    expect(await (await post({ message: "Hi" })).json()).toEqual({ error: "notSetUp" });
    process.env.RESEND_API_KEY = "test-key";
    global.fetch = jest.fn(async () => new Response("{}", { status: 422 }));
    expect((await post({ message: "Hi" })).status).toBe(502);
  });
});
