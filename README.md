# Infr
An autonomous, open-source platform for data collection, storage, & retrieval that you can self-host.

![Infr Desktop](https://res.cloudinary.com/dcwz20wdd/image/upload/v1697466380/infr_is8ete.png)

## What is Infr?
Infr is a platform for data collection, storage, & retrieval that you can self-host. It is designed to be API-first & modular, so that you can easily add new data sources, storage backends, and retrieval methods. 

It is also focuses on being autonomous, so that you can set it up and forget about it.

Learn more about Infr [here](https://getinfr.com)

## What does the client do?
The desktop client is an app built on Infr that allows you to automate data collection & viewing on any macOS device (PC & distros coming in the near future). It's built on top of Infr & Tauri, & is optimized for performance & low resource usage.

## How do I use it?
Before using the desktop client, please make sure that you've your own server running. There're two ways to run the client:

### Download the latest release 
You can find it on the [releases page](https://github.com/infrhq/client/releases).

### Build & run it from source
#### Prerequisites
 - [NodeJS 14 or above](https://nodejs.org/en/download/)
#### Installation
1. Clone the repo
```bash
git clone https://github.com/InfrHQ/client.git
```
2. Install dependencies
```bash
bun install
```
3. Run the app
```bash
bun run tauri dev
```

## Join the community
Join the community on [Discord](https://discord.gg/ZAejZCzaPe) to get help, discuss ideas, and contribute to the project.
Follow us on [Twitter](https://twitter.com/InfrHQ) to stay updated.

## Contributing
We welcome contributions from anyone and everyone. Please see our [contributing guide](CONTRIBUTING.md) for more info.

## License
Infr Client is licensed under the [Apache 2.0 License](LICENSE).