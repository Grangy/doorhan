'use client';

import { useState, useEffect, useRef } from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

export default function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне формы
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Закрытие по Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) newErrors.phone = 'Введите номер телефона';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        phone,
        page: window.location.href,
      };

      // Отправляем данные на API endpoint /api/forms
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        setErrors({ form: 'Ошибка отправки. Попробуйте позже.' });
      }
    } catch {
      console.error('Ошибка отправки формы');
      setErrors({ form: 'Ошибка отправки. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={formRef}
        className="bg-white rounded-xl w-full max-w-md transform transition-all duration-300 scale-95 
                   animate-[slideIn_0.3s_ease-out_forwards]"
      >
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            aria-label="Закрыть"
          >
            <HiX className="w-6 h-6 text-gray-600" />
          </button>

          <h2 className="text-2xl font-bold mb-6">Обратная связь</h2>

          {isSuccess ? (
            <div className="text-center py-8">
              <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Сообщение отправлено!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Телефон *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  autoFocus
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <HiExclamationCircle className="w-4 h-4 mr-1" /> {errors.phone}
                  </p>
                )}
              </div>

              {errors.form && (
                <p className="text-red-500 text-sm flex items-center">
                  <HiExclamationCircle className="w-4 h-4 mr-1" /> {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-900 text-white py-3 rounded-lg hover:bg-blue-700 
                         transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Отправить'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
