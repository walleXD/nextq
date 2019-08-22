/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const dotenvLoad = require('dotenv-load')
const nextEnv = require('next-env')
const withTM = require('next-transpile-modules')

dotenvLoad()

const transpileModules = []

const plugins = [
  nextEnv(),
  [
    withTM,
    {
      transpileModules
    }
  ]
]

const config = {}

module.export = withPlugins(plugins, config)
