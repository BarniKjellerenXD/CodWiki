# CodWiki security model

CodWiki publishes a public Nuxt site and a Windows Electron application. The site and desktop client store progress and preferences locally. They have no CodWiki accounts or cloud sync. See the [project README](README.md) and the [desktop README](desktop-app/README.md).

## Components and trust boundaries

- **CodWiki Web.** Visitors use guides, tools, and the community wiki viewer. The viewer receives content from Reddit, so consider that content external to the site's trust boundary. Protect the site's origin and the integrity of content delivered to browsers and the desktop app. See the [wiki route](app/pages/wiki/%5Bpage%5D.vue), [viewer](app/components/WikiViewer.vue), and [server middleware and routes](server/).
- **CodWiki Desktop.** The app embeds the production web origin in a webview and keeps privileged operations in the Electron host. Context isolation, sandboxed web preferences, navigation checks, and host-only IPC checks protect that boundary. Treat the embedded web content and catalogue responses as inputs, and preserve the boundary even if the hosted site returns hostile content. See [Electron main](desktop-app/main.js), [preload](desktop-app/preload.js), and [catalogue validation](desktop-app/catalogue.js).
- **CodWiki Release Pipeline.** GitHub Actions packages and publishes a Windows installer and portable ZIP. The desktop app checks official release metadata and opens the GitHub release page for users to download. Protect the integrity of repository changes, build inputs, release write permissions, and the published artifacts. See the [release workflow](.github/workflows/desktop.yml) and [release checker](desktop-app/updates.js).

## Review priorities

The maintainer prioritizes desktop release integrity. Consider malicious external content and unauthorized changes to dependencies, source, build automation, or release assets. Changes to the hosted website matter to both the public site and the desktop client.
