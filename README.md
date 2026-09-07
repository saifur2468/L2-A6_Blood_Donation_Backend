# 🩸 Blood Donation Platform - Backend API

A robust RESTful API backend built for managing blood donation requests, donor records, and automated payment processing with digital PDF receipt generation.

---

##  Key Features

* **JWT Authentication & Authorization:** Secure user authentication with role-based access control (Admin, Patient, Donor).
* **Stripe Payment Integration:** Automated support payment checkout flow using Stripe Webhooks.
* **PDF Receipt Generation:** Dynamic creation of payment receipts using `PDFKit` rendered directly from memory buffers.
* **Cloudinary Storage:** Automated receipt upload to Cloudinary with structured `raw` file storage.
* **Database Management:** Strongly typed relational database schemas powered by **Prisma ORM** and **PostgreSQL**.
* **Production Ready:** Configured for seamless deployment on platforms like **Vercel** with environment-driven routing.

---
## ERD 
https://drawsql.app/teams/saif-rahmamn/diagrams/blood-donation
---
##  Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js (TypeScript)
* **ORM:** Prisma ORM
* **Database:** PostgreSQL
* **Payment Gateway:** Stripe API
* **PDF Generation:** PDFKit
* **Cloud File Storage:** Cloudinary

---

##  Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) database
* [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook testing)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/your-username/blood-donation-backend.git](https://github.com/your-username/blood-donation-backend.git)
cd blood-donation-backend
npm install
