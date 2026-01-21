# ⚙️ Fulcrum — Scalable E-Commerce Platform

**Fulcrum** is a production-inspired **e-commerce backend platform** designed to demonstrate **senior-level backend engineering**, focusing on **correctness, scalability, reliability, and real-world payment workflows**.

The name *Fulcrum* reflects the system’s role as the **central control point** that enables distributed commerce operations — orders, payments, external gateways, and real-time client updates — to move safely and efficiently.

---

## 📌 High-Level Architecture

This system is intentionally designed around **real-world constraints**:

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

yaml
Copy code

---

## 🏗️ Core Engineering Principles

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

CREATED → PAID → SHIPPED
→ CANCELLED

yaml
Copy code

- No invalid transitions
- No double payment
- Enforced at service layer

---

## 💳 Payment Flow

Payments are processed **asynchronously**, similar to real-world gateways.

1. Order creation
2. Checkout session creation (Stripe)
3. User completes payment on Stripe
4. Stripe sends webhook event
5. Backend confirms payment atomically
6. Order is marked as PAID
7. Client receives real-time update

---

## 🔐 Payment Safety Guarantees

### Idempotency
- Duplicate payment attempts are safely rejected
- MongoDB partial unique indexes prevent race conditions
- Webhook handlers are idempotent

### Atomicity
- Payment confirmation and order update occur in a single transaction

---

## 🔔 Webhooks (Source of Truth)

- Webhooks are authoritative
- Frontend redirects are never trusted
- Payment status updates only happen via verified gateway events
- Designed to safely handle retries

---

## ⚡ Real-Time Updates

- Socket.IO is used to push payment status updates to clients
- No polling
- Immediate feedback (processing → success / failure)

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

yaml
Copy code

---

## 🛡️ Security Considerations

### Implemented
- JWT authentication
- Authorization at service layer
- Input validation
- Secure error handling

### Planned
- Request size limits
- Brute-force protection (rate limiting)
- Anti-CSRF tokens
- HTTP Parameter Pollution prevention
- NoSQL injection protection
- Strict response shaping
- Centralized security middleware

---

## 🐳 Dockerization (Planned)

- Dockerized backend service
- MongoDB container
- Environment-based configs

---

## 🚀 CI/CD Pipeline (Planned)

- Automated testing
- Linting and formatting
- Docker image builds
- Deployment using:
  - Travis CI
  - AWS Elastic Beanstalk
- Zero-downtime deployments

---

## 📈 Observability (Planned)

- Structured logging
- Metrics and monitoring
- Health checks
- Graceful shutdown handling

---

## 🧪 Testing Strategy (Planned)

- Unit tests
- Integration tests
- Webhook simulation
- Concurrency testing

---

## 🔮 Future Features

- Stripe integration ✅
- Refunds & partial refunds
- Multiple payment providers
- Shipment tracking
- Admin dashboard
- Background queues (RabbitMQ / SQS)
- Redis caching
- RBAC
- Payment reconciliation jobs

---

## 🎯 Project Purpose

This project demonstrates **real-world backend system design**, not just CRUD operations.

It focuses on:
- Correctness over shortcuts
- Reliability under failure
- Scalability-ready architecture
- Senior-level decision making

---

## 👨‍💻 Author

**Ahmad Said Nouh**  
Software Engineer — Backend & Distributed Systems  

---
