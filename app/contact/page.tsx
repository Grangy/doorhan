// app/contact/page.tsx
import ContactPage from "./ContactPage.client";

export const metadata = {
  title: 'Контакты — Doorhan',
  description: 'Контактная информация и форма обратной связи',
};

export default function Page() {
  return <ContactPage />;
}
