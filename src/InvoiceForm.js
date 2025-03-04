"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Form, Row, Col, Card, Alert, Badge, Spinner } from "react-bootstrap"
import { FileText, Trash2, Eye, Download, Plus } from "react-feather"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import "./App.css"

const InvoiceForm = ({ onGenerateInvoice }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const initialProducts = location.state?.products || []
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currency, setCurrency] = useState("ريال")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // Generate a random invoice number on component mount
  useEffect(() => {
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    setInvoiceNumber(`INV-${randomNum}`)
  }, [])

  const handleSelectProduct = (e) => {
    const selectedProductName = e.target.value
    if (!selectedProductName) return

    const product = initialProducts.find((p) => p.name === selectedProductName)
    if (product) {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }])
    }
  }

  const handleChange = (e, index, field) => {
    const updatedItems = [...selectedItems]
    updatedItems[index][field] = field === "quantity" ? Number.parseInt(e.target.value, 10) || 1 : e.target.value
    setSelectedItems(updatedItems)
  }

  const handleRemoveItem = (index) => {
    const updatedItems = [...selectedItems]
    updatedItems.splice(index, 1)
    setSelectedItems(updatedItems)
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!clientName.trim()) {
      setErrorMessage("يرجى إدخال اسم العميل")
      return
    }

    if (selectedItems.length === 0) {
      setErrorMessage("يرجى إضافة منتجات إلى الفاتورة")
      return
    }

    setErrorMessage(null)
    setIsGenerating(true)

    try {
      await generatePDF(clientName, selectedItems, expiryDate, notes)
      setSuccessMessage("تم إنشاء الفاتورة بنجاح")
      onGenerateInvoice(clientName, selectedItems, expiryDate, notes)
      navigate("/invoice-generator", {
        state: {
          clientName,
          clientPhone,
          selectedItems,
          expiryDate,
          notes,
          invoiceNumber,
          currency,
          total: calculateTotal(),
        },
      })
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء إنشاء الفاتورة")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDF = async (clientName, selectedItems, expiryDate, notes) => {
    return new Promise((resolve) => {
      // Add a small delay to show the loading state
      setTimeout(() => {
        const doc = new jsPDF()

        // Add RTL support
        doc.setR2L(true)

        // Add company logo/header
        doc.setFontSize(22)
        doc.setTextColor(44, 62, 80)
        doc.text("فاتورة", 105, 20, { align: "center" })

        // Add invoice details
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`رقم الفاتورة: ${invoiceNumber}`, 190, 40, { align: "right" })
        doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 190, 50, { align: "right" })

        // Add client details
        doc.text(`اسم العميل: ${clientName}`, 190, 70, { align: "right" })
        if (clientPhone) doc.text(`رقم الهاتف: ${clientPhone}`, 190, 80, { align: "right" })
        if (expiryDate) doc.text(`تاريخ الصلاحية: ${expiryDate}`, 190, 90, { align: "right" })

        // Add items table
        if (typeof doc.autoTable === "function") {
          doc.autoTable({
            startY: 100,
            head: [["السعر الإجمالي", "السعر", "الكمية", "اسم المنتج"]],
            body: selectedItems.map((item) => [
              `${(item.price * item.quantity).toFixed(2)} ${currency}`,
              `${item.price.toFixed(2)} ${currency}`,
              item.quantity,
              item.name,
            ]),
            theme: "grid",
            headStyles: { fillColor: [41, 128, 185], halign: "center" },
            styles: { font: "helvetica", halign: "right" },
          })
        }

        // Add total
        const finalY = doc.lastAutoTable.finalY || 120
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`المجموع الكلي: ${calculateTotal().toFixed(2)} ${currency}`, 190, finalY + 20, { align: "right" })

        // Add notes if any
        if (notes) {
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.text(`ملاحظات: ${notes}`, 190, finalY + 40, { align: "right" })
        }

        // Add footer
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("شكراً لتعاملكم معنا", 105, finalY + 60, { align: "center" })

        doc.save(`invoice-${invoiceNumber}.pdf`)
        resolve()
      }, 1000)
    })
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <Card className="shadow-lg p-4 bg-light rounded">
      <Card.Body>
        <h3 className="text-center text-primary mb-4">
          <FileText size={28} className="me-2" /> إنشاء الفاتورة
        </h3>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="invoiceNumber" className="mb-3">
                <Form.Label className="fw-bold">رقم الفاتورة</Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="currency" className="mb-3">
                <Form.Label className="fw-bold">العملة</Form.Label>
                <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="ريال">ريال سعودي</option>
                  <option value="درهم">درهم إماراتي</option>
                  <option value="دينار">دينار كويتي</option>
                  <option value="دولار">دولار أمريكي</option>
                  <option value="يورو">يورو</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <Form.Group controlId="clientPhone" className="mb-3">
                <Form.Label className="fw-bold">رقم الهاتف</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="أدخل رقم هاتف العميل"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="expiryDate" className="mb-3">
            <Form.Label className="fw-bold">تاريخ انتهاء الصلاحية</Form.Label>
            <Form.Control type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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

          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">إضافة المنتجات</h5>
                <Badge bg="light" text="dark">
                  {selectedItems.length} منتج
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group controlId="productSelect" className="mb-3">
                <Form.Label className="fw-bold">اختر المنتج</Form.Label>
                <div className="d-flex">
                  <Form.Select onChange={handleSelectProduct} className="me-2">
                    <option value="">-- اختر منتجًا --</option>
                    {initialProducts.map((product, index) => (
                      <option key={index} value={product.name}>
                        {product.name} - {product.price} {currency}
                      </option>
                    ))}
                  </Form.Select>
                  <Button variant="outline-primary">
                    <Plus size={18} />
                  </Button>
                </div>
              </Form.Group>

              {selectedItems.length > 0 && (
                <div>
                  <h5 className="text-secondary mb-3">المنتجات المختارة:</h5>
                  {selectedItems.map((item, index) => (
                    <Row key={index} className="mb-3 g-2 align-items-center">
                      <Col md={5}>
                        <Form.Control type="text" value={item.name} readOnly />
                      </Col>
                      <Col md={2}>
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
                        <Form.Control type="text" value={`${item.price} ${currency}`} readOnly />
                      </Col>
                      <Col md={2} className="text-end">
                        <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)}>
                          <Trash2 size={16} />
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-4 p-3 bg-light rounded">
                    <h5 className="mb-0">المجموع الكلي:</h5>
                    <h4 className="mb-0 text-primary">
                      {calculateTotal().toFixed(2)} {currency}
                    </h4>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {showPreview && selectedItems.length > 0 && (
            <Card className="mb-4 border-info">
              <Card.Header className="bg-info text-white">معاينة الفاتورة</Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6}>
                    <p>
                      <strong>رقم الفاتورة:</strong> {invoiceNumber}
                    </p>
                    <p>
                      <strong>اسم العميل:</strong> {clientName}
                    </p>
                    {clientPhone && (
                      <p>
                        <strong>رقم الهاتف:</strong> {clientPhone}
                      </p>
                    )}
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>التاريخ:</strong> {new Date().toLocaleDateString("ar-SA")}
                    </p>
                    {expiryDate && (
                      <p>
                        <strong>تاريخ الصلاحية:</strong> {expiryDate}
                      </p>
                    )}
                  </Col>
                </Row>

                <table className="table table-bordered table-striped">
                  <thead className="table-primary">
                    <tr>
                      <th>اسم المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.price} {currency}
                        </td>
                        <td>
                          {(item.price * item.quantity).toFixed(2)} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>المجموع الكلي:</strong>
                      </td>
                      <td>
                        <strong>
                          {calculateTotal().toFixed(2)} {currency}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {notes && (
                  <div className="mt-3">
                    <strong>ملاحظات:</strong>
                    <p>{notes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-info" type="button" onClick={togglePreview}>
              <Eye size={18} className="me-1" /> {showPreview ? "إخفاء المعاينة" : "معاينة الفاتورة"}
            </Button>

            <Button variant="success" type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  جاري إنشاء الفاتورة...
                </>
              ) : (
                <>
                  <Download size={18} className="me-1" /> إنشاء الفاتورة
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default InvoiceForm
