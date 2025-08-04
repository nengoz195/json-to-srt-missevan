// ==UserScript==
// @name         JSON to SRT Converter (Góc trái đẹp)
// @namespace    https://chat.openai.com/
// @version      1.2
// @description  Chuyển JSON phụ đề sang SRT - Giao diện thân thiện, hiển thị ở góc trái màn hình.
// @author       Thien Truong Dia Cuu
// @match        *://*/*
// @grant        GM_download
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // --- UI: góc trái thân thiện ---
  const panel = document.createElement('div');
  panel.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 20px;
      background: #fdfdfd;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 16px;
      z-index: 99999;
      font-family: 'Segoe UI', sans-serif;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      width: 260px;
    ">
      <h3 style="margin: 0 0 10px; font-size: 16px; color: #333;">🎬 JSON → SRT</h3>
      <input type="file" id="jsonInput" accept=".json" style="margin-bottom: 12px; width: 100%;" />
      <button id="convertBtn" style="
        width: 100%;
        padding: 10px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      ">
        🚀 Chuyển đổi & Tải về
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // --- Hiệu ứng nút ---
  const style = document.createElement("style");
  style.textContent = `
    #convertBtn:hover {
      background-color: #45a049 !important;
    }
    #convertBtn:active {
      background-color: #3e9142 !important;
    }
  `;
  document.head.appendChild(style);

  // --- Chuyển đổi JSON → SRT ---
  document.getElementById('convertBtn').addEventListener('click', () => {
    const input = document.getElementById('jsonInput');
    if (!input.files.length) return alert("📂 Vui lòng chọn một file JSON.");

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        const subtitles = [];
        let srtIndex = 1;

        data.forEach(entry => {
          const startMs = entry.start_time || 0;
          const endMs = entry.end_time || 0;
          const role = entry.role || '';
          let content = entry.content || '';
          const color = entry.color ?? 16777215;
          const italic = entry.italic || false;
          const underline = entry.underline || false;

          let line = role ? `${role}: ${content}` : content;

          if (color !== 16777215) {
            const hex = `#${color.toString(16).padStart(6, '0')}`;
            line = `<font color="${hex}">${line}</font>`;
          }
          if (italic) line = `<i>${line}</i>`;
          if (underline) line = `<u>${line}</u>`;

          const formatTime = ms => {
            const date = new Date(ms);
            const hh = String(date.getUTCHours()).padStart(2, '0');
            const mm = String(date.getUTCMinutes()).padStart(2, '0');
            const ss = String(date.getUTCSeconds()).padStart(2, '0');
            const msPart = String(date.getUTCMilliseconds()).padStart(3, '0');
            return `${hh}:${mm}:${ss},${msPart}`;
          };

          const start = formatTime(startMs);
          const end = formatTime(endMs);

          subtitles.push(`${srtIndex++}\n${start} --> ${end}\n${line}\n`);
        });

        const srtBlob = new Blob([subtitles.join('\n')], { type: 'text/plain' });

        GM_download({
          url: URL.createObjectURL(srtBlob),
          name: file.name.replace(/\.json$/, '.srt'),
          saveAs: true
        });
      } catch (err) {
        alert("❌ Lỗi xử lý file JSON: " + err.message);
      }
    };

    reader.readAsText(file);
  });
})();
