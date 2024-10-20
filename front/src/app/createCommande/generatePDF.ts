import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF with autoTable
(jsPDF as any).autoTable = autoTable;

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Function to convert numbers to words (you can integrate a library if needed)
const numberToWords = (num: number) => {
  // Convert the number to words (you can use a library for this)
  // Example: return numInWords;
  return num.toFixed(2); // Placeholder for simplicity
};

// Function to generate the invoice PDF
export const generateInvoicePDF = (
  clientName: string,
  typeDeDatteQuantities: {
    typeDeDatteName: string;
    quantity: number;
    numberDeCoffre: number;
  }[],
  coffres: { id: number; TypeCoffre: string; PoidsCoffre: number }[],
  orderDate: string,
  totalPrice: number,
  unitPrices: number[],
  orderId: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const invoiceNumber = Math.floor(1000 + Math.random() * 9000);
  const client = clientName || "Client Inconnu"; // Fallback for client name
  const currentDate = new Date().toLocaleDateString();

  // Title and address
  doc.setFontSize(16);
  doc.setTextColor(40);

  const companyTitle = "SODEA - Collecte des Dattes";
  const address = "Route de Mornag Km2 Khlédia 2054 Tunis";

  // Header design with a logo (you can include a base64 logo if available)
  doc.setFillColor(200, 200, 255); // Light blue background
  doc.rect(0, 0, pageWidth, 40, "F"); // Full-width header
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(companyTitle, 14, 15);
  doc.setFont("helvetica", "normal");
  doc.text(address, 14, 25);

  // Add Invoice Title
  const title = "Facture de Service - Collecte des Dattes";
  const titleXPosition = pageWidth - doc.getTextWidth(title) - 20;
  doc.setFontSize(16);
  doc.text(title, titleXPosition, 35);

  // Invoice details
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Facture N°: ${invoiceNumber}`, 14, 50);
  doc.text(`Nom agriculteur: ${client}`, 14, 60);
  doc.text(`Date: ${currentDate}`, 14, 70);

  // Table data processing
  const tableData = typeDeDatteQuantities.map((data, index) => {
    const selectedCoffre = coffres[index] || {
      id: "N/A",
      TypeCoffre: "Pas de Coffre",
      PoidsCoffre: 0,
    };
    const unitPrice = unitPrices[index] || 0;

    const brut = data.quantity;
    const net = Math.max(brut - selectedCoffre.PoidsCoffre, 0); // Ensure net is not negative

    return {
      caisseNumber: selectedCoffre.id,
      caisseType: selectedCoffre.TypeCoffre,
      type: data.typeDeDatteName || "Inconnu",
      brut: brut.toFixed(2),
      net: net.toFixed(2),
      pricePerUnit: unitPrice.toFixed(2),
      lineTotal: (net * unitPrice).toFixed(2),
    };
  });

  const totalSum = tableData.reduce(
    (sum, item) => sum + parseFloat(item.lineTotal),
    0
  );

  // Draw table
  autoTable(doc, {
    head: [
      [
        "N° Caisse",
        "Type de Caisse",
        "Type de datte",
        "Quantité Brut (Kg)",
        "Quantité Net (Kg)",
        "Prix Unitaire (TND)",
        "Total (TND)",
      ],
    ],
    body: tableData.map((item) => [
      item.caisseNumber,
      item.caisseType,
      item.type,
      item.brut,
      item.net,
      item.pricePerUnit,
      item.lineTotal,
    ]),
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { top: 80 },
    didDrawPage: (data) => {
      const finalY = data.cursor.y;
      doc.text("Arrêtée la présente facture à la somme de:", 14, finalY + 20);
      doc.text(`Total: ${totalSum.toFixed(2)} TND`, 14, finalY + 30);
      doc.text(
        `Montant en lettres: ${numberToWords(totalSum)} TND`,
        14,
        finalY + 40
      );
    },
  });

  // Add footer with page number
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`Facture_${invoiceNumber}.pdf`);
};
