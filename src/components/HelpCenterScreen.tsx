"use client";

import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface HelpCenterScreenProps {
  onBack: () => void;
}

export function HelpCenterScreen({ onBack }: HelpCenterScreenProps) {
  const faqs = [
    {
      question: "Как именно проходит встреча?",
      answer: "Вы приходите в назначенное место. Наша задача — собрать людей близких по духу, где общение начинается само собой через общее дело (игру, обсуждение фильма, совместный ужин). Мы даём лёгкий старт, а дальше всё идёт естественно."
    },
    {
      question: "Кто обычно приходит на встречи?",
      answer: "Наши участники — это такие же люди, как и вы, которые хотят расширить круг общения, найти друзей или просто интересно провести время. Это мамы в декрете, переехавшие, предприниматели, те, кто устал от рутины и т. д."
    },
    {
      question: "Что если я передумаю? Можно ли перенести или вернуть деньги?",
      answer: "Вы можете бесплатно перенести участие на другую дату или отменить с полным возвратом суммы при письменном уведомлении через Телеграм-бот за 48 часов."
    },
    {
      question: "Как обеспечивается безопасность на встречах?",
      answer: "Мы выбираем только проверенные публичные места. На каждой встрече действуют строгие правила: уважение личных границ, запрет на домогательства и токсичное поведение. В случае дискомфорта вы можете обратиться в администрацию заведения, где проходит встреча."
    },
    {
      question: "Почему оплата самой активности (еда, билеты) — отдельно?",
      answer: "Это позволяет вам контролировать свои расходы на месте (например, заказать только десерт или полный ужин) и делает организационный сбор прозрачным. Вы платите нам только за организацию и подбор компании."
    },
    {
      question: "Что спрашивают в анкете, и кто видит мои данные?",
      answer: "Мы задаём вопросы о ваших интересах, целях знакомства и предпочтениях по формату общения. Это нужно только для подбора группы. Ваши контакты и личная информация не передаются другим участникам и являются строго конфиденциальными."
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      {/* Header */}
      <div className="sticky top-0 bg-[#FFF7EF] z-10 px-6 pt-8 pb-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="text-[#E15859]" size={24} />
        </button>
        <h1
          className="text-[#E15859] text-[20px] font-black uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Справочный центр
        </h1>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 px-6 pb-8 overflow-y-auto"
      >
        {/* FAQ Section */}
        <div className="mb-8">
          <h2
            className="text-[#E15859] text-[18px] font-black uppercase mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Часто задаваемые вопросы
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-[16px] px-5 py-4 shadow-sm">
                <h3 className="text-[#2A2021] text-[14px] font-semibold mb-2 leading-tight">
                  {faq.question}
                </h3>
                <p className="text-[#404243] text-[13px] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-8">
          <h2
            className="text-[#E15859] text-[18px] font-black uppercase mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Служба поддержки
          </h2>

          <div className="bg-white rounded-[16px] px-5 py-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[#404243] text-[13px] font-medium">TG:</span>
              <a
                href="https://t.me/AntreClub_support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E15859] text-[13px] font-semibold underline"
              >
                @AntreClub_support
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#404243] text-[13px] font-medium">E-mail:</span>
              <a
                href="mailto:antreclub@mail.ru"
                className="text-[#E15859] text-[13px] font-semibold underline"
              >
                antreclub@mail.ru
              </a>
            </div>
          </div>
        </div>

        {/* Partnership Section */}
        <div className="mb-8">
          <h2
            className="text-[#E15859] text-[18px] font-black uppercase mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Контакты для сотрудничества
          </h2>

          <div className="bg-white rounded-[16px] px-5 py-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[#404243] text-[13px] font-medium">TG:</span>
              <a
                href="https://t.me/AntreClub_support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E15859] text-[13px] font-semibold underline"
              >
                @AntreClub_support
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#404243] text-[13px] font-medium">E-mail:</span>
              <a
                href="mailto:antreclub@mail.ru"
                className="text-[#E15859] text-[13px] font-semibold underline"
              >
                antreclub@mail.ru
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
