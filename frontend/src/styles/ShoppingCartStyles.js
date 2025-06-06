export const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "30px auto",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    fontSize: "24px",
    marginTop: "20px",
    marginBottom: "20px",
    color: "#6b7280",
  },
  highlight: {
    color: "#374151",
    fontWeight: "bold",
  },
  emptyCart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "40px 0",
  },
  emptyCartText: {
    color: "#6b7280",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  table: {
    tableLayout: "fixed",
    width: "100%",
  },
  tableHeader: {
    fontWeight: "normal",
    padding: "15px",
    borderBottom: "2px solid #e5e7eb",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
  },
  productName: {
    fontSize: "16px",
    color: "#374151",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 10px",
    justifyContent: "center",
  },
  quantityBtn: {
    color: "#000",
    fontSize: "16px",
    fontWeight: "normal",
    borderRadius: "6px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#f3f4f6",
    "&:hover": {
      backgroundColor: "#e5e7eb",
    },
  },
  quantityInput: {
    width: "35px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "5px",
    fontSize: "14px",
    padding: "5px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  actionBtn: {
    color: "#6c63ff",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    "&:hover": {
      color: "#5a52d4",
      backgroundColor: "transparent",
    },
  },
  totalBox: {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "20px",
    border: "1px solid #e5e7eb",
  },
  totalLabel: {
    color: "#6b7280",
  },
  totalAmount: {
    color: "#374151",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "15px",
  },
  continueBtn: {
    background: "transparent",
    color: "#6c63ff",
    fontWeight: "600",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    border: "2px solid #6c63ff",
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  },
  checkoutBtn: {
    background: "#6c63ff",
    color: "#fff",
    fontWeight: "600",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#5a52d4",
    },
  },
}; 