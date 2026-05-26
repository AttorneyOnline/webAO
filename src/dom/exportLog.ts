/**
 * Export the IC chat log as a downloadable file.
 */
export function exportLog(format: string) {
  const logEl = document.getElementById("client_log");
  if (!logEl) return;

  const timestamp = new Date().toISOString().replace(/[T:.]/g, "-").slice(0, 19);
  const filename = `lemmyao-log-${timestamp}`;

  if (format === "txt") {
    // Plain text: extract visible text from each log entry
    const lines: string[] = [];
    logEl.querySelectorAll("p").forEach((p) => {
      const nameEl = p.querySelector(".iclog_name");
      const textEl = p.querySelector(".iclog_text");
      const timeEl = p.querySelector(".iclog_time");
      if (nameEl || textEl) {
        const name = nameEl ? nameEl.textContent?.trim() ?? "" : "";
        const text = textEl ? textEl.textContent?.trim() ?? "" : "";
        const time = timeEl ? `[${timeEl.textContent?.trim()}]` : "";
        lines.push(`${time} ${name} ${text}`.trim());
      } else {
        const raw = p.textContent?.trim();
        if (raw) lines.push(raw);
      }
    });
    downloadBlob(lines.join("\n"), `${filename}.txt`, "text/plain;charset=utf-8");
  } else if (format === "html") {
    // HTML: wrap log content in a styled standalone HTML document
    const logHtml = logEl.innerHTML;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LemmyAO Chat Log — ${new Date().toLocaleString()}</title>
  <style>
    body { background: #1a1a1a; color: #e0e0e0; font-family: sans-serif; padding: 20px; }
    p { line-height: 1.4em; border-top: 1px solid rgba(255,255,255,0.1); margin: 0; padding: 2px 0; }
    .iclog_name { font-weight: bold; padding-right: 0.35em; }
    .iclog_time { float: right; padding-right: 0.5em; color: #aaa; }
    .iclog_text { }
    .hrtext { text-align: center; color: #888; padding: 4px 0; }
  </style>
</head>
<body>
${logHtml}
</body>
</html>`;
    downloadBlob(html, `${filename}.html`, "text/html;charset=utf-8");
  }
}
window.exportLog = exportLog;

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay to allow the browser to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
