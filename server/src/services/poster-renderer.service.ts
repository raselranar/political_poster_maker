import path from "node:path";
import { pathToFileURL } from "node:url";

import puppeteer from "puppeteer";
import type { TextSlot } from "../../types/poster.tyes.js";

interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

interface RenderPosterOptions {
  name: string;
  designation?: string;
  organization?: string;
  district: string;
  headline: string;
  photoUrls: string[];

  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle?: string;

  photoSlots: PhotoSlot[];
  textSlots: TextSlot[];
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const fontUrl = pathToFileURL(
  path.resolve(process.cwd(), "assets/fonts/NotoSansBengali.ttf"),
).href;

const getRgb = (color: string) => {
  const hex = color.replace(/^#/, "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex;

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return null;
  }

  return [0, 2, 4].map((index) =>
    parseInt(normalized.slice(index, index + 2), 16),
  );
};

const getLuminance = (color: string) => {
  const rgb = getRgb(color);

  if (!rgb) {
    return null;
  }

  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
};

const getReadableTextColor = (
  backgroundColor: string,
  primaryColor: string,
) => {
  const backgroundLuminance = getLuminance(backgroundColor);

  if (backgroundLuminance === null) {
    return primaryColor || "#111827";
  }

  const candidates = [primaryColor, "#111827", "#FFFFFF"].filter(Boolean);
  const readableColor = candidates
    .map((color) => {
      const luminance = getLuminance(color);

      return {
        color,
        contrast:
          luminance === null
            ? 0
            : (Math.max(backgroundLuminance, luminance) + 0.05) /
              (Math.min(backgroundLuminance, luminance) + 0.05),
      };
    })
    .sort((first, second) => second.contrast - first.contrast)[0];

  return readableColor?.color || "#111827";
};

export const renderPoster = async ({
  name,
  designation,
  organization,
  district,
  headline,
  photoUrls,
  backgroundColor,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  photoSlots,
  textSlots,
}: RenderPosterOptions): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });

    const textValues: Record<string, string> = {
      headline,
      name,
      designation: designation || "",
      organization: organization || "",
      footer: district,
    };
    const textColor = getReadableTextColor(backgroundColor, primaryColor);

    const photoHtml = photoSlots
      .map((slot, index) => {
        const photoUrl = photoUrls[index];

        if (!photoUrl) {
          return "";
        }

        return `
          <img
            src="${escapeHtml(photoUrl)}"
              crossorigin="anonymous"
            class="photo"
            style="
              left: ${slot.x}px;
              top: ${slot.y}px;
              width: ${slot.width}px;
              height: ${slot.height}px;
              border-radius: ${slot.borderRadius ?? 0}px;
            "
          />
        `;
      })
      .join("");

    const fontScale: Record<TextSlot["type"], { min: number; max: number }> = {
      headline: { min: 32, max: 54 },
      name: { min: 34, max: 50 },
      designation: { min: 22, max: 35 },
      organization: { min: 20, max: 32 },
      footer: { min: 20, max: 30 },
    };

    const getFontSize = (slot: TextSlot, value: string) => {
      const scale = fontScale[slot.type];
      const baseSize = Math.min(slot.fontSize, scale.max);

      if (slot.type !== "headline") {
        return Math.max(scale.min, baseSize);
      }

      const characterCount = Array.from(value).length;
      const lengthScale =
        characterCount > 95
          ? 0.62
          : characterCount > 65
            ? 0.72
            : characterCount > 40
              ? 0.82
              : 1;

      return Math.max(scale.min, baseSize * lengthScale);
    };

    const getSlotTop = (slot: TextSlot) => {
      if (slot.type !== "footer") {
        return slot.y;
      }

      const previousSlot = textSlots
        .filter(
          (candidate) =>
            candidate.type !== "footer" &&
            textValues[candidate.type] &&
            candidate.y + candidate.height <= slot.y,
        )
        .sort((first, second) => second.y - first.y)[0];

      return previousSlot
        ? Math.min(
            slot.y,
            previousSlot.y + Math.round(previousSlot.height * 0.65),
          )
        : slot.y;
    };

    const textHtml = textSlots
      .map((slot) => {
        const value = textValues[slot.type] || "";

        if (!value) {
          return "";
        }

        return `
          <div
            class="text-slot"
            style="
              left: ${slot.x}px;
              top: ${getSlotTop(slot)}px;
              width: ${slot.width}px;
              height: ${slot.height}px;
              font-size: ${getFontSize(slot, value)}px;
              --min-font-size: ${fontScale[slot.type].min}px;
              font-weight: ${slot.fontWeight ?? 500};
              text-align: ${slot.align};
              color: ${textColor};
            "
          >
            <span class="text-content">${escapeHtml(value)}</span>
          </div>
        `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 1200px;
              height: 1600px;
            }

            @font-face {
              font-family: "PosterBangla";
              src: url("${fontUrl}");
              font-weight: 400;
            }
            @font-face {
              font-family: "PosterBangla";
              src: url("${fontUrl}");
              font-weight: 700 900;
            }

            body {
              font-family:
                "PosterBangla",
                sans-serif;
             overflow: hidden;
            }
.poster {
              position: relative;
              width: 1200px;
              height: 1600px;

              background:
                ${
                  backgroundStyle
                    ? `linear-gradient(135deg, ${backgroundColor}, ${secondaryColor})`
                    : backgroundColor
                };

              overflow: hidden;
            }

            .decoration {
              position: absolute;
              border-radius: 50%;
              pointer-events: none;
            }

            .decoration-one {
              width: 500px;
              height: 500px;
              right: -180px;
              top: -150px;
              background: ${primaryColor};
              opacity: 0.12;
            }

            .decoration-two {
              width: 400px;
              height: 400px;
              left: -180px;
              bottom: -100px;
              background: ${secondaryColor};
              opacity: 0.18;
            }

            .photo {
              position: absolute;
              object-fit: cover;
              display: block;
            }

            .text-slot {
              position: absolute;
              display: flex;
              align-items: center;
              padding: 10px 14px;
              line-height: 1.3;
              overflow: hidden;
              word-break: break-word;
              overflow-wrap: anywhere;
            }

            .text-content {
              width: 100%;
            }
          </style>
        </head>

        <body>
          <div class="poster">

            <div class="decoration decoration-one"></div>
            <div class="decoration decoration-two"></div>

            ${photoHtml}

            ${textHtml}

          </div>
        </body>
      </html>
    `;

    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.evaluate(async () => {
      await document.fonts.ready;

      document
        .querySelectorAll<HTMLElement>(".text-slot")
        .forEach((element) => {
          let fontSize = parseFloat(getComputedStyle(element).fontSize);
          const minFontSize = parseFloat(
            getComputedStyle(element).getPropertyValue("--min-font-size"),
          );

          while (
            fontSize > minFontSize &&
            (element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1)
          ) {
            fontSize -= 1;
            element.style.fontSize = `${fontSize}px`;
          }
        });

      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }),
      );
    });

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
};
