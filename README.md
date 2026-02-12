# AI Assistant Hub

A comprehensive AI-powered web application with multiple intelligent modes powered by Groq API.

## Features

### 1. RAG Mode (Retrieval Augmented Generation)
- Upload text documents (TXT, MD, JSON, CSV)
- Automatically summarize documents with AI
- Ask questions about your documents
- Search and query document content
- Document history management

### 2. Chat Mode
- ChatGPT-like conversational AI
- Multiple conversation threads
- Full conversation history
- Code assistance and explanations
- General knowledge queries

### 3. Blog Generator
- AI-powered blog post generation
- Multiple tone options (Professional, Casual, Friendly, Formal, Humorous, Inspirational)
- Adjustable length (Short, Medium, Long)
- One-click copy functionality
- SEO-friendly content structure

### 4. Code Assistant
- Multi-language code generation
- Support for JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, Swift
- Code explanations
- Best practices recommendations
- Syntax highlighting

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Groq API key (get one at https://console.groq.com)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your Groq API key:
   - Open `.env` file
   - Replace `your_groq_api_key_here` with your actual Groq API key:
   ```
   VITE_GROQ_API_KEY=gsk_your_actual_key_here
   ```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local URL shown in the terminal

### First Time Setup

1. Create an account by clicking "Sign Up"
2. Enter your email and password
3. Sign in with your credentials
4. You're ready to use all AI features!

## How to Use Each Mode

### RAG Mode
1. Click "RAG" in the sidebar
2. Upload a document using the upload area
3. Click "Summarize" to get an AI summary
4. Type questions in the search box to query your document
5. View answers based on document content

### Chat Mode
1. Click "Chat" in the sidebar
2. Click "New Chat" to start a conversation
3. Type your message and press Enter or click Send
4. Continue the conversation naturally
5. Switch between multiple conversations anytime

### Blog Generator
1. Click "Blog" in the sidebar
2. Enter your blog topic
3. Select tone and length preferences
4. Click "Generate Blog"
5. Copy the generated content with one click

### Code Assistant
1. Click "Code" in the sidebar
2. Select your programming language
3. Describe what code you need
4. Click "Generate Code"
5. Review code and explanations
6. Copy to use in your projects

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Groq API (Llama 3.3 70B)

## Database Structure

The application uses three main tables:
- `conversations` - Stores chat conversations
- `messages` - Stores individual messages
- `documents` - Stores uploaded documents and summaries

All data is secured with Row Level Security (RLS) policies.

## Tips for Best Results

- **RAG Mode**: Upload clean, well-formatted text files for best results
- **Chat Mode**: Be specific in your questions for more accurate responses
- **Blog Generator**: Provide detailed topics for more comprehensive content
- **Code Assistant**: Clearly describe your requirements and constraints

## Troubleshooting

### "Please set your Groq API key" Error
- Make sure you've added your Groq API key to the `.env` file
- Restart the development server after updating the `.env` file

### Authentication Issues
- Clear your browser cache and cookies
- Make sure you're using a valid email format
- Use a password with at least 6 characters

### Document Upload Issues
- Only text-based files are supported
- Ensure file size is reasonable (< 5MB recommended)
- Check file encoding is UTF-8

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Support

For issues or questions, please check the Groq API documentation at https://console.groq.com/docs

---

Built with React, TypeScript, Supabase, and Groq AI
