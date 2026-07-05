# FACADE

FACADE is a minimalistic, hand-drawn (Excalidraw-style) chat application that allows users to converse with AI personas of prominent technology figures. It features a responsive user interface with dark mode support, passwordless magic link authentication, and persistent chat history.


## Preview

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f1de9614-4203-482b-afe1-4929bf58a283" width="100%" alt="Homepage"/>
      <br><b>Login</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/a94ad17e-e870-45d4-a3b7-4ace9fd435ab" width="100%" alt="Feature View"/>
      <br><b>Magic link</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/3750bc41-f788-4562-a381-377181112ecd" width="100%" alt="AI Generation"/>
      <br><b>Hitesh sir<b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6d3f7ca7-6ac8-4d0b-a37d-b127fde61d9f" width="100%" alt="Dashboard"/>
      <br><b>Piyush Sir</b>
    </td>
  </tr>
</table>


## Features

- **Excalidraw Aesthetic:** Custom-built vanilla CSS for a sketchy, hand-drawn look with micro-animations and custom tooltips.
- **Dark Mode Support:** Seamless toggling between light and dark themes.
- **Passwordless Login:** Secure magic link authentication powered by Resend.
- **Multiple AI Personas:** Switch between different AI personalities dynamically.
- **Persistent History:** Chat history is saved in the database and automatically restored across sessions.
- **Message Limiter:** A visual 10-dot tracker in the header indicates the remaining quota of free messages.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (Axios for API requests)
- **Backend:** Node.js, Express
- **Database:** Neon Serverless Postgres
- **Authentication:** JWT and HTTP-Only Cookies
- **Email Service:** Resend API
- **AI Integration:** OpenAI-compatible API
- **Deployment:** Vercel (Configured for Serverless Functions via vercel.json)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/realSUDO/facade.git
cd facade
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:

```ini
PORT=3000
BASE_URL=https://api.openai.com/v1 # Or your custom AI gateway
API_KEY=your_ai_api_key
MODEL=gpt-4o-mini

# Database & Auth
DATABASE_URL=your_neon_postgres_connection_string
RESEND_API_KEY=your_resend_api_key
JWT_SECRET=your_super_secret_jwt_key

# Environment Mode
# 0 = Local testing (Magic links point to http://localhost:3000)
# 1 = Vercel Production (Magic links point to your production domain)
PROD="0"
```

### 4. Database Schema
Ensure the Neon database has the following tables configured:

**users:**
- `email` (VARCHAR, PRIMARY KEY)
- `message_count` (INT, default 0)

**magic_links:**
- `token` (VARCHAR, PRIMARY KEY)
- `email` (VARCHAR)
- `expires_at` (TIMESTAMP)

**chat_messages:**
- `id` (SERIAL, PRIMARY KEY)
- `email` (VARCHAR)
- `persona` (VARCHAR)
- `role` (VARCHAR)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

### 5. Run Locally
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

## Deployment

This project is optimized for deployment on Vercel. Push to your repository and import the project into Vercel. Populate the environment variables in the Vercel dashboard and set `PROD="1"`. The included `vercel.json` will automatically route API requests to the Express backend.

## License

MIT License
