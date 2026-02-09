// Русские тексты для Allora Club
// Этот файл будет использоваться для многоязычности в будущем

export const ru = {
  // Screen 1 - Welcome
  welcome: {
    title: "Добро пожаловать в клуб яркой и наполненной жизни!",
    headline1: "ЯРКАЯ ЖИЗНЬ", // Not used in new text but keeping structure for safety, or removing if I check usage. Let's keep existing keys but empty or adapt if possible.
    headline2: "ВМЕСТЕ",      // User provided a single block of text. I should check how WelcomeScreen uses these.
    // Actually, looking at the user request, they provided:
    // "Добро пожаловать в клуб яркой и наполненной жизни!" as title/header?
    // "Тебя ждут весёлые вечеринки..." as subtitle/description?
    // "Начать!" as button.
    // Let's adapt the keys to fit the new content or I might need to check WelcomeScreen.tsx first to see how it renders.
    // I'll assume standard mapping for now but might need to adjust component.
    // Re-reading usage in next step.
    title: "Добро пожаловать в клуб яркой и наполненной жизни!",
    subtitle: "Тебя ждут весёлые вечеринки, спортивные активности, душевные ужины, отдых в приятной компании и культурные события.",
    button: "Начать!",
    disclaimer: "Я даю",
    consentLink: "согласие на обработку персональных данных",
    and: "и соглашаюсь с",
    privacyLink: "политикой конфиденциальности",
  },

  // Screen 2 - Onboarding
  onboarding: {
    button: "Начать!", // "Начать!" mentioned in text 4
    slides: [
      {
        title: "Добро пожаловать!", // Inferring title from context or using generic
        text: "Добро пожаловать в клуб яркой и наполненной жизни! Тебя ждут весёлые вечеринки, спортивные активности, душевные ужины, отдых в приятной компании и культурные события.",
      },
      {
        title: "Качество важнее!",
        text: "Важно не количество, а качество! Мы подберём активность по душе и соберём для тебя компанию единомышленников.",
      },
      {
        title: "Как это работает?",
        text: "Заполни мини-анкету ➡️ выбери мероприятие ➡️ наслаждайся вечером среди своих!",
      },
      {
        title: "Твоя новая жизнь",
        text: "С нами твоя жизнь станет ярче, богаче на новых людей и эмоции — и всё это без лишних усилий.",
      },
    ],
  },

  // Screen 3 - Profile Form (КТО Я?)
  profileForm: {
    title: "КТО Я?",
    continueButton: "Продолжить",
    fields: {
      name: {
        placeholder: "Моё имя",
      },
      gender: {
        placeholder: "Мой пол",
        options: ["Мужской", "Женский"],
      },
      age: {
        placeholder: "Мой возраст",
        options: ["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50+"],
      },
      zodiac: {
        placeholder: "Знак зодиака",
        options: [
          "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
          "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"
        ],
      },
      career: {
        placeholder: "Моя карьера",
        options: [
          "IT / Технологии", "Финансы / Банки", "Маркетинг / Реклама",
          "Медицина", "Образование", "Юриспруденция", "Искусство / Культура",
          "Предпринимательство", "Госслужба", "Другое"
        ],
      },
      familyStatus: {
        placeholder: "Семейный статус",
        options: ["Не женат / Не замужем", "Женат / Замужем", "В разводе", "Вдовец / Вдова"],
      },
      hasChildren: {
        placeholder: "Есть ли дети?",
        options: ["Да", "Нет"],
      },
    },
  },

  // Screen 4 - Best In Me (ЛУЧШЕЕ ВО МНЕ!)
  bestInMe: {
    title: "ЛУЧШЕЕ ВО МНЕ!",
    continueButton: "Продолжить",
    addPhotoButton: "Добавить фото",
    replacePhotoButton: "Заменить",
    fields: {
      strengths: {
        placeholder: "Моя сила",
        options: [
          "Стрессоустойчивость",
          "Упорство",
          "Самоконтроль",
          "Решительность",
          "Смелость",
          "Эмпатия",
          "Креативность",
          "Лидерство",
          "Коммуникабельность",
          "Аналитическое мышление",
        ],
      },
      weaknesses: {
        placeholder: "Мои слабости",
        optional: "необязательно",
        hint: "Каждая личность обладает своими уникальными чертами характера, среди которых присутствуют и слабые стороны. У меня тоже есть свои уязвимости, о которых стоит упомянуть.",
      },
      values: {
        placeholder: "Самые важные жизненные ценности",
        options: [
          "Семья",
          "Здоровье",
          "Карьера",
          "Саморазвитие",
          "Свобода",
          "Творчество",
          "Любовь",
          "Дружба",
          "Путешествия",
          "Финансовая стабильность",
        ],
      },
      loveLanguage: {
        placeholder: "Мой язык любви",
        options: [
          "Слова поддержки",
          "Время вместе",
          "Подарки",
          "Помощь",
          "Прикосновения",
        ],
      },
      goals: {
        placeholder: "Мои цели",
      },
      dreams: {
        placeholder: "Мои мечты",
      },
      interests: {
        placeholder: "Мои интересы",
        options: [
          "Спорт",
          "Музыка",
          "Кино",
          "Книги",
          "Путешествия",
          "Искусство",
          "Технологии",
          "Кулинария",
          "Фотография",
          "Танцы",
          "Йога",
          "Медитация",
          "Игры",
          "Природа",
        ],
      },
      telegramNickname: {
        placeholder: "Введите никнейм",
      },
      instagramNickname: {
        placeholder: "Введите никнейм",
        optional: "необязательно",
      },
    },
  },

  meetingConditions: {
    title: "УДОБНЫЕ УСЛОВИЯ\nДЛЯ КОМФОРТНЫХ ВСТРЕЧ",
    metro: {
      label: "Станции метро",
      options: ["Алабинская", "Российская", "Московская", "Гагаринская", "Спортивная"]
    },
    days: {
      label: "Дни недели",
      options: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
    },
    time: {
      label: "Время встреч",
      from: "С",
      to: "До"
    },
    goals: {
      label: "Цель участия",
      options: ["Нетворкинг", "Дружба", "Романтика", "Деловые связи"]
    },
    format: {
      label: "Какой формат знакомств тебе ближе?",
      options: ["Личная встреча", "Онлайн", "Групповой формат"]
    },
    continue: "Продолжить",
    back: "Назад"
  },
};

export type Translations = typeof ru;
