import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '14i3ppzr',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    path: './frontend/sanity/**/*.{ts,tsx,js,jsx}',
    schema: './sanity.schema.json',
    generates: './frontend/sanity.types.ts',
    overloadClientMethods: true,
  },
})
