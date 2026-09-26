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

    const getFontSize = (slot: TextSlot, value: string) => {
      if (slot.type !== "headline") {
        return slot.fontSize;
      }

      const length = value.length;

      if (length > 100) {
        return Math.max(40, slot.fontSize * 0.55);
      }

      if (length > 70) {
        return Math.max(45, slot.fontSize * 0.7);
      }

      if (length > 45) {
        return Math.max(50, slot.fontSize * 0.85);
      }

      return slot.fontSize;
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
              top: ${slot.y}px;
              width: ${slot.width}px;
              height: ${slot.height}px;
              font-size: ${getFontSize(slot, value)}px;
              font-weight: ${slot.fontWeight};
              text-align: ${slot.align};
              color: ${primaryColor};
            "
          >
            ${escapeHtml(value)}
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
            display: block;
            padding: 10px;
            line-height: 1.35;
            overflow: visible;
            word-break: break-word;
            overflow-wrap: break-word;
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
