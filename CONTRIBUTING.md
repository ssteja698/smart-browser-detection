# Contributing to Enhanced Browser Detection

Thank you for your interest in contributing to Enhanced Browser Detection! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📋 Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/enhanced-browser-detection.git
cd enhanced-browser-detection

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## 🧪 Testing

We use Jest for testing. All new features should include comprehensive tests.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- test/enhanced-browser-detection.test.js
```

### Test Structure

- **Unit Tests**: Test individual methods and functions
- **Integration Tests**: Test how different methods work together
- **Browser Environment Tests**: Test detection in different browser environments
- **Spoofing Tests**: Test anti-spoofing capabilities

## 📝 Code Style

We use ESLint and Prettier for code formatting. Please ensure your code follows our style guidelines:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
```

### Style Guidelines

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add JSDoc comments for public methods
- Keep functions small and focused
- Write descriptive variable and function names

## 🔍 Browser Detection Guidelines

When adding new browser detection methods:

1. **Accuracy First**: Ensure high accuracy across different environments
2. **Performance**: Keep detection methods fast and efficient
3. **Anti-Spoofing**: Consider how the method can be spoofed
4. **Confidence Scoring**: Provide appropriate confidence scores
5. **Documentation**: Document the detection logic and limitations

### Adding New Detection Methods

1. Add the method to the `detectionMethods` array
2. Implement the method with proper error handling
3. Add comprehensive tests
4. Update documentation
5. Consider the impact on overall accuracy

## 📚 Documentation

When adding new features, please update:

- README.md with usage examples
- API documentation
- CHANGELOG.md with version notes
- Any relevant demo files

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Browser and Version**: What browser you're using
2. **Operating System**: Your OS and version
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Steps to Reproduce**: Clear steps to reproduce the issue
6. **Code Example**: Minimal code example if applicable

## 💡 Feature Requests

When requesting features, please include:

1. **Use Case**: Why you need this feature
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Any alternatives you've considered
4. **Impact**: How this affects other users

## 🔄 Pull Request Process

1. **Fork and Clone**: Fork the repository and clone your fork
2. **Create Branch**: Create a feature branch for your changes
3. **Make Changes**: Implement your changes with tests
4. **Test**: Run the full test suite
5. **Lint**: Ensure code passes linting
6. **Commit**: Write clear commit messages
7. **Push**: Push your changes to your fork
8. **Pull Request**: Create a PR with a clear description

### Pull Request Guidelines

- **Title**: Clear, descriptive title
- **Description**: Explain what and why, not how
- **Tests**: Include tests for new functionality
- **Documentation**: Update relevant documentation
- **Breaking Changes**: Clearly mark any breaking changes

## 📦 Release Process

1. **Version Bump**: Update version in package.json
2. **Changelog**: Update CHANGELOG.md
3. **Tests**: Ensure all tests pass
4. **Build**: Run build process
5. **Publish**: Publish to npm

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Provide constructive feedback
- Help others learn and grow

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Email**: Contact us at support@enhanced-browser-detection.com

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Enhanced Browser Detection! 🚀 