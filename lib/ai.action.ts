import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constans";

export async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

export const Generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);
  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1];

  if (!base64Data || !mimeType) {
    throw new Error("Invalid data URL");
  }

  let response: unknown;
  try {
    response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
      provider: "gemini",
      model: "gemini-2.5-flash-image-preview",
      input_image: base64Data,
      input_image_mime_type: mimeType,
      ratio: { w: 1024, h: 1024 },
    });
  } catch (err: unknown) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : err instanceof Error
          ? err.message
          : "Generate 3D gagal";
    throw new Error(msg);
  }

  const img = response as HTMLImageElement & { valueOf?: () => string };
  const rawImageUrl =
    img?.src ?? (typeof img?.valueOf === "function" ? img.valueOf() : null);
  if (!rawImageUrl || typeof rawImageUrl !== "string") {
    throw new Error("API tidak mengembalikan gambar (response kosong)");
  }

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataUrl(rawImageUrl);
  return { renderedImage, renderedPath: undefined };
};
