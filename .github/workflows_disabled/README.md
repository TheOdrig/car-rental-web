# Disabled workflows

This project does not use hosted CI. The checks run locally through `scripts/verify.sh` (`scripts/verify.ps1` on Windows) and the `.husky/pre-push` hook, which runs `verify.sh --fast`.

The folder holds one retired GitHub Actions workflow, `architecture-verification.yml`. It does not run, because GitHub only reads `.github/workflows/`. It is older than the local gate and is not equivalent to it: it runs lint, the type check, the architecture tests and coverage, but not the contract check, the dependency audit, the build, the Node version check or the tracked-file guard that `verify.sh` runs.

To use it again, move it to `.github/workflows/` and bring its steps in line with `scripts/verify.sh` first.
