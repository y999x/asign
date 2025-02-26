import { appDefuConfig, cliDefuConfig } from '@asign/build/tsup'
import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

export default defineConfig([
  {
    ...appDefuConfig,
    entry: ['index.ts'],
    external: Object.keys(dependencies),
  },
  {
    entry: ['index.ts'],
    ...cliDefuConfig,
  },
])
