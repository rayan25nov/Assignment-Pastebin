# Pastebin Lite

A simple pastebin-like application where users can create text pastes with optional expiry constraints and share them via unique URLs.

## Features

- Create text pastes with shareable URLs
- Optional time-based expiry (TTL in seconds)
- Optional view count limits
- RESTful API endpoints
- Clean and responsive web interface
- Deterministic time testing support for automated tests

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (via Mongoose)
- **Deployment**: Vercel-ready

## Persistence Layer

This application uses **MongoDB** as its persistence layer via Mongoose ODM. Each paste is stored as a document with the following schema:

- `content`: The paste text content
- `createdAt`: Timestamp (milliseconds) when the paste was created
- `ttlSeconds`: Optional time-to-live in seconds
- `maxViews`: Optional maximum view count
- `viewCount`: Current number of views (incremented atomically)

MongoDB was chosen for its flexibility, ease of deployment with MongoDB Atlas, and native support for atomic operations needed for view counting.

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)

## Folder Structure

```
└── 📁assignment
    └── 📁src
        └── 📁db
            ├── config.ts
        └── 📁models
            ├── paste.model.ts
        └── 📁public
            ├── index.html
            ├── view.html
        └── 📁routes
            ├── health.route.ts
            ├── paste.route.ts
        └── 📁utils
            ├── time.ts
        ├── index.ts
    ├── .env
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── pastebin.postman_collection.json
    ├── Readme.md
    └── tsconfig.json
```
