import { Skia, AlphaType, ColorType } from "@shopify/react-native-skia";
import { File } from "expo-file-system";

const IMAGE_INFO_1X1 = {
  width: 1,
  height: 1,
  alphaType: AlphaType.Unpremul,
  colorType: ColorType.RGBA_8888,
} as const;

function rgbaToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function getImageBytes(uri: string): Promise<Uint8Array> {
  if (uri.startsWith("file://")) {
    const file = new File(uri);
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }
  const res = await fetch(uri);
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Loads a Skia Image from a URI (file:// or http(s)://). Use this when useImage
 * is not suitable (e.g. file:// URIs from the image picker).
 */
export async function loadSkImageFromUri(
  uri: string
): Promise<ReturnType<typeof Skia.Image.MakeImageFromEncoded> | null> {
  const bytes = await getImageBytes(uri);
  const data = Skia.Data.fromBytes(bytes);
  return Skia.Image.MakeImageFromEncoded(data);
}

/**
 * Samples the color at (pixelX, pixelY) in image pixel coordinates.
 * Coordinates are clamped to image bounds.
 * Returns hex string (e.g. "#ff0000") or null on failure (bad URI, unsupported format, etc.).
 */
export async function samplePixelColor(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
  pixelX: number,
  pixelY: number
): Promise<string | null> {
  const x = Math.max(0, Math.min(imageWidth - 1, Math.floor(pixelX)));
  const y = Math.max(0, Math.min(imageHeight - 1, Math.floor(pixelY)));

  try {
    const bytes = await getImageBytes(imageUri);
    const data = Skia.Data.fromBytes(bytes);
    const image = Skia.Image.MakeImageFromEncoded(data);
    if (!image) return null;

    const pixels = image.readPixels(x, y, IMAGE_INFO_1X1);
    if (!pixels || pixels.length < 4) return null;

    const r = pixels[0];
    const g = pixels[1];
    const b = pixels[2];
    return rgbaToHex(r, g, b);
  } catch {
    return null;
  }
}
