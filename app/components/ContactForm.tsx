"use client";

import React, { useState, useEffect } from "react";

const ContactForm = () => {
  const [pageUrl, setPageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    page: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const url = window.location.href;
    setPageUrl(url);
    setFormData((prev) => ({ ...prev, page: url }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", phone: "", message: "", page: window.location.href });
      } else {
        setStatus("error");
      }
    } catch {
      console.error("Ошибка при отправке формы");
      setStatus("error");
    }
  };

  return (
    <section className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Свяжитесь с нами
        </h2>


        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <input
            type="phone"
            name="phone"
            id="phone"
            placeholder="+7 978 000 00 00"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>

        {/* 2. Скрытое поле для URL страницы */}
        <input type="hidden" name="page" value={pageUrl} />

        {/* 3. Кнопка отправки с анимацией и отзывчивым состоянием */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-sky-900 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          {status === "submitting" ? "Отправка..." : "Отправить"}
        </button>

        {/* 4. Сообщения об успешной отправке или ошибке */}
        {status === "success" && (
          <p className="text-green-600 text-center font-medium">
            Сообщение отправлено успешно!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-center font-medium">
            Ошибка при отправке сообщения. Попробуйте ещё раз.
          </p>
        )}
      </form>
    </section>
  );
};

export default ContactForm;
