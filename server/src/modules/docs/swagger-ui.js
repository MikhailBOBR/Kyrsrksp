const swaggerUiOptions = {
  customSiteTitle: "Рацион API | Документация",
  customfavIcon: "/favicon.svg",
  customCss: `
    body {
      background:
        radial-gradient(circle at top right, rgba(198, 214, 228, 0.18), transparent 22%),
        radial-gradient(circle at 0 0, rgba(214, 231, 224, 0.26), transparent 24%),
        linear-gradient(180deg, #fdfefe 0%, #f6faf8 100%);
    }

    .swagger-ui {
      color: #1a2430;
      font-family: "Segoe UI Variable Text", "Bahnschrift", "Segoe UI", sans-serif;
    }

    .swagger-ui .topbar {
      padding: 14px 20px;
      background: linear-gradient(135deg, #21384b 0%, #5f7d92 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 12px 30px rgba(27, 42, 51, 0.14);
    }

    .swagger-ui .topbar-wrapper img,
    .swagger-ui .topbar-wrapper svg,
    .swagger-ui .download-url-wrapper {
      display: none;
    }

    .swagger-ui .topbar-wrapper::before {
      content: "Рацион API";
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      padding: 0 16px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      color: #f7fbfd;
      background: rgba(255, 255, 255, 0.08);
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .swagger-ui .wrapper {
      max-width: 1360px;
      padding: 0 18px 36px;
    }

    .swagger-ui .scheme-container {
      margin: 18px 0 24px;
      padding: 14px 18px;
      border: 1px solid rgba(104, 127, 133, 0.14);
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.84);
      box-shadow: 0 16px 32px rgba(32, 47, 55, 0.06);
    }

    .swagger-ui .info {
      margin: 18px 0 28px;
    }

    .swagger-ui .info .title {
      color: #182431;
      font-family: "Segoe UI Variable Display", "Bahnschrift", "Segoe UI", sans-serif;
      font-size: clamp(1.9rem, 3vw, 2.5rem);
      font-weight: 750;
      letter-spacing: -0.03em;
    }

    .swagger-ui .info p,
    .swagger-ui .info li,
    .swagger-ui .markdown p,
    .swagger-ui .markdown li {
      color: #4e6371;
      line-height: 1.65;
    }

    .swagger-ui .info .base-url {
      border-radius: 999px;
      border-color: rgba(95, 125, 146, 0.18);
      background: rgba(95, 125, 146, 0.08);
      color: #355062;
    }

    .swagger-ui .opblock-tag {
      padding: 18px 10px 16px;
      border-bottom-color: rgba(104, 127, 133, 0.12);
      color: #1a2430;
      font-family: "Segoe UI Variable Display", "Bahnschrift", "Segoe UI", sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .swagger-ui .opblock-tag small {
      color: #607381;
      font-weight: 500;
    }

    .swagger-ui .opblock {
      margin: 0 0 16px;
      border-width: 1px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(32, 47, 55, 0.05);
    }

    .swagger-ui .opblock .opblock-summary {
      padding: 6px 12px;
      align-items: center;
    }

    .swagger-ui .opblock .opblock-summary-method {
      min-width: 76px;
      border-radius: 999px;
      font-weight: 700;
    }

    .swagger-ui .opblock.opblock-get {
      border-color: rgba(74, 119, 149, 0.18);
      background: rgba(242, 247, 250, 0.92);
    }

    .swagger-ui .opblock.opblock-post {
      border-color: rgba(114, 149, 145, 0.18);
      background: rgba(244, 250, 248, 0.96);
    }

    .swagger-ui .opblock.opblock-put,
    .swagger-ui .opblock.opblock-patch {
      border-color: rgba(176, 149, 101, 0.18);
      background: rgba(252, 249, 243, 0.96);
    }

    .swagger-ui .opblock.opblock-delete {
      border-color: rgba(165, 107, 115, 0.18);
      background: rgba(252, 245, 246, 0.96);
    }

    .swagger-ui .responses-inner h4,
    .swagger-ui .responses-inner h5,
    .swagger-ui .opblock-description-wrapper p,
    .swagger-ui .opblock-external-docs-wrapper p,
    .swagger-ui .opblock-title_normal p {
      color: #445867;
    }

    .swagger-ui .btn,
    .swagger-ui input[type=text],
    .swagger-ui input[type=password],
    .swagger-ui input[type=search],
    .swagger-ui input[type=email],
    .swagger-ui textarea,
    .swagger-ui select {
      border-radius: 12px;
    }

    .swagger-ui .btn.authorize,
    .swagger-ui .btn.execute {
      border-color: #5f7d92;
      background: #5f7d92;
      color: #ffffff;
      box-shadow: none;
    }

    .swagger-ui .btn.authorize svg {
      fill: currentColor;
    }

    .swagger-ui .authorization__btn {
      color: #5f7d92;
    }

    .swagger-ui .model-box {
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.7);
    }

    @media (max-width: 820px) {
      .swagger-ui .wrapper {
        padding-inline: 12px;
      }

      .swagger-ui .scheme-container {
        padding: 12px;
      }

      .swagger-ui .topbar {
        padding-inline: 12px;
      }
    }
  `,
  swaggerOptions: {
    defaultModelExpandDepth: 2,
    defaultModelsExpandDepth: 2,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    persistAuthorization: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  swaggerUiOptions
};
