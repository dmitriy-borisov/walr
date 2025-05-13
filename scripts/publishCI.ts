import { publish } from '@vitejs/release-scripts';

publish({
  defaultPackage: 'core',
  provenance: true,
  packageManager: 'pnpm',
});
