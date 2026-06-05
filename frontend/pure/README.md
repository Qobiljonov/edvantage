# Adtage — Pure HTML/CSS/JS

Milliy AI ta'lim platformasi. **npm kerak emas** — brauzerda to'g'ridan-to'g'ri ochiladi.

## Ishga tushirish

`pure` papkasidagi **index.html** faylini ikki marta bosing yoki brauzerda oching:

```
c:\Users\User\Desktop\edvantage\pure\index.html
```

## Sahifalar

| Fayl                    | Tavsif                        |
| ----------------------- | ----------------------------- |
| `index.html`            | Landing                       |
| `dashboard.html`        | Boshqaruv paneli              |
| `ai-tutor.html`         | AI Ustoz (chat)               |
| `library.html`          | Kutubxona                     |
| `quiz.html`             | Test generatori               |
| `exam.html`             | Imtihon simulyatori           |
| `leaderboard.html`      | Reyting                       |
| `analytics.html`        | Analitika                     |
| `profile.html`          | Profil va sozlamalar          |
| `knowledge-engine.html` | Bilim dvigateli (AI jarayoni) |

## Struktura

```
pure/
├── index.html
├── dashboard.html
├── …
├── css/
│   ├── variables.css
│   └── main.css
└── js/
    ├── app.js
    ├── ai-tutor.js
    ├── quiz.js
    ├── exam.js
    ├── charts.js
    └── knowledge-engine.js
```

## Dizayn

- iPhone 16 Pro ilhomida mobile-first
- SF Pro / -apple-system tipografiya
- Blur navigatsiya, safe-area qo'llab-quvvatlash
- Canvas grafiklar (analitika)
