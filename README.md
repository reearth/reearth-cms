# Re:Earth CMS
[![GitHub stars](https://img.shields.io/github/stars/reearth/reearth-cms.svg?style=social&label=Star&maxAge=2592000)](https://github.com/reearth/reearth-cms/stargazers)
[![issues](https://img.shields.io/github/issues/reearth/reearth-cms)](https://github.com/reearth/reearth-cms/issues)
[![license](https://img.shields.io/github/license/reearth/reearth-cms)](https://github.com/reearth/reearth-cms/blob/main/LICENSE)
[![release](https://img.shields.io/github/release/reearth/reearth-cms.svg)](https://GitHub.com/reearth/reearth-cms/releases/)
[![discussions](https://img.shields.io/badge/discussion-welcome-green.svg)](https://github.com/reearth/reearth-cms/discussions)
[![chat](https://img.shields.io/discord/870497079166910514?color=%237289DA&logo=discord)](https://discord.gg/Q6kmXnywfw)

<p align="center">
  <a href="https://eukarya.notion.site/Re-Earth-CMS-User-Manual-21ac673f1bf94f7b8e5a9cdfdace9c2f">Documentation</a>
  ·
  <a href="https://github.com/reearth/reearth-cms/issues">Issues</a>
  ·
  <a href="https://github.com/reearth/reearth-cms/discussions">Discussions</a>
  ·
  <a href="https://discord.gg/Q6kmXnywfw">Discord</a>
</p>

## Introduction

The Re:Earth CMS is a robust and tailor-made Content Management System designed for efficient management of GIS data.

## Features

- 🔌 Highly extensible by users own script/plugins
- 💻 Super handy being browser-based
- 💪 Supports standard GIS data
- 📢 Easily make data public with Web API
- ✨ Version controllability for each data
- 🤝 Possibility to work with team

## Built with

[React](https://github.com/facebook/react), [TypeScript](https://github.com/microsoft/TypeScript), [Go](https://github.com/golang/go), [GraphQL](https://github.com/graphql), [MongoDB](https://www.mongodb.com/), [OpenID Connect](https://openid.net/connect/)

## Getting Started

### Cloning repo and initializing .env

```sh
git clone [git@github.com](mailto:git@github.com):reearth/reearth-cms.git
cp ./server/.env.example ./server/.env
cp ./web/.env.example ./web/.env
```

### Running locally

Database

```sh
docker compose up reearth-cms-mongo
```

Backend

```sh
cd ./server
go run ./cmd/reearth-cms
```

Front-end

```sh
cd ./web
yarn start
# visit http://localhost:3000
```

## Environment

### OS

| Windows 10+ | Apple macOS 10.12 (macOS Sierra)+ | ChromeOS | iOS 11+ | Android 10+ | Linux (with the desktop) |
| --------- | --------- | --------- | --------- | --------- | --------- |
| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Web Browsers

| ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_32x32.png) <br />Edge | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_32x32.png) <br /> Firefox | ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_32x32.png) <br /> Chrome | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_32x32.png) <br /> Safari | ![iOS Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_32x32.png) <br />iOS Safari | ![Chrome for Android](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_32x32.png) <br/> Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| 91+ | 57+ | 58+ | 11+ | last 2 versions | last 2 versions

## Community

- [Discussions](https://github.com/reearth/reearth-cms/discussions)
- [Discord](https://discord.gg/Q6kmXnywfw): Feel free to come in!

## Contributing

Before contributing, please make sure you look over the Re:Earth front-end style guide [here](https://github.com/reearth/guides/blob/main/frontend/style.md).

## Contributors

[![Contributers](https://contrib.rocks/image?repo=reearth/reearth-cms)](https://github.com/reearth/reearth-cms/graphs/contributors)

Made with [contrib.rocks](https://contrib.rocks/).

## Contact

Re:Earth core comitters: [community@reearth.io](mailto:community@reearth.io)

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE) for more information.
