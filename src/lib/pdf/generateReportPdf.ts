import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { notoSansBoldBase64, notoSansRegularBase64 } from "./notoSansFont";

const FONT = "NotoSans";

function registerFont(doc: jsPDF) {
  doc.addFileToVFS("NotoSans-Regular.ttf", notoSansRegularBase64);
  doc.addFont("NotoSans-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", notoSansBoldBase64);
  doc.addFont("NotoSans-Bold.ttf", FONT, "bold");
  doc.setFont(FONT, "normal");
}

export function buildReportPdf({
  title,
  subtitle,
  head,
  rows,
  footerLines,
}: {
  title: string;
  subtitle?: string;
  head: string[];
  rows: (string | number)[][];
  footerLines?: string[];
}): jsPDF {
  const doc = new jsPDF();
  registerFont(doc);

  doc.setFontSize(16);
  doc.setFont(FONT, "bold");
  doc.text(title, 14, 18);

  let startY = 26;
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont(FONT, "normal");
    doc.text(subtitle, 14, startY);
    startY += 6;
  }

  autoTable(doc, {
    head: [head],
    body: rows,
    startY,
    styles: { font: FONT, fontSize: 10 },
    headStyles: { font: FONT, fontStyle: "bold", fillColor: [30, 30, 30] },
  });

  if (footerLines?.length) {
    const finalY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 8;
    doc.setFontSize(11);
    doc.setFont(FONT, "normal");
    footerLines.forEach((line, i) => {
      doc.text(line, 14, finalY + i * 6);
    });
  }

  return doc;
}

export async function sharePdf(doc: jsPDF, filename: string, shareTitle: string) {
  const blob = doc.output("blob");

  if (typeof navigator !== "undefined" && navigator.share) {
    const file = new File([blob], filename, { type: "application/pdf" });
    const canShareFiles =
      "canShare" in navigator ? navigator.canShare?.({ files: [file] }) : true;
    if (canShareFiles) {
      try {
        await navigator.share({ files: [file], title: shareTitle });
        return;
      } catch {
        // Пользователь отменил или Share API не смог обработать файл —
        // просто скачиваем PDF как запасной вариант.
      }
    }
  }

  doc.save(filename);
}
