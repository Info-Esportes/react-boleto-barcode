#!/usr/bin/env bash
#
# Builds the package and publishes it to:
#   - a major-version branch (e.g. "0.x"), force-pushed with the latest dist build for
#     that line on every release within it - what a consumer tracks for "latest 0.y.z".
#   - an immutable tag (e.g. "v0.1.0") pointing at that same commit - what a consumer
#     pins to for an exact version.
#
# Both contain only dist/, package.json, README.md and LICENSE - no source, no tests,
# no tooling config.
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
major="${version%%.*}"
release_branch="${major}.x"
tag="v${version}"

if git rev-parse "refs/tags/$tag" >/dev/null 2>&1; then
  echo "Tag $tag already exists - bump the version in package.json first." >&2
  exit 1
fi

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
git tag -a "$tag" -m "Release $version"
git push --force origin "$release_branch"
git push origin "$tag"

git checkout main

echo "Published $version to branch '$release_branch' and tag '$tag'."
