# Agency Website Backend

This project is an Express.js-based backend API for an agency website. It handles user authentication, request creation, management, and various functionalities such as settings management and payments for services.

## Features

- **User Management**: 
  - Sign up, log in, and manage user accounts.
  - Update user information such as email, password, and profile details.
- **Request Creation and Management**:
  - Allows users to create and manage requests for different types of work such as design, backend, frontend, and AI.
  - Handles various attributes for requests including type, title, description, attachments, priority, and more.
- **Settings Management**: 
  - Allows users to update their account settings.
- **Payment Handling**:
  - Manages payments for different packages and applies discounts for subsequent purchases.
- **Validation**: 
  - Validates emails, numbers, and user input to ensure data integrity.

## Installation

To run this project, you'll need Node.js installed along with the following dependencies:

- `express`: A minimal and flexible Node.js web application framework.
- `cors`: A package to enable Cross-Origin Resource Sharing.
- `bcrypt`: A library to help hash passwords.
- `mongodb`: MongoDB driver for Node.js.

You can install these dependencies using npm:

```bash
npm install express cors bcrypt mongodb
