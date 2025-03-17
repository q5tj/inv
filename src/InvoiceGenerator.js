// import { Table, Button, Card, Row, Col, Container } from "react-bootstrap"
// import { FileText, Download, Printer } from "react-feather"
// import { jsPDF } from "jspdf"
// import autoTable from "jspdf-autotable"

// function InvoiceGenerator({
//   clientName = "",
//   items = [],
//   invoiceDate = "",
//   expiryDate = "",
//   notes = "",
//   invoiceNumber = "001",
// }) {
//   // حساب المجموع الإجمالي للفاتورة
//   const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)

//   // دالة لتوليد PDF للفاتورة
//   const generatePDF = () => {
//     try {
//       // إنشاء مستند PDF جديد
//       const doc = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       })

//       // تعيين الخط الافتراضي
//       doc.setFont("helvetica", "normal")

//       // إضافة عنوان الفاتورة
//       doc.setFontSize(22)
//       doc.text("فاتورة إلكترونية", doc.internal.pageSize.width / 2, 15, { align: "center" })

//       // إضافة معلومات الفاتورة
//       doc.setFontSize(12)
//       doc.text(`رقم الفاتورة: ${invoiceNumber}`, 20, 30)
//       doc.text(`اسم العميل: ${clientName}`, 20, 40)
//       doc.text(`تاريخ الفاتورة: ${invoiceDate}`, 20, 50)
//       doc.text(`تاريخ الصلاحية: ${expiryDate}`, 20, 60)

//       // إعداد الأعمدة والصفوف للجدول - ترتيب معكوس للعربية
//       const tableColumn = ["الإجمالي", "السعر", "الكمية", "المنتج"]
//       const tableRows = items.map((item) => [
//         `${(item.quantity * item.price).toFixed(2)} ريال`,
//         `${item.price} ريال`,
//         item.quantity,
//         item.name,
//       ])

//       // إضافة جدول باستخدام autoTable
//       autoTable(doc, {
//         head: [tableColumn],
//         body: tableRows,
//         startY: 70,
//         styles: {
//           halign: "right",
//           font: "helvetica",
//           fontSize: 10,
//         },
//         headStyles: {
//           fillColor: [41, 50, 65],
//           textColor: [255, 255, 255],
//           fontStyle: "bold",
//         },
//         columnStyles: {
//           0: { fontStyle: "bold" },
//         },
//         margin: { right: 15, left: 15 },
//       })

//       // إضافة المجموع الإجمالي
//       const finalY = (doc.lastAutoTable?.finalY || 120) + 10
//       doc.setFontSize(14)
//       doc.setFont("helvetica", "bold")
//       doc.text(`المجموع الكلي: ${totalAmount} ريال`, doc.internal.pageSize.width - 20, finalY, { align: "right" })

//       // إضافة الملاحظات إذا وجدت
//       if (notes) {
//         doc.setFontSize(12)
//         doc.setFont("helvetica", "normal")
//         doc.text("ملاحظات:", 20, finalY + 15)

//         // تقسيم الملاحظات إلى أسطر إذا كانت طويلة
//         const splitNotes = doc.splitTextToSize(notes, 170)
//         doc.text(splitNotes, 20, finalY + 25)
//       }

//       // إضافة تذييل الصفحة
//       doc.setFontSize(10)
//       doc.setFont("helvetica", "italic")
//       const currentDate = new Date().toLocaleDateString("ar-SA")
//       doc.text(
//         `تم إنشاء هذه الفاتورة بتاريخ ${currentDate}`,
//         doc.internal.pageSize.width / 2,
//         doc.internal.pageSize.height - 10,
//         { align: "center" },
//       )

//       // حفظ الفاتورة كملف PDF
//       doc.save(`فاتورة_${clientName}_${invoiceNumber}.pdf`)
//     } catch (error) {
//       console.error("Error generating PDF:", error)
//       alert("حدث خطأ أثناء إنشاء ملف PDF")
//     }
//   }

//   // دالة للطباعة المباشرة
//   const handlePrint = () => {
//     window.print()
//   }

//   return (
//     <Container className="invoice-container" dir="rtl">
//       <Card className="shadow-lg p-4 bg-white rounded my-4 invoice-card">
//         <Card.Body>
//           <Row className="mb-4">
//             <Col>
//               <h3 className="text-center text-primary mb-4 d-flex align-items-center justify-content-center">
//                 <FileText size={28} className="me-2" />
//                 فاتورة إلكترونية
//               </h3>
//             </Col>
//           </Row>

//           <Row className="mb-4">
//             <Col md={6}>
//               <div className="client-info">
//                 <h5 className="text-secondary mb-3">معلومات العميل</h5>
//                 <p className="mb-1">
//                   <strong>الاسم:</strong> {clientName}
//                 </p>
//                 <p className="mb-1">
//                   <strong>رقم الفاتورة:</strong> {invoiceNumber}
//                 </p>
//                 <p className="mb-1">
//                   <strong>تاريخ الفاتورة:</strong> {invoiceDate}
//                 </p>
//                 <p className="mb-1">
//                   <strong>تاريخ الانتهاء:</strong> {expiryDate}
//                 </p>
//               </div>
//             </Col>
//             <Col md={6} className="text-md-end d-print-none">
//               <div className="invoice-actions mt-3 mt-md-0">
//                 <Button variant="outline-primary" className="me-2" onClick={handlePrint}>
//                   <Printer size={16} className="me-1" />
//                   طباعة
//                 </Button>
//                 <Button variant="success" onClick={generatePDF}>
//                   <Download size={16} className="me-1" />
//                   تحميل PDF
//                 </Button>
//               </div>
//             </Col>
//           </Row>

//           {/* عرض جدول المنتجات */}
//           <Table striped bordered hover responsive className="mt-4 text-center invoice-table">
//             <thead className="bg-dark text-white">
//               <tr>
//                 <th>المنتج</th>
//                 <th>الكمية</th>
//                 <th>السعر</th>
//                 <th>الإجمالي</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, index) => (
//                 <tr key={index}>
//                   <td>{item.name}</td>
//                   <td>{item.quantity}</td>
//                   <td>{item.price.toFixed(2)} ريال</td>
//                   <td>{(item.quantity * item.price).toFixed(2)} ريال</td>
//                 </tr>
//               ))}
//               {/* عرض المجموع الإجمالي */}
//               <tr className="fw-bold bg-light">
//                 <td colSpan="3" className="text-end">
//                   المجموع الكلي
//                 </td>
//                 <td>{totalAmount} ريال</td>
//               </tr>
//             </tbody>
//           </Table>

//           {/* عرض الملاحظات إذا وجدت */}
//           {notes && (
//             <div className="mt-4 p-3 bg-light rounded">
//               <h6 className="mb-2">
//                 <strong>ملاحظات:</strong>
//               </h6>
//               <p className="mb-0 notes-text" style={{ whiteSpace: "pre-line" }}>
//                 {notes}
//               </p>
//             </div>
//           )}
//         </Card.Body>
//       </Card>
//     </Container>
//   )
// }

// // تعريف القيم الافتراضية للخصائص
// InvoiceGenerator.defaultProps = {
//   clientName: "",
//   items: [],
//   invoiceDate: "",
//   expiryDate: "",
//   notes: "",
//   invoiceNumber: "001",
// }

// export default InvoiceGenerator
