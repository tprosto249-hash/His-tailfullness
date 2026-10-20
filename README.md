# Його Хвостатість

Статичний сайт бутік-готелю для собак і котів. На сторінці представлені номери та послуги готелю, калькулятор попередньої вартості перебування, відео, галерея, відгуки, відповіді на часті запитання й форма зворотного зв’язку.

## Стек

- HTML
- Tailwind CSS 3, зібраний локально
- CSS
- Vanilla JavaScript та відкладені UI-бібліотеки
- Локальні зображення й відео в `assets/`

## Структура проєкту

```text
.
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/       # SVG-зображення та MP4-відео
├── css/
│   ├── style.css
│   ├── tailwind.input.css
│   └── tailwind.generated.css
├── js/
│   ├── calculator.js
│   ├── contact-form.js
│   ├── main.js
│   ├── navigation.js
│   ├── validation.js
│   └── weather-widget.js
├── robots.txt
├── sitemap.xml
├── index.html
├── .gitignore
└── README.md
```

## Збірка та локальний запуск

Встановіть залежності й зберіть Tailwind CSS:

```bash
npm install
npm run build
```

Після збірки запустіть локальний HTTP-сервер із кореневої папки проєкту:

```bash
python -m http.server 8000
```

Потім відкрийте <http://localhost:8000>.

Для зовнішніх шрифтів, зображень, віджета погоди та UI-бібліотек потрібне підключення до інтернету. Swiper, Fancybox, Typed.js і віджет погоди завантажуються відкладено.

## Опублікована версія

- **GitHub Pages:** додайте посилання після публікації.
- **Netlify:** додайте посилання після публікації.
