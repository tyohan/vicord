### WIP, not fully working yet


## Vicord
I really like Vine app but Twitter decided to shutted it down. The feature to record and pause to create a video open more possibility to produce an unique video scene. So thinking to reproduce a simple video recorder web app. Tested under Chromium based browsers and Firefox only, Safari doesn't support Media Recorder API by default.

## Quickstart

To get started, the app based on [Open WC](https://open-wc.org/) starter app and [material web components](https://github.com/material-components/material-components-web-components) :

```bash
npm init @open-wc
# requires node 10 & npm 6 or higher
```

## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `test` runs your test suite with Karma
- `lint` runs the linter for your project

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
