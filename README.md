# Hermit

Hermit is a **blazingly fast WebSocket-based chat application** designed to support multiple concurrent users. It utilizes modern web technologies to deliver a scalable, type safe and responsive architecture.


https://github.com/user-attachments/assets/1c2ffa52-cf85-4cbf-822d-348ba20f32d2


## Table of Contents

- [Features](#features)
- [Upcoming](#upcoming)
- [Tech Stack](#tech-stack)
- [Installation](#installation)

---

## Features

- Real time messaging via **WebSockets**
- Quick rate limiting middlware with **Redis**
- Inactive room deletion using **Cron**
- **Prisma ORM** for handling migrations & type safety
- Supports multiple concurrent users in different chat rooms
- Persistent message storage with **PostgreSQL**
- Responsive UI using **NextJs** and **ShadCn**
- Scalable monorepo setup with **Turborepo**
- Authentication using **JWT** and **Cookies**
- Type-safe development with **TypeScript**

---

## Upcoming

- Quick caching support with **Redis**  ✅
- Rate limiting for security and scalibility ✅
- Avatars and Account section

## Tech Stack

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[TypeScript](https://www.typescriptlang.org/)** - Type safe JavaScript
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** - Real time bi-directional communication
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database for storing chat messages and user info
- **[Prisma ORM](https://www.prisma.io/)** - Type safe database ORM for PostgreSQL
- **[Turborepo](https://turbo.build/repo)** - Monorepo management and build system
- **[JWT](https://jwt.io/)** - Authentication and secure user sessions
- **[Express](https://expressjs.com/)** - Web framework for building APIs
- **[Tailwind CSS](https://tailwindcss.com/)** - Used CSS framework
- **[Next.js](https://nextjs.org/)** - React framework for SSR/SSG and API routes
- **[Redis](https://redis.io/docs/latest/)** - Redis is used for very quick in memory tasks

---

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hermit.git
cd hermit

# Install dependencies
pnpm install
# or
npm install

# Generate prisma file 
npx prisma generate
# Add your own .env file for database URL
```
