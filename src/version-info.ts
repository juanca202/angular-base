import git from '../git-version.json';
import npmPackage from '../package.json';

export const versionInfo = (() => {
  try {
    return { npmPackage, git };
  } catch {
    // In dev the file might not exist:
    return { npmPackage: { name: '', version: '0.0.0' }, git: { raw: '' } };
  }
})();
