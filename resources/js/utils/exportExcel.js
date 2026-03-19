import * as XLSX from "xlsx";

export const exportTableToExcel = (tableId, fileName = "export.xlsx") => {
  const table = document.getElementById(tableId);
  if (!table) return alert("Table not found");

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.table_to_sheet(table);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};
