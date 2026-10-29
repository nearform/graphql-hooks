#!/usr/bin/env bash
# Lerna finds the previous release with `git describe` without --tags, so it ignores lightweight tags.
set -euo pipefail

tag_name="$1"
target_sha="$2"
ref_path="repos/${GITHUB_REPOSITORY}/git/ref/tags/${tag_name}"
lookup_error="$(mktemp)"

if existing_ref="$(gh api "$ref_path" 2> "$lookup_error")"; then
  object_type="$(jq -r '.object.type' <<< "$existing_ref")"
  object_sha="$(jq -r '.object.sha' <<< "$existing_ref")"
  if [ "$object_type" != "tag" ]; then
    echo "Tag ${tag_name} exists but is lightweight, which Lerna ignores. Delete it and re-run." >&2
    exit 1
  fi
  tagged_sha="$(gh api "repos/${GITHUB_REPOSITORY}/git/tags/${object_sha}" | jq -r '.object.sha')"
  if [ "$tagged_sha" != "$target_sha" ]; then
    echo "Tag ${tag_name} already points at ${tagged_sha}, not ${target_sha}. Leaving it alone." >&2
    exit 1
  fi
  echo "${tag_name} is already tagged at ${target_sha}"
elif grep -q 'HTTP 404' "$lookup_error"; then
  tag_object_sha="$(gh api --method POST "repos/${GITHUB_REPOSITORY}/git/tags" \
    -f tag="$tag_name" -f message="$tag_name" -f object="$target_sha" -f type=commit | jq -r '.sha')"
  gh api --method POST "repos/${GITHUB_REPOSITORY}/git/refs" \
    -f ref="refs/tags/${tag_name}" -f sha="$tag_object_sha" > /dev/null
  echo "Created annotated tag ${tag_name} at ${target_sha}"
else
  cat "$lookup_error" >&2
  exit 1
fi
