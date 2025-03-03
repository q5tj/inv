import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // إضافة التوجيه
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // تفعيل التوجيه

  // جلب المنتجات من Firebase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة منتج جديد
  const addProduct = async () => {
    if (productName.trim() && price.trim()) {
      try {
        await addDoc(collection(db, "products"), {
          name: productName,
          price: parseFloat(price),
        });
        setProductName("");
        setPrice("");
        fetchProducts();
      } catch (error) {
        console.error("خطأ في إضافة المنتج:", error);
      }
    }
  };

  // تعديل المنتج
  const editProduct = async (id, name, price) => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        name,
        price: parseFloat(price),
      });
      fetchProducts();
    } catch (error) {
      console.error("خطأ في تعديل المنتج:", error);
    }
  };

  // حذف المنتج
  const deleteProduct = async (id) => {
    try {
      const productRef = doc(db, "products", id);
      await deleteDoc(productRef);
      fetchProducts();
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
    }
  };

  // فلترة المنتجات حسب البحث
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="text-center text-primary mb-4">لوحة التحكم</h2>

      {/* نموذج إضافة منتج */}
      <div className="card shadow-sm p-4 mb-4" style={{ backgroundColor: "#f8f9fa" }}>
        <h4 className="text-warning">إضافة منتج جديد</h4>
        <div className="row g-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="اسم المنتج"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="السعر"
            />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-success" onClick={addProduct}>
              إضافة المنتج
            </button>
          </div>
        </div>
      </div>

      {/* خانة البحث عن المنتجات */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="ابحث عن اسم المنتج..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* قائمة المنتجات */}
      <div className="card shadow-sm p-4" style={{ backgroundColor: "#f8f9fa" }}>
        <h4 className="text-warning">قائمة المنتجات</h4>

        {loading ? (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <table className="table table-hover">
              <thead style={{ backgroundColor: "#004085", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>اسم المنتج</th>
                  <th>السعر (ريال)</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => editProduct(product.id, product.name, product.price)}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* زر التوجه لإنشاء الفاتورة */}
            <div className="text-center mt-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/invoice", { state: { products } })}
              >
                إنشاء فاتورة
              </button>
            </div>
          </>
        ) : (
          <p className="text-muted text-center">لا يوجد منتجات متاحة حاليًا.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
