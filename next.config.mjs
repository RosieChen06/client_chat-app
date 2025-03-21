// next.config.mjs
import path from 'path';

const nextConfig = {
  webpack(config) {
    config.optimization.splitChunks = {
      // 設定哪些模塊應該進行拆分
      chunks: 'all', // 拆分所有模組，包括同步、異步模組
      maxInitialRequests: 5, // 限制初始請求數量，避免一次請求過多文件
      minSize: 30000, // 拆分模塊的最小大小 (字節)，這樣可以避免拆分過小的文件
      cacheGroups: {
        // 這裡設置如何拆分特定的第三方庫
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 只拆分 node_modules 中的庫
          name: 'vendors', // 給拆分出來的庫命名
          chunks: 'all', // 拆分所有模組
        },
        default: {
          minChunks: 2, // 預設會將最少被 2 次以上引用的模塊拆分出來
          priority: -20, // 設置拆分的優先級
          reuseExistingChunk: true, // 盡量重用已有的模塊，避免重複載入
        },
      },
    };

    return config;
  },
};

export default nextConfig;