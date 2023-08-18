import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'WaterMask',
      formats: ['es', 'umd'], // 默认['es', 'umd']
      fileName: (format) => `watermask.${format}.js` // 默认 fileName 是 package.json 的 name 选项
    },
    outDir: 'lib'
  }
})
