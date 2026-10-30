const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')
const wasmerSdkDist = path.dirname(require.resolve('@wasmer/sdk/browser'))
const wasmerSdkPkg = path.resolve(wasmerSdkDist, '..', 'pkg')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    static: { directory: path.resolve(__dirname, 'public') },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    setupMiddlewares: (middlewares) => {
      const serveStatic = require('express').static
      const setIsolationHeaders = (response) => {
        response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        response.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
      }

      middlewares.unshift(
        {
          name: 'wasmer-sdk-dist',
          path: '/wasmer-sdk/dist',
          middleware: serveStatic(wasmerSdkDist, { setHeaders: setIsolationHeaders }),
        },
        {
          name: 'wasmer-sdk-pkg',
          path: '/wasmer-sdk/pkg',
          middleware: serveStatic(wasmerSdkPkg, { setHeaders: setIsolationHeaders }),
        },
      )
      return middlewares
    },
  },
  chainWebpack: (config) => {
    config.module.rule('js').exclude.add(
      /node_modules[\\/]pyodide[\\/]pyodide\.asm\.mjs$/,
    )
  },
  configureWebpack: {
    resolve: {
      fallback: {
        child_process: false,
        crypto: false,
        fs: false,
        module: false,
        net: false,
        path: false,
        stream: false,
        tls: false,
        url: false,
        vm: false,
      },
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '')
      }),
      new CopyPlugin({
        patterns: [
          {
            from: wasmerSdkDist,
            to: 'wasmer-sdk/dist',
          },
          {
            from: wasmerSdkPkg,
            to: 'wasmer-sdk/pkg',
          },
          {
            from: path.resolve(
              path.dirname(require.resolve('pyodide/package.json')),
              'pyodide.asm.mjs',
            ),
            to: 'pyodide/pyodide.asm.mjs',
          },
          {
            from: path.resolve(
              path.dirname(require.resolve('pyodide/package.json')),
              'pyodide.asm.wasm',
            ),
            to: 'pyodide/pyodide.asm.wasm',
          },
          {
            from: path.resolve(
              path.dirname(require.resolve('pyodide/package.json')),
              'python_stdlib.zip',
            ),
            to: 'pyodide/python_stdlib.zip',
          },
          {
            from: path.resolve(
              path.dirname(require.resolve('pyodide/package.json')),
              'pyodide-lock.json',
            ),
            to: 'pyodide/pyodide-lock.json',
          },
        ],
      }),
    ],
  },
})
