# MC STORE - E-Commerce Platform

## Project Overview

MC STORE is a modern, full-featured e-commerce platform built for the Algerian market. The application provides a complete online shopping experience with user authentication, product browsing, shopping cart functionality, wishlist management, order processing, and administrative capabilities.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Admin Dashboard](#admin-dashboard)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Responsive Design](#responsive-design)
- [Contributors](#contributors)
- [Deployment](#deployment)

## Features

### Customer Features
- **Product Browsing**: Browse products with filtering, sorting, and search functionality
- **Product Details**: View detailed product information, images, and specifications
- **User Authentication**: Register, login, and password recovery
- **Shopping Cart**: Add, update quantity, and remove items from cart 
- **Wishlist**: Save products for future reference
- **Checkout Process**: Streamlined order placement with shipping details
- **Order History**: View past orders and their statuses
- **User Profile**: Manage personal information and preferences
- **Contact Form**: Submit inquiries directly through the platform

### Administrative Features
- **Product Management**: Add, edit, delete products
- **Order Management**: Process orders, update statuses
- **User Management**: View and manage user accounts
- **Category Management**: Organize products into categories

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: Context API and local state
- **API Queries**: TanStack Query

## Project Structure

```
src/
├── app/                  # App-level configurations
├── components/           # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components (ProductCard, NavBar, etc.)
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── integrations/         # External service integrations
│   └── supabase/         # Supabase client setup
├── lib/                  # Utility libraries
├── pages/                # Application routes/pages
│   ├── admin/            # Admin dashboard pages
│   └── ...               # User-facing pages
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```sh
npm run dev
```

## Usage

### Customer Journey

1. **Browse Products**: Navigate through product categories or use the search function
2. **View Details**: Click on a product to view its details
3. **Add to Cart**: Add products to your shopping cart
4. **Checkout**: Complete the purchase by providing shipping and payment information
5. **Track Orders**: View your order history and current order status

### Key User Flows

- **Authentication**: Register/Login using email and password
- **Product Search**: Use the search bar in the navigation menu (visible only on the products page)
- **Shopping Cart**: Access via the cart icon in the navigation bar
- **User Profile**: Access via the user icon dropdown menu

## Admin Dashboard

The admin dashboard is accessible at `/admin/products`, `/admin/orders`, and `/admin/users` routes for administrators. It provides interfaces for:

- **Product Management**: Add new products, edit existing ones, manage inventory
- **Order Processing**: View incoming orders, update order status, track fulfillment
- **User Administration**: View user accounts and manage permissions

## Authentication

The application uses Supabase Authentication for secure user management:

- **Registration**: Email and password-based signup
- **Login**: Secure authentication
- **Password Reset**: Self-service password recovery flow
- **Role-Based Access**: Admin vs regular user permissions

## Database Schema

The application uses the following data models:

- **Products**: Product information including name, description, price, and inventory status
- **Categories**: Product categorization
- **Users/Profiles**: User account information and preferences
- **Orders**: Purchase history and fulfillment status
- **Order Items**: Individual items within orders
- **Cart Items**: Temporary shopping cart storage
- **Wishlist Items**: Saved products for users

## API Integration

The application integrates with Supabase for all backend functionality:

- **Authentication API**: User management
- **Database API**: CRUD operations for products, orders, etc.
- **Storage API**: Product image management

## Responsive Design

The application is fully responsive, providing an optimal experience on:

- Desktop browsers
- Tablets
- Mobile devices

## Contributors

This project was developed by Team MC STORE:
- Bouziani Alaa Eddine 
- Benhadjer Mohamed
- Hachelaf Abdelbasset

## Deployment

You can deploy this project using Vercel, Netlify or any other hosting provider that supports React applications.

1. **Build the application**:
```sh
npm run build
```

2. **Deploy options**:
- Vercel
- Netlify
- Firebase Hosting
- GitHub Pages

For detailed deployment instructions, refer to the documentation of your chosen hosting platform.

## Custom Domain

Yes, you can use a custom domain with services like Vercel or Netlify.

---

© 2025 MC STORE - Algerian Online Shopping E-Commerce Platform
