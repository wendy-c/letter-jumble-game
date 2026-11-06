// Feedback from the player menu's "Send feedback" form: a message, and a picture if they like. The
// form and the server (app/api/feedback/route.js) check it the same way.
export const feedbackAddress = "learn.at.rainbowacademy@gmail.com";
export const maxMessageLength = 2000;
// Small enough for the email (and the server's limit on what it's sent).
export const maxImageBytes = 4 * 1024 * 1024;
export const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];

// What's wrong with a picture ("imageType" or "imageSize"), or null. No picture is fine.
export function imageProblem(image) {
  if (!image || image.size === 0) return null;
  if (!imageTypes.includes(image.type)) return "imageType";
  if (image.size > maxImageBytes) return "imageSize";
  return null;
}

// What's wrong with a message and picture ("message", "imageType" or "imageSize"), or null.
export function feedbackProblem(message, image) {
  const text = typeof message === "string" ? message.trim() : "";
  if (!text || text.length > maxMessageLength) return "message";
  return imageProblem(image);
}
