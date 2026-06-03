// This script runs operations *synchronously* which is normally not the best
// approach, but it keeps things simple, readable, and for now is good enough.

const { gitDescribeSync } = require('git-describe');
const { writeFileSync } = require('fs');

const fallbackGitInfo = {
  dirty: false,
  raw: 'no-git',
  hash: '0000000',
  distance: null,
  tag: null,
  semver: null,
  suffix: 'no-git',
  semverString: null
};

let gitInfo = fallbackGitInfo;

try {
  gitInfo = gitDescribeSync();
} catch {
  // Non-git environments (some CI runners, shallow clones)
}

writeFileSync('git-version.json', JSON.stringify(gitInfo, null, 2));
