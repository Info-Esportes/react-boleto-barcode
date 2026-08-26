#!/usr/bin/env bash
#
# Builds the package and publishes it to an orphan branch named after the current
# package.json version (e.g. "0.1.0"), containing only dist/, package.json, README.md
# and LICENSE - no source, no tests, no tooling config. That branch is what npm/pnpm
# install from a git URL, or `npm publish`, actually consumes.
#
# Usage: ./scripts/release.sh
# Must be run from a clean working tree on main.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "main" ]]; then
  echo "Must be run from main (currently on $current_branch)." >&2
  exit 1
fi

version="$(node -p "require('./package.json').version")"
release_branch="$version"

echo "Building version $version..."
npm run build

staging_dir="$(mktemp -d)"
cp -r dist "$staging_dir/dist"
cp package.json README.md LICENSE "$staging_dir/"

if git show-ref --verify --quiet "refs/heads/$release_branch"; then
  git branch -D "$release_branch"
fi

git checkout --orphan "$release_branch"
git rm -rf --quiet .

cp -r "$staging_dir"/. .
rm -rf "$staging_dir"

git add dist package.json README.md LICENSE
git commit -m "Release $version"
git push --force origin "$release_branch"

git checkout main

echo "Published $version to branch '$release_branch'."
