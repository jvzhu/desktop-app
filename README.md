# desktop-app

Production-ready Electron desktop application with React and TypeScript.

## Features

- Electron main + preload processes with secure context bridge
- React + TypeScript renderer with desktop-style UI (sidebar, top bar, status bar, modal dialogs)
- IPC-backed file management (read/write/delete/list), native dialogs, and recent files tracking
- SQLite integration (`better-sqlite3`) for note storage and recent files
- Settings persistence, theme switching, and secure credential storage (`safeStorage`)
- Offline-first API sync with retries and local cache fallback
- System tray, application menus, context menu support, and keyboard shortcuts
- Auto-update wiring (`electron-updater`) and Electron Builder packaging for Windows/macOS/Linux
- CSP and context isolation security defaults
- Jest unit/component tests and Playwright e2e tests

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

## Packaging

```bash
npm run dist
```

> Code signing and notarization are configured through Electron Builder and environment-based signing credentials in CI.
