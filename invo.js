import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-DnTdqjQW9-gq6UBEcnhIk7gT1dHdSBI",
  authDomain: "invoice-bed82.firebaseapp.com",
  databaseURL: "https://invoice-bed82-default-rtdb.firebaseio.com",
  projectId: "invoice-bed82",
  storageBucket: "invoice-bed82.firebasestorage.app",
  messagingSenderId: "387761020229",
  appId: "1:387761020229:web:a22e0b4058ae9fb7b0f22c",
  measurementId: "G-SB2H7229YE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
