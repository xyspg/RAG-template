# Enterprise RAG Template

![Home](public/screenshots/home.png)

[简体中文](README-zh.md)

Template for enterprise and organizational RAG (Retrieval-Augmented Generation)  
Built with Next.js + LangChain

- Built-in admin dashboard with configurable email domain registration
- Visualized internal document management panel supporting Markdown
- Text completion adapted to OpenAI API syntax, compatible with Kimi AI, Alibaba Tongyi Qianwen text vectors, and other interfaces for compliance requirements
- Supports demo mode

Knowledge Base Management:  
![base](public/screenshots/base.png)

Visual Markdown Editor:  
![editor](public/screenshots/editor.png)

## Usage Instructions

Please clone this repository or download the zip file.

1. Configure basic settings in `siteConfig.ts`
2. Place `icon.png` under `/public`
3. Set the necessary environment variables in `.env`
4. Ensure Docker and Docker Compose are installed
5. Run `docker-compose up --build -d` to start the service (you can omit the `--build` flag for subsequent runs)

## Acknowledgements

- [Vercel Next.js AI Chatbot](https://vercel.com/templates/next.js/nextjs-ai-chatbot)
