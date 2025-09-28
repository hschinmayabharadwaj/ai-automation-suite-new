# � AI Automation Suite

## 🚀 Project Overview
**AI Automation Suite** is an AI-powered content generation and collaborative editing application built using **Next.js, React, TailwindCSS, Drizzle ORM, TypeScript, and Clerk for authentication**. It leverages **Google Gemini API, Groq API, and Jina API** to generate high-quality content efficiently. The app provides a seamless user experience with **modern UI, secure authentication, real-time collaboration, and a scalable Postgres database** for content storage.

## ✨ Features
- **AI-Powered Content Generation**: Utilizes **Google Gemini API, Groq API** for generating high-quality content
- **Real-time Collaboration**: **Liveblocks integration** for collaborative editing and mind mapping
- **Authentication & Security**: Implemented **Clerk authentication** for secure access
- **Modern UI/UX**: Designed using **TailwindCSS** with custom components and animations
- **Database Management**: Uses **Postgres** with **Drizzle ORM** for structured data handling
- **Rich Text Editing**: Advanced text editor with **TipTap** integration
- **Template System**: Pre-built templates for various content types
- **Version History**: Track and manage content versions
- **Scalability & Performance**: Optimized backend with **TypeScript** and **Next.js Server Components**
- **Cloud Deployment**: Deployed on **Vercel** for seamless global accessibility

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **AI APIs**: Google Gemini API, Groq API, Jina API
- **Collaboration**: Liveblocks
- **Rich Text**: TipTap, Yjs
- **Hosting**: Vercel

## 📊 Installation & Setup

### Prerequisites
- Node.js 18.17.0 or higher
- npm or yarn package manager
- PostgreSQL database (recommend Neon for cloud)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/hschinmayabharadwaj/ai-automation-suite-new.git
   cd ai-automation-suite-new
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`:
   ```env
   # Liveblocks Configuration
   LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AI APIs
   GROQ_API_KEY=your_groq_api_key
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   JINA_API_KEY=your_jina_api_key

   # Database
   NEXT_PUBLIC_DRIZZLE_DB_URL=your_neon_database_url
   ```

5. Set up the database:
   ```bash
   npm run db:push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open **http://localhost:3000** to access the app

## 🌐 Vercel Deployment

### Automatic Deployment
1. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: `https://github.com/hschinmayabharadwaj/ai-automation-suite-new`

2. **Configure Environment Variables**:
   Add all environment variables from your `.env.example` file in Vercel's dashboard

3. **Deploy**: 
   Vercel will automatically:
   - Install dependencies with `npm install`
   - Build the project with `npm run build`
   - Deploy to production

### Manual Deployment with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 📁 Project Structure
```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (data)/            # Data components
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   └── editor/           # Collaborative editor
├── components/            # React components
├── lib/                  # Utility libraries
├── utils/                # Database and utilities
├── styles/               # CSS styles
└── public/               # Static assets
```

## 🏆 Future Enhancements
- **Integration with additional AI models** for better content customization.
- **User-generated templates** for faster content creation.
- **Advanced analytics dashboard** to track AI-generated content performance.
- **Collaboration features** for team-based content creation.

## 📜 License
This project is licensed under the **MIT License**.

## 🤝 Contributing
Want to contribute? Feel free to open an **issue** or submit a **pull request**.

