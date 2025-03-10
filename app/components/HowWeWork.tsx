// app/components/HowWeWork.tsx
import React from "react";

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Заявка",
    description:
      "Менеджер проконсультирует, поможет с выбором типа конструкции и произведет расчёт стоимости изделия",
  },
  {
    id: 2,
    title: "Замер",
    description:
      "Проведение замера, согласование сметы и подписание договора",
  },
  {
    id: 3,
    title: "Производство",
    description: "Производство и монтаж ворот",
  },
  {
    id: 4,
    title: "Прием работы",
    description:
      "Вы принимаете, утверждаете и совершаете окончательный расчёт",
  },
];

const HowWeWork: React.FC = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Как мы работаем?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-900 text-white text-lg font-bold mb-4 mx-auto">
                {step.id}
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
