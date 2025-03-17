"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert,
  Badge,
  InputGroup,
  OverlayTrigger,
  Tooltip as BSTooltip,
  Dropdown,
} from "react-bootstrap"
import {
  FileText,
  Trash2,
  Eye,
  Download,
  Plus,
  Share2,
  Printer,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  Image,
} from "react-feather"
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
  const [taxRate, setTaxRate] = useState(15) // Default 15% VAT
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState("pending") // pending, paid, overdue
  const [companyLogo, setCompanyLogo] = useState(null)
  const logoInputRef = useRef(null)

  // Add language state and translations at the top of the component after the existing state variables
  const [language, setLanguage] = useState("ar") // "ar" for Arabic, "en" for English
  const [customerEmail, setCustomerEmail] = useState("")

  // Add translations object after the existing state variables
  const translations = {
    ar: {
      title: "إنشاء الفاتورة",
      invoiceNumber: "رقم الفاتورة",
      currency: "العملة",
      clientName: "اسم العميل",
      clientPhone: "رقم الهاتف",
      clientEmail: "البريد الإلكتروني",
      expiryDate: "تاريخ انتهاء الصلاحية",
      paymentStatus: "حالة الدفع",
      taxRate: "نسبة الضريبة (%)",
      discount: "الخصم",
      companyLogo: "شعار الشركة (للطباعة)",
      notes: "ملاحظات",
      addProducts: "إضافة المنتجات",
      selectProduct: "اختر المنتج",
      productName: "اسم المنتج",
      quantity: "الكمية",
      price: "السعر",
      total: "المجموع",
      subtotal: "المجموع الفرعي",
      tax: "الضريبة",
      totalAmount: "المجموع الكلي",
      preview: "معاينة الفاتورة",
      hidePreview: "إخفاء المعاينة",
      share: "مشاركة",
      print: "طباعة",
      downloadPdf: "تحميل PDF",
      downloadArabic: "تحميل بالعربية",
      downloadEnglish: "تحميل بالإنجليزية",
      generating: "جاري إنشاء الفاتورة...",
      clientDetails: "بيانات العميل",
      invoice: "فاتورة",
      date: "التاريخ",
      status: {
        pending: "قيد الانتظار",
        paid: "مدفوعة",
        overdue: "متأخرة",
      },
      currencies: {
        sar: "ريال سعودي",
        aed: "درهم إماراتي",
        kwd: "دينار كويتي",
        usd: "دولار أمريكي",
        eur: "يورو",
      },
      enterClientName: "أدخل اسم العميل",
      enterClientPhone: "أدخل رقم هاتف العميل",
      enterClientEmail: "أدخل البريد الإلكتروني للعميل",
      enterNotes: "أدخل أي ملاحظات إضافية",
      selectProductPlaceholder: "-- اختر منتجًا --",
      logoUploaded: "تم تحميل الشعار",
      selectLogo: "اختر شعار الشركة",
      remove: "إزالة",
      products: "منتج",
      thankYou: "شكراً لتعاملكم معنا",
      errorClientName: "يرجى إدخال اسم العميل",
      errorProducts: "يرجى إضافة منتجات إلى الفاتورة",
      successMessage: "تم إنشاء الفاتورة بنجاح",
      errorMessage: "حدث خطأ أثناء إنشاء الفاتورة",
      errorSharing: "حدث خطأ أثناء مشاركة الفاتورة",
      sharingNotSupported: "مشاركة الفاتورة غير مدعومة في هذا المتصفح",
      switchToEnglish: "English",
      switchToArabic: "العربية",
    },
    en: {
      title: "Create Invoice",
      invoiceNumber: "Invoice Number",
      currency: "Currency",
      clientName: "Client Name",
      clientPhone: "Phone Number",
      clientEmail: "Email Address",
      expiryDate: "Expiry Date",
      paymentStatus: "Payment Status",
      taxRate: "Tax Rate (%)",
      discount: "Discount",
      companyLogo: "Company Logo (for printing)",
      notes: "Notes",
      addProducts: "Add Products",
      selectProduct: "Select Product",
      productName: "Product Name",
      quantity: "Quantity",
      price: "Price",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax",
      totalAmount: "Total Amount",
      preview: "Preview Invoice",
      hidePreview: "Hide Preview",
      share: "Share",
      print: "Print",
      downloadPdf: "Download PDF",
      downloadArabic: "Download in Arabic",
      downloadEnglish: "Download in English",
      generating: "Generating invoice...",
      clientDetails: "Client Details",
      invoice: "Invoice",
      date: "Date",
      status: {
        pending: "Pending",
        paid: "Paid",
        overdue: "Overdue",
      },
      currencies: {
        sar: "Saudi Riyal",
        aed: "UAE Dirham",
        kwd: "Kuwaiti Dinar",
        usd: "US Dollar",
        eur: "Euro",
      },
      enterClientName: "Enter client name",
      enterClientPhone: "Enter client phone number",
      enterClientEmail: "Enter client email address",
      enterNotes: "Enter any additional notes",
      selectProductPlaceholder: "-- Select a product --",
      logoUploaded: "Logo uploaded",
      selectLogo: "Select company logo",
      remove: "Remove",
      products: "product(s)",
      thankYou: "Thank you for your business",
      errorClientName: "Please enter client name",
      errorProducts: "Please add products to the invoice",
      successMessage: "Invoice created successfully",
      errorMessage: "Error creating invoice",
      errorSharing: "Error sharing invoice",
      sharingNotSupported: "Sharing is not supported in this browser",
      switchToEnglish: "English",
      switchToArabic: "Arabic",
    },
  }

  // Generate a random invoice number on component mount
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear().toString().substr(-2)
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setInvoiceNumber(`INV-${year}${month}-${randomNum}`)
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

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateDiscount = () => {
    return discountAmount > 0 ? discountAmount : (calculateSubtotal() * discountPercent) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const discount = calculateDiscount()
    return subtotal + tax - discount
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyLogo(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Modify the handleSubmit function to include the email
    if (!clientName.trim()) {
      setErrorMessage(language === "ar" ? translations.ar.errorClientName : translations.en.errorClientName)
      return
    }

    if (selectedItems.length === 0) {
      setErrorMessage(language === "ar" ? translations.ar.errorProducts : translations.en.errorProducts)
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
          taxRate,
          discountPercent,
          discountAmount,
          paymentStatus,
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

        // Add company logo if available
        if (companyLogo) {
          doc.addImage(companyLogo, "JPEG", 105, 10, 30, 30, undefined, "FAST")
          doc.setFontSize(22)
          doc.setTextColor(44, 62, 80)
          doc.text("فاتورة", 105, 50, { align: "center" })
        } else {
          // Add header without logo
          doc.setFontSize(22)
          doc.setTextColor(44, 62, 80)
          doc.text("فاتورة", 105, 20, { align: "center" })
        }

        // Add invoice details
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`رقم الفاتورة: ${invoiceNumber}`, 190, 40, { align: "right" })
        doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 190, 50, { align: "right" })

        // Add payment status
        let statusColor
        let statusText
        switch (paymentStatus) {
          case "paid":
            statusColor = [39, 174, 96] // green
            statusText = "مدفوعة"
            break
          case "overdue":
            statusColor = [231, 76, 60] // red
            statusText = "متأخرة"
            break
          default:
            statusColor = [243, 156, 18] // orange
            statusText = "قيد الانتظار"
        }

        doc.setTextColor(...statusColor)
        doc.text(`حالة الدفع: ${statusText}`, 190, 60, { align: "right" })
        doc.setTextColor(0, 0, 0)

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

        // Add total calculations
        const finalY = doc.lastAutoTable.finalY || 120
        let currentY = finalY + 10

        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")

        // Subtotal
        doc.text(`المجموع الفرعي: ${calculateSubtotal().toFixed(2)} ${currency}`, 190, currentY, { align: "right" })
        currentY += 10

        // Tax
        doc.text(`الضريبة (${taxRate}%): ${calculateTax().toFixed(2)} ${currency}`, 190, currentY, { align: "right" })
        currentY += 10

        // Discount
        if (discountAmount > 0 || discountPercent > 0) {
          const discountText =
            discountAmount > 0
              ? `الخصم: ${discountAmount.toFixed(2)} ${currency}`
              : `الخصم (${discountPercent}%): ${calculateDiscount().toFixed(2)} ${currency}`
          doc.text(discountText, 190, currentY, { align: "right" })
          currentY += 10
        }

        // Total
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`المجموع الكلي: ${calculateTotal().toFixed(2)} ${currency}`, 190, currentY, { align: "right" })
        currentY += 20

        // Add notes if any
        if (notes) {
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.text(`ملاحظات: ${notes}`, 190, currentY, { align: "right" })
          currentY += 20
        }

        // Add footer
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("شكراً لتعاملكم معنا", 105, currentY, { align: "center" })

        doc.save(`invoice-${invoiceNumber}.pdf`)
        resolve()
      }, 1000)
    })
  }

  // Add a new function to generate PDF in English
  const generateEnglishPDF = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const doc = new jsPDF()

        // English is LTR
        doc.setR2L(false)

        // Add company logo if available
        if (companyLogo) {
          doc.addImage(companyLogo, "JPEG", 15, 10, 30, 30, undefined, "FAST")
          doc.setFontSize(22)
          doc.setTextColor(44, 62, 80)
          doc.text("INVOICE", 105, 50, { align: "center" })
        } else {
          doc.setFontSize(22)
          doc.setTextColor(44, 62, 80)
          doc.text("INVOICE", 105, 20, { align: "center" })
        }

        // Add invoice details
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`Invoice #: ${invoiceNumber}`, 15, 40)
        doc.text(`Date: ${new Date().toLocaleDateString("en-US")}`, 15, 50)

        // Add payment status
        let statusColor
        let statusText
        switch (paymentStatus) {
          case "paid":
            statusColor = [39, 174, 96] // green
            statusText = "Paid"
            break
          case "overdue":
            statusColor = [231, 76, 60] // red
            statusText = "Overdue"
            break
          default:
            statusColor = [243, 156, 18] // orange
            statusText = "Pending"
        }

        doc.setTextColor(...statusColor)
        doc.text(`Payment Status: ${statusText}`, 15, 60)
        doc.setTextColor(0, 0, 0)

        // Add client details
        doc.text(`Client: ${clientName}`, 15, 70)
        if (clientPhone) doc.text(`Phone: ${clientPhone}`, 15, 80)
        if (customerEmail) doc.text(`Email: ${customerEmail}`, 15, 90)
        if (expiryDate) doc.text(`Expiry Date: ${expiryDate}`, 15, 100)

        // Add items table
        if (typeof doc.autoTable === "function") {
          doc.autoTable({
            startY: 110,
            head: [["Product Name", "Quantity", "Price", "Total"]],
            body: selectedItems.map((item) => [
              item.name,
              item.quantity,
              `${item.price.toFixed(2)} ${currency}`,
              `${(item.price * item.quantity).toFixed(2)} ${currency}`,
            ]),
            theme: "grid",
            headStyles: { fillColor: [41, 128, 185], halign: "left" },
            styles: { font: "helvetica", halign: "left" },
          })
        }

        // Add total calculations
        const finalY = doc.lastAutoTable.finalY || 120
        let currentY = finalY + 10

        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")

        // Subtotal
        doc.text(`Subtotal: ${calculateSubtotal().toFixed(2)} ${currency}`, 150, currentY, { align: "right" })
        currentY += 10

        // Tax
        doc.text(`Tax (${taxRate}%): ${calculateTax().toFixed(2)} ${currency}`, 150, currentY, { align: "right" })
        currentY += 10

        // Discount
        if (discountAmount > 0 || discountPercent > 0) {
          const discountText =
            discountAmount > 0
              ? `Discount: ${discountAmount.toFixed(2)} ${currency}`
              : `Discount (${discountPercent}%): ${calculateDiscount().toFixed(2)} ${currency}`
          doc.text(discountText, 150, currentY, { align: "right" })
          currentY += 10
        }

        // Total
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`Total: ${calculateTotal().toFixed(2)} ${currency}`, 150, currentY, { align: "right" })
        currentY += 20

        // Add notes if any
        if (notes) {
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.text(`Notes: ${notes}`, 15, currentY)
          currentY += 20
        }

        // Add footer
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("Thank you for your business", 105, currentY, { align: "center" })

        doc.save(`invoice-${invoiceNumber}-en.pdf`)
        resolve()
      }, 1000)
    })
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  // Modify the shareInvoice function to include email
  const shareInvoice = async () => {
    if (navigator.share) {
      try {
        // Generate PDF as blob
        const doc = new jsPDF()
        // Add content to PDF (simplified version)
        doc.setR2L(language === "ar")

        if (language === "ar") {
          doc.text(`فاتورة رقم: ${invoiceNumber}`, 105, 20, { align: "center" })
        } else {
          doc.text(`Invoice #: ${invoiceNumber}`, 105, 20, { align: "center" })
        }

        const pdfBlob = doc.output("blob")
        const file = new File([pdfBlob], `invoice-${invoiceNumber}.pdf`, { type: "application/pdf" })

        const shareData = {
          title: language === "ar" ? `فاتورة رقم ${invoiceNumber}` : `Invoice #${invoiceNumber}`,
          text: language === "ar" ? `فاتورة للعميل ${clientName}` : `Invoice for ${clientName}`,
          files: [file],
        }

        // Add email recipient if available
        if (customerEmail) {
          shareData.email = customerEmail
        }

        await navigator.share(shareData)
      } catch (error) {
        console.error("Error sharing invoice:", error)
        setErrorMessage(language === "ar" ? translations.ar.errorSharing : translations.en.errorSharing)
      }
    } else {
      setErrorMessage(language === "ar" ? translations.ar.sharingNotSupported : translations.en.sharingNotSupported)
    }
  }

  // Add a language toggle function
  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar")
    // Update document direction
    document.documentElement.dir = language === "ar" ? "ltr" : "rtl"
  }

  const getPaymentStatusBadge = () => {
    switch (paymentStatus) {
      case "paid":
        return (
          <Badge bg="success">
            مدفوعة <CheckCircle size={12} className="ms-1" />
          </Badge>
        )
      case "overdue":
        return (
          <Badge bg="danger">
            متأخرة <XCircle size={12} className="ms-1" />
          </Badge>
        )
      default:
        return (
          <Badge bg="warning" text="dark">
            قيد الانتظار <Clock size={12} className="ms-1" />
          </Badge>
        )
    }
  }

  return (
    <Card className="shadow-lg p-2 p-md-4 bg-light rounded">
      <Card.Body>
        {/* Find the h3 with the title and replace it with: */}
        <h3 className="text-center text-primary mb-4">
          <FileText size={28} className="me-2" /> {language === "ar" ? translations.ar.title : translations.en.title}
        </h3>
        {/* Add the language toggle button at the top of the form (after the title) */}
        <div className="text-end mb-3">
          <Button variant="outline-secondary" size="sm" onClick={toggleLanguage} className="ms-2">
            {language === "ar" ? translations.ar.switchToEnglish : translations.en.switchToArabic}
          </Button>
        </div>

        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="invoiceNumber">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.invoiceNumber : translations.en.invoiceNumber}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group controlId="currency">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.currency : translations.en.currency}
                </Form.Label>
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
            <Col md={6} className="mb-3">
              <Form.Group controlId="clientName">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.clientName : translations.en.clientName}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={language === "ar" ? translations.ar.enterClientName : translations.en.enterClientName}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group controlId="clientPhone">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.clientPhone : translations.en.clientPhone}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={language === "ar" ? translations.ar.enterClientPhone : translations.en.enterClientPhone}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </Form.Group>
            </Col>
            {/* Add the email field in the client information section (inside the Row with clientName and clientPhone) */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="clientEmail">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.clientEmail : translations.en.clientEmail}
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder={language === "ar" ? translations.ar.enterClientEmail : translations.en.enterClientEmail}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="expiryDate">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.expiryDate : translations.en.expiryDate}
                </Form.Label>
                <Form.Control type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group controlId="paymentStatus">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.paymentStatus : translations.en.paymentStatus}
                </Form.Label>
                <Form.Select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={`${paymentStatus === "paid" ? "border-success" : paymentStatus === "overdue" ? "border-danger" : "border-warning"}`}
                >
                  <option value="pending">
                    {language === "ar" ? translations.ar.status.pending : translations.en.status.pending}
                  </option>
                  <option value="paid">
                    {language === "ar" ? translations.ar.status.paid : translations.en.status.paid}
                  </option>
                  <option value="overdue">
                    {language === "ar" ? translations.ar.status.overdue : translations.en.status.overdue}
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="taxRate">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.taxRate : translations.en.taxRate}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                  />
                  <InputGroup.Text>
                    <Percent size={16} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group controlId="discount">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.discount : translations.en.discount}
                </Form.Label>
                <Row>
                  <Col xs={6}>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        placeholder="نسبة %"
                        value={discountPercent}
                        onChange={(e) => {
                          setDiscountPercent(Number.parseFloat(e.target.value) || 0)
                          setDiscountAmount(0) // Reset amount when percent changes
                        }}
                      />
                      <InputGroup.Text>
                        <Percent size={16} />
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col xs={6}>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="مبلغ"
                        value={discountAmount}
                        onChange={(e) => {
                          setDiscountAmount(Number.parseFloat(e.target.value) || 0)
                          setDiscountPercent(0) // Reset percent when amount changes
                        }}
                      />
                      <InputGroup.Text>
                        <DollarSign size={16} />
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="companyLogo">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.companyLogo : translations.en.companyLogo}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />
                  <Form.Control
                    readOnly
                    placeholder={
                      companyLogo
                        ? language === "ar"
                          ? translations.ar.logoUploaded
                          : translations.en.logoUploaded
                        : language === "ar"
                          ? translations.ar.selectLogo
                          : translations.en.selectLogo
                    }
                    value={
                      companyLogo
                        ? language === "ar"
                          ? translations.ar.logoUploaded
                          : translations.en.logoUploaded
                        : ""
                    }
                    onClick={() => logoInputRef.current.click()}
                    style={{ cursor: "pointer" }}
                  />
                  <Button variant="outline-secondary" onClick={() => logoInputRef.current.click()}>
                    <Image size={18} />
                  </Button>
                </InputGroup>
                {companyLogo && (
                  <div className="mt-2 text-center">
                    <img
                      src={companyLogo || "/placeholder.svg"}
                      alt="شعار الشركة"
                      style={{ maxHeight: "50px", maxWidth: "200px" }}
                      className="border p-1"
                    />
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger d-block mx-auto"
                      onClick={() => setCompanyLogo(null)}
                    >
                      {language === "ar" ? translations.ar.remove : translations.en.remove}
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="notes" className="mb-3">
            <Form.Label className="fw-bold">
              {language === "ar" ? translations.ar.notes : translations.en.notes}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={language === "ar" ? translations.ar.enterNotes : translations.en.enterNotes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {language === "ar" ? translations.ar.addProducts : translations.en.addProducts}
                </h5>
                <Badge bg="light" text="dark">
                  {selectedItems.length} {language === "ar" ? translations.ar.products : translations.en.products}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Form.Group controlId="productSelect" className="mb-3">
                <Form.Label className="fw-bold">
                  {language === "ar" ? translations.ar.selectProduct : translations.en.selectProduct}
                </Form.Label>
                <div className="d-flex">
                  <Form.Select onChange={handleSelectProduct} className="me-2">
                    <option value="">
                      {language === "ar"
                        ? translations.ar.selectProductPlaceholder
                        : translations.en.selectProductPlaceholder}
                    </option>
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
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>{language === "ar" ? translations.ar.productName : translations.en.productName}</th>
                        <th>{language === "ar" ? translations.ar.quantity : translations.en.quantity}</th>
                        <th>{language === "ar" ? translations.ar.price : translations.en.price}</th>
                        <th>{language === "ar" ? translations.ar.total : translations.en.total}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td style={{ width: "100px" }}>
                            <Form.Control
                              type="number"
                              size="sm"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleChange(e, index, "quantity")}
                              required
                            />
                          </td>
                          <td>
                            {item.price} {currency}
                          </td>
                          <td>
                            {(item.price * item.quantity).toFixed(2)} {currency}
                          </td>
                          <td>
                            <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="card mt-3 bg-light">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-2">
                            <span>
                              {language === "ar" ? translations.ar.paymentStatus : translations.en.paymentStatus}:{" "}
                            </span>
                            {getPaymentStatusBadge()}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex flex-column align-items-end">
                            <div className="mb-1">
                              <span className="fw-bold">
                                {language === "ar" ? translations.ar.subtotal : translations.en.subtotal}:
                              </span>
                              <span className="ms-2">
                                {calculateSubtotal().toFixed(2)} {currency}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="fw-bold">
                                {language === "ar" ? translations.ar.tax : translations.en.tax} ({taxRate}%):
                              </span>
                              <span className="ms-2">
                                {calculateTax().toFixed(2)} {currency}
                              </span>
                            </div>
                            {(discountAmount > 0 || discountPercent > 0) && (
                              <div className="mb-1 text-danger">
                                <span className="fw-bold">
                                  {language === "ar" ? translations.ar.discount : translations.en.discount}
                                  {discountPercent > 0 ? ` (${discountPercent}%)` : ""}:
                                </span>
                                <span className="ms-2">
                                  - {calculateDiscount().toFixed(2)} {currency}
                                </span>
                              </div>
                            )}
                            <div className="mt-2 border-top pt-2">
                              <span className="fw-bold fs-5">
                                {language === "ar" ? translations.ar.totalAmount : translations.en.totalAmount}:
                              </span>
                              <span className="ms-2 fs-5 text-primary">
                                {calculateTotal().toFixed(2)} {currency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {showPreview && selectedItems.length > 0 && (
            <Card className="mb-4 border-info">
              <Card.Header className="bg-info text-white">
                {language === "ar" ? translations.ar.preview : translations.en.preview}{" "}
                {language === "ar" ? translations.ar.invoice : translations.en.invoice}
              </Card.Header>
              <Card.Body>
                <div className="invoice-preview">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h4>{language === "ar" ? translations.ar.invoice : translations.en.invoice}</h4>
                      <p className="text-muted mb-1">
                        {language === "ar" ? translations.ar.invoiceNumber : translations.en.invoiceNumber}:{" "}
                        {invoiceNumber}
                      </p>
                      <p className="text-muted mb-1">
                        {language === "ar" ? translations.ar.date : translations.en.date}:{" "}
                        {new Date().toLocaleDateString("ar-SA")}
                      </p>
                      <div>{getPaymentStatusBadge()}</div>
                    </div>
                    {companyLogo && (
                      <div>
                        <img
                          src={companyLogo || "/placeholder.svg"}
                          alt="شعار الشركة"
                          style={{ maxHeight: "70px", maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </div>

                  <Row className="mb-4">
                    <Col md={6}>
                      <h6 className="fw-bold">
                        {language === "ar" ? translations.ar.clientDetails : translations.en.clientDetails}:
                      </h6>
                      <p className="mb-1">
                        {language === "ar" ? translations.ar.clientName : translations.en.clientName}: {clientName}
                      </p>
                      {clientPhone && (
                        <p className="mb-1">
                          {language === "ar" ? translations.ar.clientPhone : translations.en.clientPhone}: {clientPhone}
                        </p>
                      )}
                      {customerEmail && (
                        <p className="mb-1">
                          {language === "ar" ? translations.ar.clientEmail : translations.en.clientEmail}:{" "}
                          {customerEmail}
                        </p>
                      )}
                    </Col>
                    <Col md={6}>
                      {expiryDate && (
                        <p className="mb-1">
                          {language === "ar" ? translations.ar.expiryDate : translations.en.expiryDate}: {expiryDate}
                        </p>
                      )}
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead className="table-primary">
                        <tr>
                          <th>{language === "ar" ? translations.ar.productName : translations.en.productName}</th>
                          <th>{language === "ar" ? translations.ar.quantity : translations.en.quantity}</th>
                          <th>{language === "ar" ? translations.ar.price : translations.en.price}</th>
                          <th>{language === "ar" ? translations.ar.total : translations.en.total}</th>
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
                    </table>
                  </div>

                  <Row className="mt-4">
                    <Col md={6}>
                      {notes && (
                        <div>
                          <h6 className="fw-bold">
                            {language === "ar" ? translations.ar.notes : translations.en.notes}:
                          </h6>
                          <p>{notes}</p>
                        </div>
                      )}
                    </Col>
                    <Col md={6}>
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span>{language === "ar" ? translations.ar.subtotal : translations.en.subtotal}:</span>
                          <span>
                            {calculateSubtotal().toFixed(2)} {currency}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>
                            {language === "ar" ? translations.ar.tax : translations.en.tax} ({taxRate}%):
                          </span>
                          <span>
                            {calculateTax().toFixed(2)} {currency}
                          </span>
                        </div>
                        {(discountAmount > 0 || discountPercent > 0) && (
                          <div className="d-flex justify-content-between mb-2 text-danger">
                            <span>
                              {language === "ar" ? translations.ar.discount : translations.en.discount}
                              {discountPercent > 0 ? ` (${discountPercent}%)` : ""}:
                            </span>
                            <span>
                              - {calculateDiscount().toFixed(2)} {currency}
                            </span>
                          </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>{language === "ar" ? translations.ar.totalAmount : translations.en.totalAmount}:</span>
                          <span>
                            {calculateTotal().toFixed(2)} {currency}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Find the div with the buttons at the bottom and replace it with: */}
          <div className="d-flex flex-wrap justify-content-between mt-4">
            <div className="d-flex gap-2 mb-3 mb-md-0">
              <Button variant="outline-info" type="button" onClick={togglePreview}>
                <Eye size={18} className="me-1" />{" "}
                {language === "ar"
                  ? showPreview
                    ? translations.ar.hidePreview
                    : translations.ar.preview
                  : showPreview
                    ? translations.en.hidePreview
                    : translations.en.preview}
              </Button>

              <OverlayTrigger
                placement="top"
                overlay={<BSTooltip>{language === "ar" ? translations.ar.share : translations.en.share}</BSTooltip>}
              >
                <Button variant="outline-primary" type="button" onClick={shareInvoice}>
                  <Share2 size={18} className="me-1" />{" "}
                  {language === "ar" ? translations.ar.share : translations.en.share}
                </Button>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<BSTooltip>{language === "ar" ? translations.ar.print : translations.en.print}</BSTooltip>}
              >
                <Button variant="outline-secondary" type="button" onClick={() => window.print()}>
                  <Printer size={18} className="me-1" />{" "}
                  {language === "ar" ? translations.ar.print : translations.en.print}
                </Button>
              </OverlayTrigger>
            </div>

            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-download">
                <Download size={18} className="me-1" />{" "}
                {language === "ar" ? translations.ar.downloadPdf : translations.en.downloadPdf}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => generatePDF(clientName, selectedItems, expiryDate, notes)}>
                  {language === "ar" ? translations.ar.downloadArabic : translations.en.downloadArabic}
                </Dropdown.Item>
                <Dropdown.Item onClick={generateEnglishPDF}>
                  {language === "ar" ? translations.ar.downloadEnglish : translations.en.downloadEnglish}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default InvoiceForm

