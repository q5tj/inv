import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import InvoiceForm from './InvoiceForm'; // استيراد نموذج الفاتورة
import InvoiceGenerator from './InvoiceGenerator'; // استيراد مولد الفاتورة
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const App = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [products, setProducts] = useState([]);

  // جلب المنتجات من Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      }
    };
    fetchProducts();
  }, []);

  // وظيفة لتوليد الفاتورة
  const handleGenerateInvoice = (clientName, selectedItems) => {
    console.log("تم توليد الفاتورة:", { clientName, selectedItems });
    setInvoiceData({ clientName, items: selectedItems });
  };

  return (
    <Router>
      <div className="container-fluid">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <NavLink className="navbar-brand" to="/invoice">تطبيق الفواتير</NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">تسجيل الدخول</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">لوحة التحكم</NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="hero-section text-center mt-5 mb-4">
          <h1 className="display-4 fw-bold text-primary">مرحبًا بك في تطبيق الفواتير</h1>
          <p className="lead text-muted">ابدأ في إنشاء الفواتير الإلكترونية بسهولة وسرعة.</p>
          <NavLink to="/login" className="btn btn-lg btn-success mt-3">ابدأ الآن</NavLink>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/invoice"
            element={<InvoiceForm onGenerateInvoice={handleGenerateInvoice} products={products} />}
          />
          <Route
            path="/invoice-generator"
            element={
              invoiceData ? (
                <InvoiceGenerator {...invoiceData} />
              ) : (
                <div className="text-center text-danger mt-4">لا يوجد بيانات فاتورة حالياً.</div>
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
