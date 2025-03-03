import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Card, Alert } from "react-bootstrap";
import { FileText } from "react-feather";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./App.css";

const InvoiceForm = ({ onGenerateInvoice }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialProducts = location.state?.products || [];
  const [clientName, setClientName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSelectProduct = (e) => {
    const selectedProductName = e.target.value;
    if (!selectedProductName) return;

    const product = initialProducts.find((p) => p.name === selectedProductName);
    if (product) {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
  };

  const handleChange = (e, index, field) => {
    const updatedItems = [...selectedItems];
    updatedItems[index][field] = e.target.value;
    setSelectedItems(updatedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setErrorMessage("يرجى إدخال اسم العميل");
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage("يرجى إضافة منتجات إلى الفاتورة");
      return;
    }

    setErrorMessage(null);
    onGenerateInvoice(clientName, selectedItems, expiryDate, notes);
    navigate("/invoice-generator", { state: { clientName, selectedItems, expiryDate, notes } });
    generatePDF(clientName, selectedItems, expiryDate, notes);
  };

  const generatePDF = (clientName, selectedItems, expiryDate, notes) => {
    const doc = new jsPDF();
    doc.text("فاتورة", 20, 20);
    doc.text(`اسم العميل: ${clientName}`, 20, 30);
    if (expiryDate) doc.text(`تاريخ الصلاحية: ${expiryDate}`, 20, 40);
    if (notes) doc.text(`ملاحظات: ${notes}`, 20, 50);

    if (typeof doc.autoTable === "function") {
      doc.autoTable({
        startY: 60,
        head: [["اسم المنتج", "الكمية", "السعر"]],
        body: selectedItems.map(item => [item.name, item.quantity, item.price]),
      });
    }
    doc.save("invoice.pdf");
  };

  return (
    <Card className="shadow-lg p-4 bg-light rounded">
      <Card.Body>
        <h3 className="text-center text-primary mb-4">
          <FileText size={28} className="me-2" /> إنشاء الفاتورة
        </h3>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="clientName" className="mb-3">
            <Form.Label className="fw-bold">اسم العميل</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل اسم العميل"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="expiryDate" className="mb-3">
            <Form.Label className="fw-bold">تاريخ انتهاء الصلاحية</Form.Label>
            <Form.Control
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="notes" className="mb-3">
            <Form.Label className="fw-bold">ملاحظات</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="أدخل أي ملاحظات إضافية"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="productSelect" className="mb-3">
            <Form.Label className="fw-bold">اختر المنتج</Form.Label>
            <Form.Select onChange={handleSelectProduct}>
              <option value="">-- اختر منتجًا --</option>
              {initialProducts.map((product, index) => (
                <option key={index} value={product.name}>
                  {product.name} - {product.price} ريال
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedItems.length > 0 && (
            <div>
              <h5 className="text-secondary mb-3">المنتجات المختارة:</h5>
              {selectedItems.map((item, index) => (
                <Row key={index} className="mb-3 g-2">
                  <Col md={5}>
                    <Form.Control type="text" value={item.name} readOnly />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      placeholder="الكمية"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleChange(e, index, "quantity")}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control type="text" value={`${item.price} ريال`} readOnly />
                  </Col>
                </Row>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-between mt-3">
            <Button variant="success" type="submit">
              إنشاء الفاتورة
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InvoiceForm;
