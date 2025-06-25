# Testing Guide

This project includes comprehensive testing across different levels:

## Test Types

### 1. Unit Tests (`src/tests/unit/`)
- **Framework**: Vitest
- **Purpose**: Test individual functions and components in isolation
- **Run**: `npm run test:unit`

### 2. Integration Tests (`src/tests/integration/`)
- **Framework**: Vitest + React Testing Library
- **Purpose**: Test how different modules work together
- **Run**: `npm run test:integration`

### 3. Component Tests (`src/tests/component/`)
- **Framework**: Playwright
- **Purpose**: Test individual components in a browser environment
- **Run**: `npm run test:component`

### 4. E2E Tests (`src/tests/e2e/`)
- **Framework**: Playwright
- **Purpose**: Test complete user workflows
- **Run**: `npm run test:e2e`

## Running Tests

### Prerequisites
Make sure you have all dependencies installed:
```bash
npm install
```

### Individual Test Types

```bash
# Unit tests (fastest)
npm run test:unit

# Integration tests
npm run test:integration

# Component tests (requires browser)
npm run test:component

# E2E tests (requires development server)
npm run test:e2e
```

### Running All Tests
```bash
npm run test:all
```

### E2E Tests with Auto Server Start
```bash
# This will start the dev server and run E2E tests
npm run dev:test
```

### Manual E2E Testing
1. Start the development server:
   ```bash
   npm run dev
   ```
2. In another terminal, run E2E tests:
   ```bash
   npm run test:e2e
   ```

## Test Coverage

### Unit Tests
- Track validation logic
- Utility functions
- Business logic

### Integration Tests
- Search functionality integration
- API calls with state management
- Filter combinations
- Pagination integration

### Component Tests
- SearchInput component behavior
- User interactions
- Accessibility features
- Responsive design

### E2E Tests
- Complete user workflows
- Create, edit, delete tracks
- Search and filtering
- Pagination
- Error handling
- Responsive design
- Keyboard navigation

## Troubleshooting

### E2E Tests Failing
If E2E tests fail with connection errors:
1. Make sure your development server is running on `http://localhost:3000`
2. Check that the server is accessible
3. The tests will automatically skip if the server is not available

### Component Tests Failing
If component tests fail:
1. Make sure Playwright browsers are installed: `npx playwright install`
2. Check that the development server is running

### Integration Tests Failing
If integration tests fail:
1. Make sure all dependencies are installed
2. Check that the test environment is properly configured

## Test Structure

```
src/tests/
├── unit/           # Unit tests (Vitest)
├── integration/    # Integration tests (Vitest)
├── component/      # Component tests (Playwright)
└── e2e/           # End-to-end tests (Playwright)
```

## Best Practices

1. **Unit Tests**: Test individual functions and logic
2. **Integration Tests**: Test module interactions
3. **Component Tests**: Test UI components in isolation
4. **E2E Tests**: Test complete user workflows

## Continuous Integration

The tests are designed to run in CI/CD environments:
- Unit and integration tests run quickly
- Component tests run in headless browsers
- E2E tests can be configured to run against staging environments 