// Sends the player menu's feedback to the Rainbow Academy's email address, through Resend
// (https://resend.com). It needs RESEND_API_KEY set on the server; FEEDBACK_FROM is who it's from
// (Resend's own test sender until the site has its own domain, which can only send to the address
// the Resend account was made with: the feedback address).
import { feedbackAddress, feedbackProblem } from "../../lib/feedback";

const from = () => process.env.FEEDBACK_FROM || "Rainbow Academy <onboarding@resend.dev>";

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "message" }, { status: 400 });
  }
  // A field people can't see: filled in only by spam robots, who are told it worked.
  if (form.get("website")) return Response.json({ ok: true });

  const message = form.get("message");
  const image = form.get("image");
  const picture = image && typeof image === "object" && image.size > 0 ? image : null;
  const problem = feedbackProblem(message, picture);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "notSetUp" }, { status: 503 });

  const page = String(form.get("page") ?? "").slice(0, 200);
  const language = form.get("language") === "zh" ? "繁體中文" : "English";
  const body = {
    from: from(),
    to: [feedbackAddress],
    subject: "Rainbow Academy feedback",
    text: `${message.trim()}\n\n—\nSent from: ${page || "/"} (site in ${language})`,
    ...(picture && {
      attachments: [{ filename: picture.name || "picture", content: Buffer.from(await picture.arrayBuffer()).toString("base64") }],
    }),
  };
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!sent?.ok) return Response.json({ error: "notSent" }, { status: 502 });
  return Response.json({ ok: true });
}
