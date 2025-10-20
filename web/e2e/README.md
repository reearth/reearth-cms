# E2E Testing

End-to-end testing suite for Reearth CMS using Playwright and the Page Object Model (POM) pattern.

## 📋 Prerequisites

- Node.js and Yarn installed
- Reearth CMS backend and frontend running locally
- Environment variables configured (see Configuration section)

## 🚀 Quick Start

### Install Dependencies

```bash
yarn install
```

### Run Tests

```bash
# Run all tests
yarn e2e

# Run specific test file
yarn playwright test tests/project/schema.spec.ts

# Run tests in UI mode (interactive)
yarn playwright test --ui

# Run tests in debug mode
yarn playwright test --debug

# Run tests in headed mode (see browser)
yarn playwright test --headed

# List all tests
yarn playwright test --list
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with:

```env
REEARTH_CMS_E2E_BASEURL=http://localhost:3000
REEARTH_CMS_E2E_EMAIL=your-email@example.com
REEARTH_CMS_E2E_PASSWORD=your-password
```

### Playwright Configuration

Configuration is defined in `web/playwright.config.ts`. Key settings:

- **Base URL**: Configured via `REEARTH_CMS_E2E_BASEURL` environment variable
- **Browser**: Chromium (default)
- **Parallel execution**: Enabled
- **Retries**: Configured for CI/local environments
- **Timeout**: 30 seconds per test

## 📁 Project Structure

```
web/e2e/
├── config/              # Configuration files
├── fixtures/            # Custom Playwright fixtures
├── helpers/             # Utility functions
├── pages/               # Page Object Models
├── support/             # Authentication setup
└── tests/               # Test specifications
```

For detailed structure documentation, see [claude.md](./claude.md).

## 🎯 Page Object Model (POM)

This project follows the Page Object Model design pattern:

- **Page Objects** (`pages/`) - Encapsulate page elements and interactions
- **Fixtures** (`fixtures/`) - Provide page objects to tests automatically
- **Tests** (`tests/`) - Contain test logic using page objects

### Example Test

```typescript
import { expect, test } from "@reearth-cms/e2e/fixtures/test";
import { getId } from "@reearth-cms/e2e/helpers/mock.helper";

test("Create and delete project", async ({ projectPage }) => {
  const projectName = getId();

  // Create project
  await projectPage.createProject(projectName);
  await expect(projectPage.getByText(projectName)).toBeVisible();

  // Delete project
  await projectPage.deleteProject();
});
```

## 📝 Writing Tests

### Best Practices

1. **Use Page Objects** - Don't interact with the DOM directly in tests
2. **Use Fixtures** - Page objects are injected automatically
3. **Generate Unique Data** - Use `getId()` helper for unique test data
4. **Use E2E Imports** - Always import from `@reearth-cms/e2e/*`
5. **Clean Up** - Use `beforeEach`/`afterEach` for setup and teardown

### Example with Setup/Teardown

```typescript
test.describe("Model Tests", () => {
  let projectName: string;

  test.beforeEach(async ({ projectPage, schemaPage }) => {
    projectName = getId();
    await projectPage.createProject(projectName);
    await projectPage.gotoProject(projectName);
  });

  test.afterEach(async ({ projectPage }) => {
    await projectPage.deleteProject();
  });

  test("Create model", async ({ schemaPage }) => {
    await schemaPage.createModelFromSidebar("My Model", "my-model");
    await expect(schemaPage.getByText("My Model")).toBeVisible();
  });
});
```

## 🧪 Test Organization

Tests are organized by domain:

- **`tests/auth/`** - Authentication tests
- **`tests/project/`** - Project, schema, content, assets, items
- **`tests/settings/`** - Settings and account management
- **`tests/workspace/`** - Workspace management

## 🔧 Debugging Tests

### Using Playwright Inspector

```bash
yarn playwright test --debug
```

### Using UI Mode

```bash
yarn playwright test --ui
```

### View Test Report

```bash
yarn playwright show-report
```

### Using VS Code Extension

Install the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension for:

- Running tests from the editor
- Debugging with breakpoints
- Viewing test results inline

## 🛠️ Common Commands

```bash
# Install Playwright browsers
npx playwright install

# Update snapshots
yarn playwright test --update-snapshots

# Run tests matching a pattern
yarn playwright test -g "create project"

# Run tests in a specific file
yarn playwright test schema.spec.ts

# Run tests in headed mode
yarn playwright test --headed

# Generate test code
npx playwright codegen http://localhost:3000
```

## 🤝 Contributing

When adding new tests:

1. Create or update the appropriate page object
2. Register the page object in `fixtures/test.ts`
3. Write tests using the page object
4. Follow the existing patterns and conventions

See [claude.md](./claude.md) for detailed contribution guidelines.

## 🐛 Troubleshooting

### Tests Failing Locally

- Ensure backend and frontend are running
- Check environment variables are set correctly
- Clear browser state: `rm -rf web/e2e/support/.auth/`
- Update Playwright browsers: `npx playwright install`

### Authentication Issues

- Verify credentials in `.env` file
- Delete auth state: `rm -rf web/e2e/support/.auth/user.json`
- Re-run auth setup: `yarn playwright test support/auth.setup.ts`

### Timeout Errors

- Increase timeout in test: `test.setTimeout(60000)`
- Check if backend is responding slowly
- Run with headed mode to see what's happening
