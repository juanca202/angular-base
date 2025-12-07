# Getting Started with Angular Base Project

**📖 [English](./getting-started.md) | [Español](../es/getting-started.md)**

This document explains how to use the Angular Base Project as a starting point for creating new projects.

## Overview

The Angular Base Project is a **boilerplate** designed to serve as the foundation for new Angular applications. It includes:

- Pre-configured architecture (Core, Shared, Features)
- Development tools and quality standards
- Best practices and conventions
- Documentation and ADRs
- Ready-to-use components and services

## Installation

**Note:** This repository is a boilerplate. It is recommended to create your own empty repository and synchronize it with the main repository.

### Main Repository

**Repository:** `angular-base-project`

### Creating Your New Project Repository

#### Step 1: Create Your Empty Repository

```bash
git init angular-app
cd angular-app
```

#### Step 2: Add the Main Repository as Upstream

```bash
git remote add upstream https://github.com/juanca202/angular-base-project.git
```

#### Step 3: Fetch Content from the Main Repository

```bash
git fetch upstream
```

#### Step 4: Merge Content from Upstream to Your Main Branch

```bash
# Make sure you're on your main branch
git checkout -b main

# Merge changes from upstream
git merge upstream/main
```

### Repository Structure

When setting up your project, you'll have two remotes:

- **`origin`** → Your copy/fork (the repository where you have write permissions)
- **`upstream`** → The original repository from which this project originates

### Synchronizing Your Local Branch with the Original

To keep your project synchronized with the original repository:

```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes into your branch
git merge upstream/main
```

## Initial Setup

After cloning or merging the base project, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Project Settings

Update the following files with your project-specific information:

- **`package.json`**: Update project name, description, and repository URL
- **`angular.json`**: Update project name if needed
- **`README.md`**: Update with your project-specific information
- **Environment files**: Configure environment variables in `src/environments/`

### 3. Update Project Metadata

- Update `src/version-info.ts` with your project information
- Update `public/manifest.webmanifest` with your app details
- Update `public/index.html` with your app title and meta tags

### 4. Configure i18n

If you need to add or modify languages:

```bash
# Extract base translations
npm run extract-i18n

# Generate language files
npm run i18n -- es  # For Spanish
```

### 5. Run the Development Server

```bash
npm run start
```

## Project Customization

### Updating Project Name

1. Update `package.json`:
   ```json
   {
     "name": "your-project-name",
     "description": "Your project description"
   }
   ```

2. Update `angular.json`:
   ```json
   {
     "projects": {
       "your-project-name": {
         ...
       }
     }
   }
   ```

3. Update `README.md` with your project information

### Removing Sample Code

The base project includes sample code in `src/app/samples/`. You can:

- Remove the entire `samples/` directory if not needed
- Use it as a reference for implementing your own features
- Keep it as a starting point for your features

### Customizing Theme

Update theme colors and styles in:
- `src/styles.scss` - Global styles
- `src/theme/` - Theme configuration files
- Tailwind configuration in `tailwind.config.js`

## Keeping Up with Base Project Updates

### Regular Synchronization

To receive updates and improvements from the base project:

```bash
# Fetch latest changes
git fetch upstream

# Review changes
git log HEAD..upstream/main

# Merge updates
git merge upstream/main
```

### Handling Conflicts

If conflicts occur during merge:

1. Review conflicts carefully
2. Resolve conflicts preserving your customizations
3. Test thoroughly after resolving conflicts
4. Commit the merge

### Best Practices

- **Keep customizations separate**: Avoid modifying core architecture files unless necessary
- **Document your changes**: Update ADRs if you make significant architectural changes
- **Test after updates**: Always test your application after merging upstream changes
- **Review changes**: Review upstream changes before merging to understand what's new

## Next Steps

1. **Review Architecture**: Read [Architecture Documentation](./README.md) to understand the project structure
2. **Read ADRs**: Review [Architectural Decision Records](./adr/README.md) to understand design decisions
3. **Set Up CI/CD**: Configure your CI/CD pipeline
4. **Configure Environments**: Set up development, staging, and production environments
5. **Add Features**: Start building your application features following the established patterns

## Troubleshooting

### Common Issues

#### Merge Conflicts

If you encounter merge conflicts:

```bash
# View conflicted files
git status

# Resolve conflicts manually
# Then stage resolved files
git add <resolved-file>

# Complete the merge
git commit
```

#### Missing Dependencies

If dependencies are missing after merge:

```bash
npm install
```

#### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Angular cache:
   ```bash
   rm -rf .angular
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

## References

- [Architecture Documentation](./README.md)
- [Architectural Decision Records (ADRs)](./adr/README.md)
- [Angular Documentation](https://angular.dev)
- [Project README](../README.md)

