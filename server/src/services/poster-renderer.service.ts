import puppeteer from "puppeteer";

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
}

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

    const photosHtml = photoUrls
      .map(
        (url) => `
          <img
            src="${url}"
            class="photo"
            crossorigin="anonymous"
          />
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>

      <html lang="bn">
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

            body {
              font-family:
                "Noto Sans Bengali",
                "Noto Sans",
                sans-serif;

              background: ${backgroundColor};

              color: ${secondaryColor};
            }

            .poster {
              position: relative;

              width: 1200px;
              height: 1600px;

              overflow: hidden;

              background:
                ${
                  backgroundStyle ||
                  `linear-gradient(
                  135deg,
                  ${primaryColor},
                  ${backgroundColor}
                )`
                };

              padding: 80px;
            }

            .decoration {
              position: absolute;

              width: 700px;
              height: 700px;

              border-radius: 50%;

              background: ${secondaryColor};

              opacity: 0.06;

              right: -300px;
              top: -250px;
            }

            .content {
              position: relative;

              z-index: 2;

              height: 100%;

              display: flex;

              flex-direction: column;

              align-items: center;

              text-align: center;
            }

            .headline {
              margin-top: 40px;

              font-size: 72px;

              line-height: 1.25;

              font-weight: 800;

              color: ${secondaryColor};

              max-width: 1000px;
            }

            .photos {
              width: 100%;

              margin-top: 70px;

              display: flex;

              justify-content: center;

              gap: 30px;

              flex-wrap: wrap;
            }

            .photo {
              width: 460px;
              height: 560px;

              object-fit: cover;

              border-radius: 28px;

              border: 8px solid ${secondaryColor};

              background: ${primaryColor};
            }

            .photo:only-child {
              width: 700px;
              height: 760px;
            }

            .person {
              margin-top: 50px;
            }

            .name {
              font-size: 58px;

              font-weight: 800;

              line-height: 1.3;
            }

            .designation {
              margin-top: 15px;

              font-size: 36px;

              line-height: 1.4;
            }

            .organization {
              margin-top: 10px;

              font-size: 34px;

              line-height: 1.4;
            }

            .district {
              margin-top: 10px;

              font-size: 32px;

              line-height: 1.4;
            }

            .footer {
              margin-top: auto;

              padding-top: 50px;

              font-size: 28px;

              opacity: 0.85;
            }
          </style>
        </head>

        <body>
          <div class="poster">

            <div class="decoration"></div>

            <div class="content">

              <div class="headline">
                ${escapeHtml(headline)}
              </div>

              <div class="photos">
                ${photosHtml}
              </div>

              <div class="person">

                <div class="name">
                  ${escapeHtml(name)}
                </div>

                ${
                  designation
                    ? `
                      <div class="designation">
                        ${escapeHtml(designation)}
                      </div>
                    `
                    : ""
                }

                ${
                  organization
                    ? `
                      <div class="organization">
                        ${escapeHtml(organization)}
                      </div>
                    `
                    : ""
                }

                <div class="district">
                  ${escapeHtml(district)}
                </div>

              </div>

              <div class="footer">
                AI Poster Maker
              </div>

            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html, {
      waitUntil: "load",
    });

    const image = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    return Buffer.from(image);
  } finally {
    await browser.close();
  }
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
