# Portfolio Website

A formal, responsive personal portfolio built with HTML, CSS, and JavaScript, served by a minimal Spring Boot backend. Contact form submissions are saved to Firebase Firestore and optionally emailed to you.

## Features

- Single-page layout: Hero, About, Education, Skills, Projects, Contact
- Smooth scroll and reveal animations (respects reduced motion)
- Fully responsive mobile navigation
- Resume view/download (PDF in `static/assets/`)
- `POST /api/contact` — validates input, saves to Firestore, sends email notification

## Prerequisites

- JDK 21
- Maven 3.8+
- Firebase project with Firestore enabled
- SMTP credentials (e.g. Gmail App Password)

## Setup

1. **Clone and configure**

   ```bash
   cp src/main/resources/application-example.properties src/main/resources/application.properties
   ```

   Edit `application.properties` or set environment variables:

   | Variable | Description |
   |----------|-------------|
   | `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON |
   | `FIREBASE_ENABLED` | `true` to save contacts to Firestore |
   | `MAIL_HOST`, `MAIL_PORT` | SMTP server |
   | `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP credentials |
   | `NOTIFY_EMAIL` | Where contact notifications are sent |
   | `MAIL_ENABLED` | `true` to send email on contact submit |

2. **Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore
   - Project Settings → Service accounts → Generate new private key
   - Save the JSON file outside the repo and set `portfolio.firebase.credentials-path`

   Example Firestore rules (client writes denied; backend uses Admin SDK):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /contacts/{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. **Resume**

   Place your PDF at:

   `src/main/resources/static/assets/resume.pdf`

4. **Run**

   ```bash
   mvn spring-boot:run
   ```

   Open [http://localhost:8080](http://localhost:8080)

## API

### `GET /api/health`

Returns `{ "status": "ok" }`.

### `POST /api/contact`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello!"
}
```

Success: `201` with `{ "success": true, "message": "..." }`

## Customize content

Edit `src/main/resources/static/index.html` for your name, bio, education, skills, projects, and social links.

## Project structure

```
src/main/java/com/portfolio/     # Spring Boot backend
src/main/resources/static/       # Frontend (HTML, CSS, JS)
```
