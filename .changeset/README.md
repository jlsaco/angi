# Changesets

This directory is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make a change that should be released, run:

```bash
npx changeset
```

This will prompt you to:

1. Select the package(s) affected
2. Choose the semver bump type (patch / minor / major)
3. Write a summary of the change

A markdown file will be created in this directory describing the change.
