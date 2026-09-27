import path from "node:path";
import { pathToFileURL } from "node:url";

import puppeteer from "puppeteer";
import type { TextSlot } from "../../types/poster.tyes.js";
import type { PosterLayout } from "../validators/poster-layout.validator.js";

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
  layout?: PosterLayout;

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
  layout,
  photoSlots,
  textSlots,
}: RenderPosterOptions): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath: "/usr/bin/google-chrome",
    // headless: false,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });

    const headlineText = headline?.trim() || "Your message matters";
    const textValues: Record<string, string> = {
      headline: headlineText,
      name: name.trim(),
      designation: designation?.trim() || "",
      organization: organization?.trim() || "",
      footer: district.trim(),
    };
    const textColor = getReadableTextColor(backgroundColor, primaryColor);

    const headlineSlot: TextSlot = textSlots.find(
      (slot) => slot.type === "headline",
    ) ?? {
      type: "headline",
      x: 80,
      y: 70,
      width: 1040,
      height: 180,
      fontSize: 58,
      fontWeight: 700,
      align: "center",
    };
    const footerSlot: TextSlot = textSlots.find(
      (slot) => slot.type === "footer",
    ) ?? {
      type: "footer",
      x: 80,
      y: 1470,
      width: 1040,
      height: 70,
      fontSize: 26,
      fontWeight: 500,
      align: "center",
    };
    const effectiveTextSlots: TextSlot[] = [
      headlineSlot,
      ...textSlots.filter(
        (slot) => slot.type !== "headline" && slot.type !== "footer",
      ),
      footerSlot,
    ].map((slot) => {
      if (slot.type === "footer" && layout) {
        return {
          ...slot,
          align:
            layout.footerStyle === "simple"
              ? "left"
              : layout.footerStyle === "centered"
                ? "center"
                : "right",
        };
      }

      if (slot.type !== "headline" || !layout) {
        return slot;
      }

      const position = layout.headlinePosition;
      const align: TextSlot["align"] =
        position === "top-center"
          ? "center"
          : position === "top-left"
            ? "left"
            : "right";
      const width = Math.min(slot.width, 1040);

      return {
        ...slot,
        x:
          position === "top-left"
            ? 80
            : position === "top-right"
              ? 1200 - width - 80
              : 80,
        y: slot.width >= 700 ? 70 : slot.y,
        width,
        align,
      };
    });

    const effectivePhotoSlots = (() => {
      if (photoUrls.length <= 1) {
        const source = photoSlots[0];
        const headlineSlot = textSlots.find((slot) => slot.type === "headline");

        if (!source) return [];

        const isFullWidthTextLayout = (headlineSlot?.width ?? 0) >= 700;

        return [
          isFullWidthTextLayout
            ? {
                ...source,
                x: Math.round((1200 - source.width) / 2),
                y: 300,
              }
            : source,
        ];
      }
      if (photoSlots.length >= photoUrls.length) {
        return photoSlots.slice(0, photoUrls.length);
      }

      const source = photoSlots[0];
      if (!source) return [];

      const gap = 20;
      const columns = photoUrls.length;
      const width = (source.width - gap * (columns - 1)) / columns;

      return photoUrls.map((_, index) => ({
        ...source,
        x: source.x + index * (width + gap),
        width,
        borderRadius: Math.min(source.borderRadius ?? 0, 24),
      }));
    })();

    const decorationName = layout?.decoration.join(" ").toLowerCase() ?? "";
    const decorationClass = decorationName.includes("diagonal")
      ? "decoration-diagonal"
      : decorationName.includes("grid")
        ? "decoration-grid"
        : decorationName.includes("frame")
          ? "decoration-frame"
          : decorationName.includes("corner")
            ? "decoration-corner"
            : "decoration-circles";

    const photoHtml = effectivePhotoSlots
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

    const effectiveHeadlineSlot =
      effectiveTextSlots.find((slot) => slot.type === "headline") ??
      headlineSlot;
    const headlineHtml = `
      <div
        id="poster-headline"
        class="text-slot"
        data-text-type="headline"
        style="
          left: ${effectiveHeadlineSlot.x}px;
          top: ${effectiveHeadlineSlot.y}px;
          width: ${effectiveHeadlineSlot.width}px;
          height: ${effectiveHeadlineSlot.height}px;
          font-size: ${getFontSize(effectiveHeadlineSlot, headlineText)}px;
          --min-font-size: ${fontScale.headline.min}px;
          font-weight: ${effectiveHeadlineSlot.fontWeight ?? 700};
          text-align: ${effectiveHeadlineSlot.align ?? "center"};
          color: ${textColor};
          z-index: 10;
        "
      >
        <span class="text-content">${escapeHtml(headlineText)}</span>
      </div>
    `;

    const textHtml = effectiveTextSlots
      .filter((slot) => slot.type !== "headline")
      .map((slot) => {
        const value = textValues[slot.type] || "";

        if (!value) {
          return "";
        }

        return `
          <div
            class="text-slot"
            data-text-type="${slot.type}"
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
              z-index: ${slot.type === "headline" ? 10 : 2};
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

              background: ${
                backgroundStyle || layout
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

            .decoration-diagonal::after {
              content: "";
              position: absolute;
              inset: 0;
              background: ${secondaryColor};
              opacity: 0.24;
              clip-path: polygon(0 70%, 100% 15%, 100% 35%, 0 90%);
            }

            .decoration-grid {
              width: 100%;
              height: 100%;
              opacity: 0.12;
              background-image: linear-gradient(${primaryColor} 2px, transparent 2px), linear-gradient(90deg, ${primaryColor} 2px, transparent 2px);
              background-size: 80px 80px;
            }

            .decoration-frame {
              inset: 28px;
              border: 18px solid ${primaryColor};
              border-radius: 0;
              opacity: 0.14;
            }

            .decoration-corner {
              width: 620px;
              height: 620px;
              right: -280px;
              top: -280px;
              border-radius: 0 0 0 100%;
              background: ${primaryColor};
              opacity: 0.16;
            }

            .photo {
              position: absolute;
              object-fit: cover;
              display: block;
              z-index: 1;
            }

            .text-slot {
              position: absolute;
              z-index: 2;
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

            <div class="decoration ${decorationClass} decoration-one"></div>
            <div class="decoration decoration-two"></div>

            ${photoHtml}

            ${headlineHtml}

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

      const headline = document.querySelector<HTMLElement>("#poster-headline");
      if (!headline || !headline.textContent?.trim()) {
        throw new Error("Poster headline was not rendered");
      }

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
