const { configure } = require('quasar/wrappers');
const { mergeConfig } = require('vite')

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {

      warnings: true,
      errors: true
    },

    boot: [
      'axios',
      'errorHandling',
    ],

    css: [
      'app.scss'
    ],


    extras: [

      'fontawesome-v6',
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined', // optional, you are not bound to it
    ],


    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },
      extendViteConf (viteConf, { isServer, isClient }) {
        // example: change the chunk size warning limit
        viteConf.build = mergeConfig(viteConf.build, {
          chunkSizeWarningLimit: 750
        })
        // equivalent of following vite.config.js/vite.config.ts:
        // export default defineConfig({
        //   build: {
        //     chunkSizeWarningLimit: 750
        //   }
        // })
      },


      vueRouterMode: 'hash',
   },


   devServer: {
    open: false, // существующая настройка
    server: {
      watch: {
        // Использование опроса, каждые 100ms проверять изменения
        usePolling: true,
        interval: 100,
      }
    }
  },



    framework: {
      config: {},

      plugins: [
        'Dialog',
        'Notify'
      ]
    },


    animations: [],


    ssr: {
     pwa: false,
     prodPort: 9000,

      middlewares: [
        'render' // keep this a@vue/cli-plugin-unit-jest/presets/no-bas last one
      ]
    },


    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,

    },

    cordova: {

    },


    capacitor: {
      hideSplashscreen: true
    },


    electron: {
      inspectPort: 9000,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {

      },

      builder: {


        appId: 'quasar-project'
      }
    },


    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
});
