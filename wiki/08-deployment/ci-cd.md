# CI/CD Pipeline

Re:Earth CMS uses **GitHub Actions** for continuous integration and deployment. The pipeline consists of 16 workflow files covering testing, building, and deploying all components.

## Workflow Files

| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | PR, push to `main` | Orchestrates CI checks |
| `ci_server.yml` | Changes to `server/` | Go server tests |
| `ci_web.yml` | Changes to `web/` | Frontend tests and build |
| `ci_worker.yml` | Changes to `worker/` | Worker tests |
| `build_server.yml` | Push to `main`, release tag | Build and push server image |
| `build_web.yml` | Push to `main`, release tag | Build and push web image |
| `build_worker.yml` | Push to `main`, release tag | Build and push worker image |
| `build_copier.yml` | Push to `main`, release tag | Build and push copier image |
| `build_decompressor.yml` | Push to `main`, release tag | Build and push decompressor image |
| `stage.yml` | Manual dispatch (from `main`) | Merge main → release branch |
| `release.yml` | Manual dispatch (from `release`) | Generate changelog, create git tag |
| `deploy_test.yml` | Push to `main` | Deploy to test/staging environment |
| `deploy_aws.yml` | Push tags | Deploy to AWS environment |
| `e2e_web.yml` | PR, push | Run Playwright E2E tests |
| `pr.yml` | Pull request | PR-specific checks |
| `cleanup-pr-revision.yml` | PR close | Clean up PR preview environments |

---

## Change Detection

The pipeline uses `step-security/changed-files` to detect which components were modified. Only affected workflows run:

- Changes to `server/` → triggers server CI and build
- Changes to `web/` → triggers web CI and build
- Changes to `worker/` → triggers worker CI and build

This avoids running the full pipeline on every commit.

---

## Multi-Architecture Builds

Docker images are built for **both** `linux/amd64` and `linux/arm64`:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: |
      reearth/reearth-cms:nightly
      reearth/reearth-cms:${{ github.sha }}
```

---

## Image Tagging

| Trigger | Tags Applied |
|---|---|
| Push to `main` | `nightly`, `<sha>` |
| Pull request | `pr-<number>` |
| Release tag `vX.Y.Z` | `vX.Y.Z`, `latest` |

---

## Release Process

The release flow is a two-step manual process:

### Step 1: Stage (main → release)

Run the `stage.yml` workflow from the `main` branch:
1. Merges `main` → `release` branch
2. Resolves conflicts using `theirs` strategy (main wins)
3. Pushes the updated `release` branch

### Step 2: Release (release → tagged)

Run the `release.yml` workflow from the `release` branch:
1. Generates `CHANGELOG.md` using the `reearth/changelog-action`
2. Creates a git commit with the changelog
3. Creates a git tag (`vX.Y.Z`)
4. Pushes the tag and release branch
5. Cherry-picks the changelog commit back to `main`

**Version bump options:** `patch`, `minor`, or `major`.

---

## Security: Harden Runner

All workflows use `step-security/harden-runner` with `egress-policy: audit` to detect and log unexpected network access during CI runs:

```yaml
- name: Harden Runner
  uses: step-security/harden-runner@...
  with:
    egress-policy: audit
```

---

## PR Preview Environments

When a pull request is opened, the pipeline:
1. Builds images tagged as `pr-<number>`
2. Deploys a preview environment to Cloud Run
3. Posts the preview URL as a PR comment

When the PR is closed or merged, the `cleanup-pr-revision.yml` workflow deletes the preview environment.

---

## E2E Tests in CI

End-to-end tests run in CI using Playwright:

```yaml
# e2e_web.yml
- name: Run E2E tests
  run: yarn e2e
  env:
    REEARTH_CMS_E2E_BASEURL: ${{ vars.E2E_BASE_URL }}
    REEARTH_CMS_E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
    REEARTH_CMS_E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

The `@smoke` tag marks critical path tests that always run in CI. Full E2E suites run on scheduled builds.

---

## Required Secrets and Variables

Set these in your GitHub repository/organization settings:

| Name | Type | Description |
|---|---|---|
| `GH_APP_PRIVATE_KEY` | Secret | GitHub App private key (for branch protection bypass) |
| `GH_APP_ID` | Variable | GitHub App ID |
| `GH_APP_USER` | Variable | GitHub App username |
| `E2E_USERNAME` | Secret | E2E test user email |
| `E2E_PASSWORD` | Secret | E2E test user password |
| `E2E_BASE_URL` | Variable | Base URL for E2E tests |
| `CODECOV_TOKEN` | Secret | Codecov upload token |
| GCP credentials | Secret | For GCP deployments (via Workload Identity Federation) |
