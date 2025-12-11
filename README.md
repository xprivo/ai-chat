<div align="center"> <img src="../../blob/main/public/assets/appassets/xprivo-octopus-blind-min.webp" width="200" alt="xPrivo Mascot" /> </div>

# xPrivo - Privacy-First AI Chat

xPrivo is an open-source AI chat interface and an alternative to ChatGPT/Perplexity that prioritises privacy and control. Chat with xPrivo or any local or external AI model by adding your own API keys. Organise your conversations in workspaces and keep everything local and private. No account is required! Plug-and-play architecture.

ℹ️ By default, most AI assistants use your chats for training and analysis. Even if you opt out of training, your chats will still be anonymised and used for analytics, so you lose control of your valuable thoughts, business ideas and more. By default, xPrivo is private and log-free. You can stay fully worry-free.

🌐➡ **Try it now at [xprivo.com](https://xprivo.com)** - Use our pre-configured xPrivo model. We use trusted EU-based partners and the best model for your requests, such as GPT-OSS, Mistral 3, DeepSeek V3.2 or Llama, all of which have a zero-logging guarantee. You can also add your own AI providers with custom API keys or self-host for complete control.

**Hosted Solution Benefits:**

- Free Tier: Daily request quota with occasional non-personalized, non-intrusive ads from vetted partners

- PRO Upgrade: Unlimited daily requests and ad-free experience

- Privacy-First Authentication: No account creation required. You receive a unique license key that serves as your identifier while keeping all chat history exclusively on your local device


**Become a Sponsor / Gain visibility on xPrivo**

Support xPrivo to help us keep the service free and reach our user base through carefully selected, non-personalized, non-intrusive advertising. Gain visibility within our community without compromising privacy or user experience. 

**[Learn more about sponsorship / advertising.](https://www.xprivo.com/mission/#sponsor)**


Big sponsors:
* [Hetzner](https://www.xprivo.com/partnerlink/hetzner) - Server, cloud & hosting
* [Bunny](https://www.xprivo.com/partnerlink/bunny) - CDN, DDOS protection, S3 buckets & DNS
* [Ionos](https://www.xprivo.com/partnerlink/ionos-ai) - Domains & web hosting

---

## Why xPrivo?

xPrivo is designed for users who want a powerful AI chat experience without compromising on privacy:

- **🔒 Privacy-First**: All data stored locally in your browser. No servers, no tracking
- **🔌 Provider Agnostic**: Connect to any OpenAI-compatible API endpoint
- **🚀 No Account Required**: Start chatting immediately with your own API keys
- **⚙️ Full Control**: Self-host or use our hosted version at xprivo.com
- **🎨 Customizable**: Brand it and theme it the way you like it

Whether you're a developer, researcher, or privacy-conscious user, xPrivo provides a clean, modern interface for interacting with AI models on your terms.

---

## ✨ Features

### Core Functionality
- **Modern chat interface** with real-time streaming responses
- **Connect any AI provider**: Local models or OpenAI, Anthropic and more if needed
- **Dark/light mode** with automatic detection
- **Multi-language support**: 🇬🇧 English, 🇫🇷🥖🇫🇷 French, 🇩🇪🍺 German, 🇮🇳 Hindi, and more

### Advanced Capabilities
- **📁 File processing**: Upload and discuss PDF, CSV, Excel, and DOC files with @mention system (complex PDFs are still a problem as of now)
- **📂 Workspaces**: Organize conversations with custom instructions
- **🤖 AI Experts**: Create specialized assistants with custom knowledge
- **🔍 Web search integration**: Real-time information retrieval
- **💾 Import/Export**: Transfer conversations between devices
- **🎭 Tone preferences**: Personalize AI response styles

### User Experience
- **📱 Fully responsive** design for mobile and desktop
- **⚡ Fast and lightweight** - no bloat and kept minimalistic
- **🎨 Customizable branding** and assistant icons
- **🌍 Accessible** from anywhere via [xprivo.com](https://xprivo.com)

---

## 🚀 Quick Start / Installation

### Option 1: Use the Hosted Version (Recommended)

Simply visit **[xprivo.com](https://xprivo.com)** and start chatting.

You can then also connect to other AI providers:

1. Go to **Settings > Configure AI Models & Endpoints**
2. Click **Add Provider**
3. Enter your provider details:
   - **Name**: A reference name (e.g., "My OpenAI")
   - **Endpoint URL**: Your API endpoint (e.g., `https://api.aiprovider.com/v1/chat/completions`)
   - **Authorization**: Your API key (e.g., `Bearer sk-...`)
   - **Model**: The model name (e.g., `llama-3.3`, `deepseek`)
4. Start chatting!

> **Note**: When using xprivo.com with certain AI providers, you may need to set up a proxy server to handle CORS. See the [Backend Proxy Setup](#-backend-proxy-setup) section below.

### Option 2: Self-Host

**Prerequisites:**
- Node.js 18 or higher
- npm (comes with Node.js)

**Installation:**

```bash
# Clone the repository
git clone 
cd xprivo-ai-chat

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

**Configure your default AI provider** in `src/config/setup.ts`:

```typescript
defaultProvider: {
  name: 'Your Provider Name',
  url: 'https://api.yourprovider.com/v1/chat/completions',
  authorization: 'Bearer your-api-key-here',
  model: 'llama-3.3-70b',
  enableWebSearch: false,
  enableSafeWebSearch: true
}
```

> ⚠️ **Important**: When running locally, you may encounter CORS issues with some AI providers. See the [Backend Proxy Setup](#-backend-proxy-setup) section to resolve this.

---

## 🔧 Backend Proxy Setup

### When Do You Need This?

Some AI providers (like Anthropic, etc.) may block direct API requests from your browser due to CORS (Cross-Origin Resource Sharing) restrictions. If you encounter CORS errors, you'll need to proxy requests through your own server.

In the chat interface, go to **Settings > Configure AI Models & Endpoints** and add:
- **Name**: MyCoolAiProvider (or your preferred name)
- **Endpoint URL**: `http://localhost:3001/chat`
- **Authorization**: (leave empty or use `Bearer dummy` - auth is handled by proxy)
- **Model**: `llama-3.3` (or your chosen model)

---

## ⚙️ Customization

### Request Configuration

Modify API request parameters globally in `src/config/setup.ts`:

```typescript
apiRequestConfig: {
  temperature: 0.7,
  max_tokens: 2000,
  max_completion_tokens: 4000,
  // ... other parameters
}
```

> ⚠️ **Note**: These settings apply to **all models** in your configuration.

### Branding Your App

**App Name**: Edit translations in `src/translations/index.ts`

**Logo**: Update `menu_icon` path in `src/config/setup.ts` and sidebar logo

**Colors**: Modify `tailwind.config.js` for custom color schemes

### Custom Assistant Avatar

Change the assistant's profile picture:
- Supports PNG, JPG, JPEG, SVG, WebP
- Persists across sessions
- Auto-fallback to default icon

### File Upload Settings

Adjust maximum file size in `src/utils/fileProcessor.ts`:

```typescript
const maxSize = 10 * 1024 * 1024; // 10MB default
```

### Adding Languages

Add new languages in `src/translations/index.ts` by including all required translation keys.

---

## 🏗️ Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder, ready for deployment to any static hosting service (Vercel, Netlify, etc.).

---

## 🐛 Troubleshooting

### Chat not working?

- ✅ Verify your API endpoint URL is correct and includes the proper path (e.g., `/v1/chat/completions`)
- ✅ Confirm your API key/bearer token is valid
- ✅ Ensure the model name matches exactly what your provider expects
- ✅ Check browser console for error messages

### CORS errors?

See the **[Backend Proxy Setup](#-backend-proxy-setup)** section above to proxy requests through your own server.

### File uploads failing?

- Ensure files are under the size limit (10MB default)
- Verify the file type is supported (PDF, CSV, Excel, DOC)

### Streaming responses not appearing?

- Confirm your API endpoint supports Server-Sent Events (SSE)
- Check for CORS issues in browser console
- Verify your proxy server (if using one) properly forwards streaming responses

---

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for lightning-fast development
- **Lucide React** for beautiful icons
- **LocalForage** for local data persistence

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues & Requesting Features

Found a bug or have a feature idea? Please open an issue:

1. Go to the [Issues](../../issues) page
2. Click "New Issue"
3. Choose the appropriate template:
   - **🐛 Bug Report**: For errors, crashes, or unexpected behavior
   - **✨ Feature Request**: For new functionality or improvements
   - **💬 General Feedback**: For questions or suggestions

### Contributing Code

We'd love to have your contributions! Follow these steps:

1. **Fork the repository** by clicking the "Fork" button at the top right
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/xprivo-ai-chat.git
   cd xprivo-ai-chat
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and commit:
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes clearly
   - Submit!

We'll review your PR and provide feedback. Once approved, your code will be merged into the main repository. Thank you for contributing! 🎉

### Development Guidelines

- Write clean, readable code with comments where needed
- Follow the existing code style and structure
- Test your changes thoroughly before submitting
- Update documentation if you're adding new features
- Make sure visible text is translated in the translations to all the existing languages (you can use tools like deepl or another reliable AI)

---

## 📄 License

This project is licensed under the **AGPLv3 License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Support the Project

If you find xPrivo useful, please:

- ⭐ Star this repository
- 🐛 Report bugs and suggest features via [Issues](../../issues)
- 🔀 Contribute code via Pull Requests
- 📢 Share with others who value privacy

Built with ❤️ for the privacy-conscious community.
