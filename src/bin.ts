#!/usr/bin/env node
import colors from 'colors/safe'
import program from 'commander'
import fs from 'fs'
import path from 'path'
import * as yup from 'yup'
import { testLocaleFile } from '.'
import pkg from '../package.json'

const CONFIG_SCHEMA = yup.object().shape({
  i18n: yup.object().required().shape({
    defaultLocale: yup.string().required(),
  }),
  localePath: yup.string().required(),
  defaultNS: yup.string().required(),
})

program
  .name('i18next-test')
  .version(pkg.version)
  .requiredOption('-c, --config <path>', 'Path to the config file')

program.on('--help', function () {
  console.log('')
  console.log('  Examples:')
  console.log('')
  console.log('    $ i18next-test -c i18next-test.config.js')
  console.log('')
})

program.parse(process.argv)
run()

function run() {
  const config = loadConfig(program.opts().config)

  let hasErrors = false
  console.log()
  console.log(colors.cyan('  i18next Test'))
  console.log(colors.cyan('  ------------'))
  console.log()

  for (const localeDirectory of fs.readdirSync(config.localePath)) {
    for (const namespaceFile of fs.readdirSync(path.join(config.localePath, localeDirectory))) {
      const filePath = path.join(config.localePath, localeDirectory, namespaceFile)

      const errors = testLocaleFile({
        fileContent: fs.readFileSync(filePath, 'utf-8'),
        locale: localeDirectory,
        defaultLocale: config.i18n.defaultLocale,
        namespace: path.basename(namespaceFile, path.extname(namespaceFile)),
        defaultNamespace: config.defaultNS,
      })

      if (errors.length > 0) {
        hasErrors = true
        console.log(colors.red('  [fail] ') + filePath)
        printErrors(errors, '         ')
      } else {
        console.log(colors.green('  [pass] ') + filePath)
      }
    }
  }

  console.log()
  if (hasErrors) {
    process.exit(1)
  }
}

function loadConfig(configPath: string) {
  let config = {}

  try {
    config = require(path.resolve(configPath))
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('error: config file does not exist: ' + program.opts().config)
    } else {
      console.log('error: config file could not be loaded: ' + err.message)
    }
    process.exit(1)
  }

  try {
    return CONFIG_SCHEMA.validateSync(config)
  } catch (err) {
    console.log('error: config file is invalid: ' + err.message)
    process.exit(1)
  }
}

function printErrors(errors: Array<string>, padding: string) {
  for (const error of errors) {
    const lines = error.split('\n')

    for (let i = 0; i !== lines.length; i++) {
      const prefix = i === 0 ? '- ' : '  '
      console.log(padding + prefix + lines[i])
    }
  }
}
