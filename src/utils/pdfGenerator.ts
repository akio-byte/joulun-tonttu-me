import jsPDF from "jspdf";

interface PDFData {
  name: string;
  elfImage: string;
  elfTitle: string;
  elfDescription: string;
  score: number;
}

export const generatePDF = async ({
  name,
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
  const margin = 20;

  // Background color (light cream)
  pdf.setFillColor(255, 250, 245);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Red border
  pdf.setDrawColor(180, 30, 30);
  pdf.setLineWidth(3);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");

  // Inner gold border
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(1);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30, "S");

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.setTextColor(180, 30, 30);
  pdf.text("Joulun Osaaja", pageWidth / 2, 40, { align: "center" });

  // Subtitle
  pdf.setFontSize(14);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Eduro Pikkujoulukioski", pageWidth / 2, 50, { align: "center" });

  // Decorative line
  pdf.setDrawColor(218, 165, 32);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 30, 58, pageWidth - margin - 30, 58);

  // Certificate text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Tämä todistus myönnetään", pageWidth / 2, 72, { align: "center" });

  // Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(34, 139, 34);
  pdf.text(name, pageWidth / 2, 85, { align: "center" });

  // Elf image (if available and valid)
  if (elfImage && elfImage.startsWith("data:image")) {
    try {
      const imgWidth = 60;
      const imgHeight = 60;
      const imgX = (pageWidth - imgWidth) / 2;
      pdf.addImage(elfImage, "JPEG", imgX, 95, imgWidth, imgHeight);
    } catch (error) {
      console.error("Error adding image to PDF:", error);
    }
  }

  // Elf title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(218, 165, 32);
  pdf.text(elfTitle, pageWidth / 2, 170, { align: "center" });

  // Elf description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  const splitDescription = pdf.splitTextToSize(elfDescription, pageWidth - margin * 2 - 20);
  pdf.text(splitDescription, pageWidth / 2, 182, { align: "center" });

  // Score
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(180, 30, 30);
  pdf.text(`Tonttupisteet: ${score}/15`, pageWidth / 2, 215, { align: "center" });

  // Decorative line
  pdf.setDrawColor(218, 165, 32);
  pdf.line(margin + 30, 225, pageWidth - margin - 30, 225);

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Myönnetty: ${dateStr}`, pageWidth / 2, 235, { align: "center" });

  // Footer
  pdf.setFontSize(9);
  pdf.text("🎄 Eduro - Joulun Osaaja -todistus 🎄", pageWidth / 2, pageHeight - 20, {
    align: "center",
  });

  // Download
  pdf.save(`joulun-osaaja-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
};
