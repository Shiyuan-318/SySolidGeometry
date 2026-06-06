export function exportCanvasAsImage(canvas: HTMLCanvasElement, filename: string = 'sy-solid-geometry.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function getThreeCanvas(): HTMLCanvasElement | null {
  return document.querySelector('canvas');
}
