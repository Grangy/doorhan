// app/contact/page.server.tsx
import ContactPage from "./page";

export const metadata = {
  title: 'Контакты — Doorhan',
  description: 'Контактная информация и форма обратной связи',
};

export default function Page() {
  return <ContactPage />;
}
