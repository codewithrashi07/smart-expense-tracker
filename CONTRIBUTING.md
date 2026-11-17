# Contributing to Smart Expense Tracker

First off, thank you for considering contributing to Smart Expense Tracker! It's people like you that make this project such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style Guide](#code-style-guide)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Additional Notes](#additional-notes)

---

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing opinions, viewpoints, and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **Git** version control
- **MongoDB** account (for database)
- **Cloudinary** account (for image uploads)

### Fork & Clone

1. Fork the repository by clicking the "Fork" button on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-expense-tracker-.git
   cd smart-expense-tracker-
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/codewithrashi07/smart-expense-tracker-.git
   ```

---

## Development Setup

### 1. Install Dependencies

**Backend Setup:**
```bash
cd server
npm install
```

**Frontend Setup:**
```bash
cd ../client
npm install
```

### 2. Environment Configuration

**Backend (.env):**
```bash
cd server
# Create .env file
cp .env.example .env
```

Fill in your variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env):**
```bash
cd ../client
# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
EOF
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Both should be running on their respective ports (5000 and 5173).

---

## Making Changes

### Create a Feature Branch

Always create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**
- `feature/add-xyz` - for new features
- `fix/bug-description` - for bug fixes
- `docs/update-readme` - for documentation
- `refactor/component-name` - for refactoring
- `test/test-description` - for tests

### Keep Your Branch Updated

Before starting work, ensure your branch is up to date:

```bash
git fetch upstream
git rebase upstream/main
```

---

## Commit Guidelines

We follow conventional commit format for clear, semantic commits.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, etc.

### Examples

```bash
# Good commits
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(dashboard): resolve chart rendering issue on mobile"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): simplify transaction controller logic"
git commit -m "test(auth): add JWT validation tests"
```

### Writing Good Commit Messages

1. **Use imperative mood** ("add feature" not "added feature")
2. **Be specific** (avoid vague messages)
3. **Reference issues** (e.g., "fixes #123")
4. **Keep subject under 50 characters**
5. **Add detailed explanation if needed**

---

## Pull Request Process

### Before Submitting

1. ✅ Update your local repository:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. ✅ Test your changes thoroughly
3. ✅ Ensure code style is consistent
4. ✅ Update documentation if needed
5. ✅ Add/update tests for new features

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to GitHub and create a Pull Request
3. Fill out the PR template completely:
   - Clear title and description
   - Reference related issues
   - Add screenshots if UI changes
   - List breaking changes if any

### PR Template

```markdown
## 📝 Description
Brief description of what this PR does.

## 🎯 Type of Change
- [ ] Bug fix (fixes issue #...)
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 📸 Screenshots (if applicable)
Add screenshots for UI changes.

## ✅ Testing
- [ ] Tested on local environment
- [ ] All tests pass
- [ ] No console errors

## 📋 Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)
```

### PR Review Process

- Maintainers will review your PR within 2-3 days
- Address feedback and make requested changes
- Once approved, your PR will be merged!

---

## Code Style Guide

### Frontend (React/JavaScript)

```javascript
// ✅ Good
const getUserTransactions = async (userId) => {
  try {
    const response = await axios.get(`/api/transactions/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// ❌ Avoid
const getusertransactions=async(userId)=>{
const response = await axios.get(`/api/transactions/${userId}`);
return response.data;
}
```

**Rules:**
- Use **camelCase** for variables and functions
- Use **PascalCase** for components
- Use **const** by default, **let** if needed
- Use arrow functions
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use destructuring for props and objects

### Backend (Node.js/Express)

```javascript
// ✅ Good
const createTransaction = async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    
    // Validation
    if (!amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      category,
      description
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Avoid
const createTransaction = (req, res) => {
  let transaction = new Transaction(req.body);
  transaction.save();
  res.json(transaction);
}
```

**Rules:**
- Use **camelCase** for functions and variables
- Use **async/await** instead of callbacks
- Always handle errors with try-catch
- Use meaningful variable names
- Add validation for all inputs
- Return appropriate HTTP status codes
- Add JSDoc comments

### CSS/Tailwind

```jsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <span className="text-lg font-semibold text-gray-800">Amount</span>
  <span className="text-2xl font-bold text-green-600">$1,200</span>
</div>

// ❌ Avoid
<div className="flex p-4 bg-white">
  <span>Amount</span>
  <span>$1,200</span>
</div>
```

**Rules:**
- Use Tailwind classes consistently
- Follow a mobile-first approach
- Use semantic class names
- Keep responsive design in mind
- Avoid inline styles

---

## Testing

### Running Tests

```bash
# Backend tests
cd server
npm run test

# Frontend tests
cd ../client
npm run test
```

### Writing Tests

```javascript
// Example: Jest test for authentication
describe('Authentication Controller', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should not register user with existing email', async () => {
    // Test implementation
  });
});
```

### Test Guidelines

- ✅ Write tests for new features
- ✅ Aim for 80%+ code coverage
- ✅ Test edge cases and error scenarios
- ✅ Use descriptive test names
- ✅ Keep tests focused and isolated

---

## Reporting Bugs

### Before Submitting a Bug Report

- Check the [Issues](https://github.com/codewithrashi07/smart-expense-tracker-/issues) to see if the bug has been reported
- Check the documentation and FAQ
- Try to reproduce the bug consistently

### How to Submit a Good Bug Report

Use the bug report template:

```markdown
## 🐛 Bug Description
Clear and concise description of what the bug is.

## 📍 Location
Where did this occur? (e.g., Dashboard, Transaction page, etc.)

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## 🤔 Expected Behavior
What you expected to happen.

## 😞 Actual Behavior
What actually happened.

## 💻 Environment
- OS: [e.g. Windows 10, macOS]
- Browser: [e.g. Chrome, Firefox]
- Node version: [e.g. 16.0.0]

## 📸 Screenshots
If applicable, add screenshots.

## 📋 Additional Context
Any other context.
```

---

## Suggesting Enhancements

### Before Submitting a Suggestion

- Check if it's already been suggested
- Review the [Future Improvements](README.md#-future-improvements) section

### How to Submit a Good Enhancement

```markdown
## 💡 Suggestion Description
Brief description of the enhancement.

## 🎯 Current Problem
Why do we need this? What problem does it solve?

## 💭 Proposed Solution
How should this be implemented?

## 📌 Alternatives
Are there alternative solutions or features you considered?

## 📋 Additional Context
Any other context or examples.
```

---

## Additional Notes

### Project Structure

```
smart-expense-tracker-/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   └── utils/       # Utility functions
│   └── package.json
├── server/              # Express backend
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── package.json
└── README.md
```

### Key Files to Know

- **Frontend Entry:** `client/src/main.jsx`
- **Backend Entry:** `server/server.js`
- **Database Models:** `server/models/`
- **API Routes:** `server/routes/`
- **Main Components:** `client/src/components/`

### Common Commands

```bash
# Start development
npm run dev              # Both client and server

# Format code
npm run format           # Frontend
npm run lint             # Backend

# Build for production
npm run build            # Frontend
npm run build:server     # Backend (if available)

# Run tests
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
```

### Getting Help

- 💬 Check [Discussions](https://github.com/codewithrashi07/smart-expense-tracker-/discussions)
- 📧 Email: rashiyadav684@email.com
- 📚 Read the [Documentation](README.md)
- 🐛 Search existing [Issues](https://github.com/codewithrashi07/smart-expense-tracker-/issues)

---

## 🎉 Thank You!

Your contributions help make this project better for everyone. We appreciate your effort and look forward to working with you!

**Happy Coding!** 🚀
