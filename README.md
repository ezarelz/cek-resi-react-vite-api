# 📦 Cek Resi — React + TypeScript + Vite

A lightweight web application for checking Indonesian shipment tracking numbers (AWB/Resi).
Built using **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, with a clean dark-mode interface.

---

## 🚀 Features

- Input field for shipment tracking numbers
- Courier selection dropdown
- “Track Package” button
- Modern dark-mode UI with theme toggle
- Responsive and fast
- Customizable API integration

---

## 🛠️ Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/ezarelz/cek-resi-react-vite-api.git
cd cek-resi-react-vite-api
```

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

---

## 📂 Project Structure

Project Folder Structure:

```
src/
 ├── assets/               # Images, icons, static assets
 ├── components/           # Reusable UI components
 │    ├── CopyLinkButton.tsx
 │    ├── InputForm.tsx
 │    ├── ThemeToggle.tsx
 │    └── TrackingResult.tsx
 ├── hooks/                # Custom React hooks
 ├── lib/                  # API clients or external helpers
 ├── utils/                # Utility functions (helpers)
 ├── App.tsx               # App entry component
 ├── index.css             # Global styles
 ├── main.tsx              # Vite/React bootstrap
```

Root configuration files:

```
.env                       # VITE_KLIKRESI_API_KEY= ....
.eslint.config.js
vercel.json                # Deployment config
vite.config.ts             # Vite configuration
tsconfig.json              # TypeScript config
tsconfig.app.json
tsconfig.node.json
```

---

## 🔧 API Usage

This project uses **KlikResi API (klikresi.com)** as the shipment tracking provider.
All tracking requests are sent through the KlikResi endpoint defined in your environment variables.

If you want to customize or modify the API logic, you can update the related files in:

```
/src/hooks/      # Hook that manages API calls and state
```

or create a new file :

```
/src/lib/        # API client or fetch functions
```

You can also switch to another API provider by adjusting the request handler accordingly.

---

## 📄 License

MIT License — free to use, modify, and distribute.
