import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export function nodePolyfills() {
  return {
    name: 'vite-plugin-node-polyfills',
    configureServer() {
      // Tùy chọn thiết lập cho dev server
    },
    config(config) {
      // Thêm plugin esbuild
      if (!config.optimizeDeps) config.optimizeDeps = {};
      if (!config.optimizeDeps.esbuildOptions) config.optimizeDeps.esbuildOptions = {};
      if (!config.optimizeDeps.esbuildOptions.plugins) config.optimizeDeps.esbuildOptions.plugins = [];

      config.optimizeDeps.esbuildOptions.plugins.push(
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      );

      // Cấu hình bundle build
      if (!config.build) config.build = {};
      if (!config.build.rollupOptions) config.build.rollupOptions = {};
      if (!config.build.rollupOptions.plugins) config.build.rollupOptions.plugins = [];

      config.build.rollupOptions.plugins.push(rollupNodePolyFill());

      return config;
    }
  };
}
