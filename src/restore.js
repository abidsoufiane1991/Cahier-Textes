import { execSync } from 'child_process';
try {
  execSync('git checkout HEAD~1 src/constants.ts');
  console.log('Restored constants.ts');
} catch (e) {
  console.error(e);
}
