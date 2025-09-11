# Node.js Version Standard

## Project Standard: Node.js 20.x

This project uses **Node.js 20.x** across all environments to ensure consistency and prevent deployment issues.

## Configuration Files

### 1. Local Development
- **File**: `.nvmrc`
- **Version**: `20`
- **Usage**: `nvm use` or `nvm install`

### 2. Elastic Beanstalk
- **File**: `backend/.platform/nodejs.config`
- **Setting**: `NodeVersion: 20.x`
- **Purpose**: EB runtime environment

### 3. GitHub Actions
- **Files**: 
  - `.github/workflows/deploy-backend.yml`
  - `.github/workflows/ci.yml`
- **Setting**: `node-version: '20.x'`
- **Purpose**: CI/CD pipeline consistency

### 4. Package.json Engines (Optional)
- **File**: `package.json` and `backend/package.json`
- **Setting**: `"engines": { "node": ">=20.0.0" }`
- **Purpose**: Enforce minimum version

## Deployment Checklist

Before deploying, verify:
- [ ] `.nvmrc` contains `20`
- [ ] `backend/.platform/nodejs.config` has `NodeVersion: 20.x`
- [ ] GitHub Actions workflows use `node-version: '20.x'`
- [ ] Local development uses Node 20 (`node --version`)
- [ ] EB environment shows Node 20 in logs

## Troubleshooting Version Mismatches

### Symptoms
- 502 Bad Gateway errors
- Health check failures
- Package compatibility issues
- Deployment failures

### Solutions
1. Update all config files to Node 20.x
2. Redeploy EB environment
3. Clear npm cache: `npm cache clean --force`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

## Why Node 20?
- **LTS Support**: Long-term support until April 2026
- **Performance**: Better than Node 18, more stable than Node 22
- **AWS Compatibility**: Fully supported on Elastic Beanstalk
- **Package Ecosystem**: Excellent compatibility with current dependencies

---

**Last Updated**: January 2025  
**Maintainer**: RT Dynamic BC Development Team