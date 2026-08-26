#!/usr/bin/env bash
#
# Cuts a release: tags the current commit on main as "vX.Y.Z" and pushes it, which triggers
# the "Publish" GitHub Actions workflow (build + npm publish + GitHub release). The tag must
# live on main's history - not on a dist-only commit - because a tag-triggered workflow only
# runs if the workflow file exists in the pushed ref's own tree, and main is the only place
# .github/workflows/publish.yml exists.
#
# Also force-pushes a dist-only major-version branch (e.g. "0.x"), containing just dist/,
# package.json, README.md and LICENSE - an additional install channel (e.g.
# `npm install github:org/repo#0.x`) alongside the npm registry, not required for publishing.
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

main_commit="$(git rev-parse HEAD)"

git tag -a "$tag" -m "Release $version" "$main_commit"
git push origin "$tag"

echo "Pushed $tag on main - the Publish workflow will build, publish to npm, and create the GitHub release."

echo "Building version $version for the '$release_branch' dist branch..."
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

echo "Published $version: tag '$tag' (npm, via CI) and branch '$release_branch' (dist-only, via git)."
