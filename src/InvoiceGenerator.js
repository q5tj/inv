import React from "react";
import { Table, Button, Card } from "react-bootstrap";
import { FileText, Download } from "react-feather";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const InvoiceGenerator = ({ clientName, items, invoiceDate, expiryDate, notes }) => {
  // حساب المجموع الإجمالي للفاتورة
  const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2);

  // دالة لتوليد PDF للفاتورة
  const generatePDF = () => {
    const doc = new jsPDF();

    // تعيين الخط الافتراضي: قد تحتاج إلى إضافة خطوط عربية محلية إن لم تكن متاحة
    doc.setFont("helvetica", "normal");  // يمكنك تغيير الخط هنا إذا لزم الأمر

    // كتابة العنوان
    doc.text("فاتورة إلكترونية", 80, 10);
    doc.setFontSize(12);
    doc.text(`اسم العميل: ${clientName}`, 10, 20);
    doc.text(`تاريخ الفاتورة: ${invoiceDate}`, 10, 30);
    doc.text(`تاريخ الصلاحية: ${expiryDate}`, 10, 40);

    // إعداد الأعمدة والصفوف للجدول
    const tableColumn = ["المنتج", "الكمية", "السعر", "الإجمالي"];
    const tableRows = items.map((item) => [
      item.name,
      item.quantity,
      `${item.price} ريال`,
      `${(item.quantity * item.price).toFixed(2)} ريال`,
    ]);

    // إضافة المجموع الإجمالي
    tableRows.push(["", "", "المجموع الكلي", `${totalAmount} ريال`]);

    // إضافة جدول باستخدام autoTable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { font: "arial", halign: "right" }, // جعل النصوص محاذاة لليمين
      columnStyles: { 3: { fontStyle: "bold" } }, // جعل العمود الأخير غامق
    });

    // إضافة الملاحظات إذا وجدت
    if (notes) {
      doc.text("ملاحظات:", 10, doc.lastAutoTable.finalY + 10);
      doc.text(notes, 10, doc.lastAutoTable.finalY + 20);
    }

    // حفظ الفاتورة كملف PDF
    doc.save(`فاتورة_${clientName}.pdf`);
  };

  return (
    <Card className="shadow-lg p-4 bg-white rounded">
      <Card.Body>
        <h3 className="text-center text-primary mb-4">
          <FileText size={28} className="me-2" />
          تفاصيل الفاتورة
        </h3>

        <h5 className="text-secondary mb-3">اسم العميل: {clientName}</h5>
        <h6 className="text-muted">تاريخ الفاتورة: {invoiceDate}</h6>
        <h6 className="text-muted">تاريخ الانتهاء: {expiryDate}</h6>
        {notes && <p className="mt-3"><strong>ملاحظات:</strong> {notes}</p>}

        {/* عرض جدول المنتجات */}
        <Table striped bordered hover responsive className="mt-3 text-center">
          <thead className="bg-dark text-white">
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price} ريال</td>
                <td>{(item.quantity * item.price).toFixed(2)} ريال</td>
              </tr>
            ))}
            {/* عرض المجموع الإجمالي */}
            <tr className="fw-bold bg-light">
              <td colSpan="3">المجموع الكلي</td>
              <td>{totalAmount} ريال</td>
            </tr>
          </tbody>
        </Table>

        {/* زر تحميل الفاتورة كـ PDF */}
        <div className="text-center mt-4">
          <Button variant="success" onClick={generatePDF}>
            <Download size={18} className="me-1" />
            تحميل الفاتورة كـ PDF
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InvoiceGenerator;
