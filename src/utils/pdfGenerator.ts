import jsPDF from "jspdf";

interface PDFData {
  name: string;
  userWish: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
  score: number;
}

export const generatePDF = async ({
  name,
  userWish,
  elfImage,
  elfTitle,
  elfDescription,
  score,
}: PDFData): Promise<void> => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Background color (light cream)
  pdf.setFillColor(255, 250, 245);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Red border
  pdf.setDrawColor(180, 30, 30);
  pdf.setLineWidth(3);
  pdf.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, "S");

  // Inner gold border
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(1);
  pdf.rect(margin + 5, margin + 5, pageWidth - margin * 2 - 10, pageHeight - margin * 2 - 10, "S");

  // Main Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(180, 30, 30);
  pdf.text("Joulun Osaaja – Todistus", pageWidth / 2, 40, { align: "center" });

  // Decorative line
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 40, 50, pageWidth - margin - 40, 50);

  // Certificate text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Tämä todistus myönnetään", pageWidth / 2, 65, { align: "center" });

  // Name (h2 sized)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(34, 139, 34);
  pdf.text(name, pageWidth / 2, 80, { align: "center" });

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text(dateStr, pageWidth / 2, 90, { align: "center" });

  // Wish explanation
  if (userWish && userWish.trim()) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    const wishText = `${name} toivoo: "${userWish.substring(0, 100)}${userWish.length > 100 ? "..." : ""}"`;
    const splitWish = pdf.splitTextToSize(wishText, pageWidth - margin * 2 - 40);
    pdf.text(splitWish, pageWidth / 2, 100, { align: "center" });
  }

  // Elf image (centered, good resolution)
  if (elfImage && elfImage.startsWith("data:image")) {
    try {
      const imgWidth = 75;
      const imgHeight = 75;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = userWish ? 115 : 105;
      pdf.addImage(elfImage, "JPEG", imgX, imgY, imgWidth, imgHeight);
    } catch (error) {
      console.error("Error adding image to PDF:", error);
    }
  }

  const textStartY = userWish ? 200 : 190;

  // Elf title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(218, 165, 32);
  pdf.text(elfTitle, pageWidth / 2, textStartY, { align: "center" });

  // Elf description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  const splitDescription = pdf.splitTextToSize(elfDescription, pageWidth - margin * 2 - 30);
  pdf.text(splitDescription, pageWidth / 2, textStartY + 12, { align: "center" });

  // Score section
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(180, 30, 30);
  pdf.text(`Tonttupisteet: ${score}/10`, pageWidth / 2, textStartY + 35, { align: "center" });

  // Badge placeholder area
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 40, pageHeight - 55, pageWidth - margin - 40, pageHeight - 55);

  // Badge text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("🎖️ Joulun Osaaja -osaamismerkki", pageWidth / 2, pageHeight - 48, { align: "center" });

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text("Eduro-säätiö / Lapland AI Lab", pageWidth / 2, pageHeight - 35, { align: "center" });

  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text("eduro.fi/joulunosaaja", pageWidth / 2, pageHeight - 28, { align: "center" });

  pdf.setFontSize(8);
  pdf.text("🎄 Joulun Osaaja -todistus 🎄", pageWidth / 2, pageHeight - 20, {
    align: "center",
  });

  // Download
  pdf.save(`joulun-osaaja-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
};
