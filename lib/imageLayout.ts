/**
 * Rect of the actual image content when drawn with contain inside a container.
 * (x, y) are relative to the container; width/height are the content box size.
 */
export interface ContainRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Computes the rect occupied by the image when drawn with resizeMode="contain"
 * inside a container of (containerWidth, containerHeight).
 */
export function getContainRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ContainRect {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return { x: 0, y: 0, width: containerWidth, height: containerHeight };
  }
  const aspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  let width: number;
  let height: number;
  if (containerAspect > aspect) {
    height = containerHeight;
    width = containerHeight * aspect;
  } else {
    width = containerWidth;
    height = containerWidth / aspect;
  }
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;
  return { x, y, width, height };
}

/**
 * Maps a touch point (relative to the container) to image pixel coordinates.
 * Returns { x, y } in [0, imageWidth) x [0, imageHeight), or null if outside content rect.
 */
export function viewToImagePixel(
  touchX: number,
  touchY: number,
  containRect: ContainRect,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number } | null {
  const localX = touchX - containRect.x;
  const localY = touchY - containRect.y;
  if (
    localX < 0 ||
    localY < 0 ||
    localX >= containRect.width ||
    localY >= containRect.height
  ) {
    return null;
  }
  const x = (localX / containRect.width) * imageWidth;
  const y = (localY / containRect.height) * imageHeight;
  return { x, y };
}
