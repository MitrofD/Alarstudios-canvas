'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTSCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function webpackConfig(env) {
  const appPath = path.resolve(__dirname, 'src');
  const buildPath = path.resolve(__dirname, 'build');

  const devMode = 'development';

  const mode = (function getPureMode() {
    const envMode = '' + (env.NODE_ENV || devMode);
    return envMode.toLowerCase() === devMode ? devMode : 'production';
  }());

  const isDevMode = mode === devMode;

  const jsRegExp = /\.(t|j)s$/;
  const nodeModulesPath = path.resolve(__dirname, 'node_modules');
  let publicPath = '/';

  const resolveExtensions = [
    '.coffee',
    '.js',
    '.ts',
  ];

  let showDevTool = false;

  function genGlobPatternOfExtensions(exts) {
    let rVal = null
    const pureExts = Array.isArray(exts) ? exts : [];
    const prefix = appPath + '/**/*';
    const suffix = pureExts.join(',');
    const extsLength = pureExts.length;

    if (extsLength > 1) {
      rVal = prefix + '{' + suffix + '}';
    } else if (extsLength === 1) {
      rVal = prefix + suffix;
    }

    return rVal;
  };

  const globSourceMap = isDevMode;

  const excludePaths = [
    nodeModulesPath,
  ];

  const moduleRules = [{
    test: jsRegExp,
    exclude: excludePaths,
    loader: 'babel-loader',
  }, {
    test: /\.coffee$/,
    use: [{
      loader: 'coffee-loader',
      options: {
        transpile: {
          presets: [
            '@babel/env',
          ],
        },
      },
    }],
  }, {
    test: /\.(ico|ttf|eot|woff|woff2|png|svg|gif|jpe?g)$/,
    exclude: excludePaths,
    use: [{
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]?[hash]',
      },
    }],
  }];

  const applyPlugins = [
    new DuplicatePackageCheckerPlugin({
      verbose: true,
      emitError: true,
    }),
    new webpack.DefinePlugin({
      'IS_DEV_MODE': JSON.stringify(isDevMode),
    }),
    new HTMLWebpackPlugin({
      minify: !isDevMode,
      inject: false,
      title: 'Alarstudios Canvas',
      template: './index.html',
    }),
  ];

  const cssLoaders = [];
  let localIdentName = '[hash:base64:5]';

  // Development mode
  if (isDevMode) {
    localIdentName = `[local]-${localIdentName}`;
    cssLoaders.push('style-loader');

    Array.prototype.push.apply(applyPlugins, [
      new webpack.HotModuleReplacementPlugin(),
      new ESLintPlugin({
        cache: true,
        exclude: excludePaths,
        extensions: resolveExtensions,
        threads: true,
      }),

      new ForkTSCheckerPlugin({
        async: false,
        typescript: {
          configOverwrite: {
            compilerOptions: {
              baseUrl: '.',
            },
          },
        },
      }),
    ]);

    showDevTool = 'cheap-module-source-map';
  // Production mode
  } else {
    publicPath = '.' + publicPath;
    cssLoaders.push(MiniCSSExtractPlugin.loader);

    const purgeCSSExtensions = resolveExtensions.concat([
      '.html',
    ]);

    global.purgeCSSContent = [
      genGlobPatternOfExtensions(purgeCSSExtensions),
    ];

    Array.prototype.push.apply(applyPlugins, [
      new CleanPlugin(),
      new MiniCSSExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
    ]);
  }

  cssLoaders.push({
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      modules: {
        auto: true,
        localIdentName,
      },
      sourceMap: globSourceMap,
    },
  }, {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        config: true,
      },
      sourceMap: globSourceMap,
    },
  });

  const scssLoaders = cssLoaders.slice();

  scssLoaders.push({
    loader: 'fast-sass-loader',
    options: {
      sourceMap: globSourceMap,
    },
  });

  Array.prototype.push.apply(moduleRules, [{
    test: /\.css$/,
    exclude: excludePaths,
    use: cssLoaders,
  }, {
    test: /\.s(a|c)ss$/,
    exclude: excludePaths,
    use: scssLoaders,
  }]);

  const optimizationIds = isDevMode ? 'named' : 'natural';

  return {
    mode,
    cache: {
      type: 'memory',
    },
    context: appPath,
    devtool: showDevTool,
    devServer: {
      publicPath,
      clientLogLevel: 'silent',
      hot: true,
      historyApiFallback: true,
      noInfo: true,
      open: true,
      overlay: {
        errors: true,
        warnings: false,
      },
      port: 3000,
      stats:  {
        all: undefined,
        modules: true,
        maxModules: 15,
        errors: true,
        warnings: true,
      },
    },
    optimization: {
      chunkIds: optimizationIds,
      emitOnErrors: true,
      minimize: !isDevMode,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          exclude: excludePaths,
          terserOptions: {
            mangle: true,
            warnings: false,
            compress: true,
            ie8: true,
            output: {
              comments: false,
              beautify: false,
            },
          },
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
      moduleIds: optimizationIds,
      runtimeChunk: isDevMode,
      splitChunks: {
        chunks: 'all',
      },
    },
    output: {
      publicPath,
      filename: '[name].[contenthash].js',
      path: buildPath,
      pathinfo: false,
    },
    module: {
      rules: moduleRules,
    },
    plugins: applyPlugins,
    resolve: {
      extensions: resolveExtensions,
      symlinks: false,
    },
    target: isDevMode ? 'web' : 'browserslist',
    watchOptions: {
      ignored: excludePaths,
    },
  };
};
