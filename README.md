# AI Translator - Next.js Frontend

A beautiful, responsive AI translation interface built with Next.js 15, TypeScript, and shadcn/ui. Features Google Translate-like design with Cloudflare Turnstile integration, multi-language support, and dark/light theme switching.

## ✨ Features

- 🌐 **Multi-language Support** - Interface available in 10 languages with automatic system language detection
- 🎨 **Beautiful UI** - Google Translate-inspired design with responsive layout
- 🌓 **Theme Switching** - Dark/light mode toggle with system preference detection
- 🔒 **Cloudflare Turnstile** - Secure verification with pass-based authentication
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- ⚡ **Auto-resize TextArea** - Dynamic text input with character counting
- 📋 **Copy/Paste/Clear** - Quick action buttons for better UX
- 🚀 **Modern Stack** - Next.js 15 App Router, TypeScript, Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm
- **Theme**: next-themes
- **Icons**: Lucide React
- **Security**: Cloudflare Turnstile

## 📋 Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- A running AI Translator backend API

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-translator-nextjs-cursor

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration (Required)
NEXT_PUBLIC_API_BASE=http://localhost:8080

# Development settings
NODE_ENV=development
```

**Important Environment Variables:**

- `NEXT_PUBLIC_API_BASE`: Your backend API URL (required)
  - Local development: `http://localhost:8080`
  - Production: Your deployed API URL

### 3. Backend Requirements

Your backend API must provide these endpoints:

```
GET  /_turnstile/sitekey    # Returns Turnstile configuration
POST /v1/translate          # Translation endpoint
```

Expected API responses:

**GET /\_turnstile/sitekey:**

```json
{
  "siteKey": "your-turnstile-site-key",
  "headerName": "CF-Turnstile-Token"
}
```

**POST /v1/translate:**

```json
{
  "sourceLang": "auto",
  "targetLang": "en",
  "translatedText": "Hello everyone!"
}
```

### 4. Run Development Server

```bash
# Start the development server
pnpm dev

# Or with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Character Limits

Edit character limits in `src/components/translator.tsx`:

```typescript
const MAX_CHARACTERS = 5000; // Hard limit
const SOFT_LIMIT = 4000; // Warning threshold
```

### Supported Languages

Add or modify languages in `src/lib/i18n.ts`:

```typescript
export const languages: Record<SupportedLanguage, string> = {
  en: "English",
  zh: "中文",
  // Add more languages...
};
```

### Theme Configuration

Theme settings are in `src/app/layout.tsx`:

```jsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"  // 'light' | 'dark' | 'system'
  enableSystem
  disableTransitionOnChange
>
```

## 🎯 Usage

### Basic Translation

1. **Select Languages**: Choose source and target languages
2. **Enter Text**: Type or paste text in the source textarea
3. **Verify**: Complete Turnstile challenge if prompted
4. **Translate**: Click the translate button
5. **Copy Result**: Use the copy button to copy the translation

### Features

- **Auto-detect**: Source language can be set to "Detect language"
- **Swap Languages**: Click the swap button to reverse source/target
- **Character Counter**: Shows usage against limits
- **Responsive Design**: Works on mobile and desktop
- **Theme Toggle**: Switch between light/dark themes
- **Multi-language UI**: Interface adapts to user's system language

### Turnstile Flow

1. **First Use**: Turnstile widget appears for verification
2. **Verification**: User completes the challenge
3. **Pass Issued**: Server provides a short-lived pass
4. **Subsequent Requests**: Pass allows multiple translations
5. **Pass Expiry**: Widget reappears when pass expires

## 🏗 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auto-resize-textarea.tsx
│   ├── character-counter.tsx
│   ├── header.tsx
│   ├── language-selector.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── translator.tsx      # Main translation component
├── hooks/
│   ├── use-language.ts     # Language switching hook
│   ├── use-toast.tsx       # Toast notifications
│   └── useTurnstile.tsx    # Turnstile widget management
└── lib/
    ├── apiClient.ts        # API client with pass management
    ├── i18n.ts             # Internationalization
    └── utils.ts            # Utility functions
```

## 🚀 Production Deployment

### Build for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Set these in your production environment:

```env
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
NODE_ENV=production
```

### Deployment Platforms

**Vercel:**

```bash
# Deploy to Vercel
npx vercel --prod
```

**Netlify:**

```bash
# Build command
pnpm build

# Publish directory
out
```

**Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- **Turnstile Keys**: Keep your secret key on the backend only
- **API Endpoints**: Ensure proper CORS configuration
- **Rate Limiting**: Implement backend rate limiting
- **Pass Storage**: Passes are stored in memory only (not localStorage)

## 🐛 Troubleshooting

### Common Issues

**Turnstile not loading:**

- Check console for script loading errors
- Verify site key configuration
- Ensure proper CORS headers

**Translation failures:**

- Verify API base URL in environment
- Check backend CORS configuration
- Ensure proper request headers

**Theme not working:**

- Verify ThemeProvider wraps your app
- Check CSS custom properties
- Ensure suppressHydrationWarning is set

### Debug Mode

Enable detailed logging by adding to your environment:

```env
NODE_ENV=development
```

## 📚 API Reference

### Frontend API Client

```typescript
import { postTranslate, getTurnstileSiteKey } from "@/lib/apiClient";

// Get Turnstile configuration
const config = await getTurnstileSiteKey();

// Translate text
const result = await postTranslate(
  {
    text: "Hello world",
    sourceLang: null, // auto-detect
    targetLang: "es",
  },
  {
    turnstileHeaderName: "CF-Turnstile-Token",
    getTurnstileToken: () => "turnstile-token",
  }
);
```

### Hooks

```typescript
// Language switching
const { currentLanguage, setCurrentLanguage, t } = useLanguage();

// Turnstile management
const { containerRef, render, refresh, token, isVerified } = useTurnstile();

// Toast notifications
const { toast } = useToast();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) - Security
- [Lucide](https://lucide.dev/) - Icons
