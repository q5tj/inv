import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // استيراد التهيئة الصحيحة لـ Firebase
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import { Lock, Mail } from "react-feather";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // لاستخدام التوجيه بعد تسجيل الدخول

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("تم تسجيل الدخول بنجاح!");
      navigate("/dashboard"); // توجيه المستخدم إلى الداشبورد بعد تسجيل الدخول
    } catch (err) {
      setError("فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="shadow-lg p-4 rounded" style={{ width: "100%", maxWidth: "400px" }}>
        <Card.Body>
          <h3 className="text-center text-primary mb-4">
            <Lock size={28} className="me-2" /> تسجيل الدخول
          </h3>

          {/* عرض رسالة الخطأ إذا وُجدت */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* نموذج تسجيل الدخول */}
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>
                <Mail size={16} className="me-2" /> البريد الإلكتروني
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label>
                <Lock size={16} className="me-2" /> كلمة المرور
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* زر تسجيل الدخول مع حالة التحميل */}
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "تسجيل الدخول"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
