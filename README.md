# ⚙️ Fulcrum — Scalable E-Commerce Platform

**Fulcrum** is a production-inspired **e-commerce backend platform** designed to demonstrate **senior-level backend engineering**, focusing on **correctness, scalability, reliability, and real-world payment workflows**.

The name *Fulcrum* reflects the system’s role as the **central control point** that enables distributed commerce operations — orders, payments, external gateways, and real-time client updates — to move safely and efficiently.

---

## 📌 High-Level Architecture

Fulcrum is built around **real-world system constraints**:

- Payments are **asynchronous**
- External payment gateways are **event-driven**
- Backend is the **single source of truth**
- Frontend receives **real-time updates**
- All state transitions are **strictly controlled**

### Architecture Overview

Client
↓
REST API (Node.js / Express)
↓
Order & Payment Services
↓
MongoDB (Transactions & Indexes)
↓
Payment Gateway (Stripe)
↓
Webhook Listener
↓
Payment Worker
↓
Order State Update
↓
Socket.IO → Client (Real-time updates)

---

## 🏗️ Core Engineering Principles

Fulcrum intentionally applies **industry-grade software engineering principles**:


- Clean Architecture & Separation of Concerns
- SOLID principles
- Explicit state machines
- Idempotent APIs
- Atomic transactions
- Defensive programming
- Secure-by-default design
- Asynchronous, event-driven workflows
- Scalable and extensible codebase

---

## 🔄 Order Lifecycle (State Machine)

Orders follow a strictly enforced lifecycle:

CREATED → PAID → SHIPPED → CANCELLED

- No skipped states
- No invalid transitions
- No double payment
- Enforced at service layer

---

## 💳 Payment Processing Model

Payments are **asynchronous by design**, mirroring real-world gateways such as Stripe.

1. Order is created
2. Checkout session is created with Stripe
3. User completes payment via Stripe-hosted UI
4. Stripe emits webhook events
5. Backend validates and processes webhook
6. Payment is confirmed atomically
7. Order state is updated
8. Client receives real-time status update

Frontend redirects are **never trusted** as payment confirmation.

---

## 🔐 Payment Safety Guarantees

### Idempotency
- Duplicate payment attempts are safely rejected
- MongoDB partial unique indexes prevent race conditions
- Webhook handlers are idempotent

### Atomicity
- Payment confirmation and order update occur in a single transaction
- Partial or inconsistent states are impossible

---

## 🔔 Webhooks (Source of Truth)

- Webhooks are authoritative
- Designed to handle retries safely
- Fast acknowledgment with reliable backend processing
- Decoupled from frontend UX

---

## ⚡ Real-Time Client Updates

Fulcrum uses **Socket.IO** to push real-time updates:

- Payment processing status
- Success or failure notifications
- No polling
- Low latency, scalable UX

---

## 🧩 Project Structure

src/
├── config/
├── middlewares/
├── models/
├── modules/
│ ├── auth
│ ├── orders
│ ├── payments
├── services/
├── workers/
├── socket/
├── routes/
├── utils/

---

## 🛡️ Security Considerations

### Implemented
- JWT-based authentication
- Authorization at service layer
- Input validation and sanitization
- Secure error handling

### Planned Enhancements
- Request size limits
- Brute-force protection (rate limiting)
- Anti-CSRF tokens
- HTTP parameter pollution prevention
- NoSQL injection protection
- Strict response shaping
- Centralized security middleware

---

## 🐳 Dockerization (Planned)

- Dockerized Node.js service
- MongoDB container
- Environment-based configuration
- Reproducible development and production environments

---

## 🚀 CI/CD Pipeline (Planned)

- Automated testing
- Linting and formatting
- Docker image builds
- Deployment using:
  - Travis CI
  - AWS Elastic Beanstalk
- Zero-downtime deployment strategy

---

## 📈 Observability & Reliability (Planned)

- Structured logging
- Metrics collection
- Health checks
- Graceful shutdown handling

---

## 🧪 Testing Strategy (Planned)

- Unit tests for domain services
- Integration tests for APIs
- Webhook simulation tests
- Concurrency and race-condition testing

---

## 🔮 Future Features

- Stripe integration ✅
- Response compression
- Refunds and partial refunds
- Multiple payment providers
- Shipment tracking
- Admin dashboard
- Background queues (RabbitMQ / SQS)
- Redis caching
- Role-based access control (RBAC)
- Payment reconciliation jobs

---

## 🎯 Project Purpose

Fulcrum is **not a tutorial project**.

It is a **platform-oriented system** designed to demonstrate:
- Real-world backend architecture
- Correctness under concurrency
- Reliability under failure
- Scalability-ready architecture
- Asynchronous workflows
- Senior-level engineering decisions

---

## 👨‍💻 Author

**Ahmad Said Nouh**  
Software Engineer — Backend & Distributed Systems