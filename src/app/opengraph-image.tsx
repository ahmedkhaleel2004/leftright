import { ogSize, renderOg } from "~/lib/og";

export const alt = "left / right: which hand types faster?";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg(null);
}
