import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportTableToPdf = (tableId, title = "Table Export") => {
  const table = document.getElementById(tableId);
  if (!table) return alert("Table not found");

  const doc = new jsPDF();

  doc.text(title, 14, 15);

  autoTable(doc, {
    html: `#${tableId}`,
    startY: 20,
    theme: "grid",
  });

  doc.save(`${title}.pdf`);
};
