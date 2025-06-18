import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom', // 确保使用 jsdom 测试环境
      exclude: [...configDefaults.exclude, 'e2e/**'], // 排除 e2e 测试文件
      root: fileURLToPath(new URL('./', import.meta.url)), // 确保 root 路径正确
    },
  })
)
