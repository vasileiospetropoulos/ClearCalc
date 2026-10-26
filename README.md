# ClearCalc

ClearCalc is a responsive calculator for standard arithmetic, scientific operations, and mathematical function evaluation. It is available as a React, TypeScript, and Vite web application, and as Windows and macOS desktop applications packaged with Tauri 2.

<p align="center">
  <a href="https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_x64-setup.exe">
    <img
      src="https://img.shields.io/badge/Download-ClearCalc%20for%20Windows-6366F1?style=for-the-badge&amp;logo=data:image%2Fsvg%2Bxml%3Butf8%2C%253Csvg%2520xmlns%253D%2522http%253A%252F%252Fwww.w3.org%252F2000%252Fsvg%2522%2520viewBox%253D%25220%25200%252024%252024%2522%253E%253Cpath%2520fill%253D%2522white%2522%2520d%253D%2522M0%252C0H11.377V11.372H0ZM12.623%252C0H24V11.372H12.623ZM0%252C12.623H11.377V24H0Zm12.623%252C0H24V24H12.623%2522%252F%253E%253C%252Fsvg%253E&amp;logoColor=white"
      alt="Download ClearCalc for Windows"
    >
  </a>
  <br>
  <a href="https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_aarch64.dmg">
    <img
      src="https://img.shields.io/badge/Download-macOS%20Apple%20Silicon-6366F1?style=for-the-badge&amp;logo=apple&amp;logoColor=white"
      alt="Download ClearCalc for macOS on Apple Silicon"
    >
  </a>
  <br>
  <a href="https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_x64.dmg">
    <img
      src="https://img.shields.io/badge/Download-macOS%20Intel-6366F1?style=for-the-badge&amp;logo=apple&amp;logoColor=white"
      alt="Download ClearCalc for macOS on Intel"
    >
  </a>
  <br>
  <sub><a href="https://github.com/vasileiospetropoulos/ClearCalc/releases">View All Releases</a></sub>
</p>

## Contents

- [Features](#features)
- [Technology](#technology)
- [Windows desktop application](#windows-desktop-application)
- [macOS desktop application](#macos-desktop-application)
- [Install the Windows application](#install-the-windows-application)
- [Install the macOS application](#install-the-macos-application)
- [Development setup](#development-setup)
- [Commands](#commands)
- [Project structure](#project-structure)
- [Testing and verification](#testing-and-verification)
- [Expression handling](#expression-handling)
- [Interface and accessibility](#interface-and-accessibility)
- [Troubleshooting](#troubleshooting)

## Features

### Standard mode

- Addition, subtraction, multiplication, and division with operator precedence.
- Decimal input, sign toggle, percentage calculations, clear-entry, all-clear, and backspace.
- Repeated equals operations and a recent-calculation history containing up to 10 entries.
- Keyboard input for common calculator operations.

### Scientific mode

- Squares, cubes, general roots, powers, reciprocals, absolute values, and factorials.
- Natural and base-10 logarithms, exponentials, sine, cosine, tangent, and inverse trigonometric functions.
- π and e constants, with degree or radian angle selection for trigonometric calculations.
- An on-screen keypad for numbers, operators, parentheses, constants, editing, and expression entry.

Factorial accepts whole numbers from 0 through 170. General roots can also be entered using `root(value, degree)`.

### Function mode

Define a function of `x`, enter a value for `x`, and evaluate it. For example, `f(x) = x^2 + 3x + 2` evaluated at `x = 2` returns `12`. A keyboard-accessible example selector provides quadratic, linear, sine, and rational examples.

Function expressions support arithmetic, parentheses, powers, roots, logarithms, trigonometric functions, constants, and implicit multiplication such as `3x`.

### Shared experience

- Dark theme and layouts that adapt to the available window or browser size.
- Calculation history shared across calculator modes.
- Clear error messages for incomplete expressions, unsupported syntax, and invalid mathematical domains.
- Keyboard-accessible controls, visible focus indicators, and reduced-motion styling.

## Technology

- **React 19** and **TypeScript 6** provide the calculator interface and application logic.
- **Vite 8** builds and serves the web frontend.
- **Tauri 2** wraps the same frontend for Windows and macOS desktop distribution; its application shell is implemented in Rust.
- **Vitest 5**, Testing Library, and jsdom are used for automated tests. **oxlint** is used for linting.

## Windows desktop application

The Windows app uses the existing Vite production build; it is not a separate calculator implementation. The Tauri configuration specifies:

| Setting | Value |
| --- | --- |
| Product and window name | `ClearCalc` |
| Application identifier | `com.vasileiospetropoulos.clearcalc` |
| Version | `1.0.0` |
| Target | Windows x64 (`x86_64-pc-windows-msvc`) |
| Installer | NSIS setup executable |
| Install scope | Current user |

The generated installer currently present in this workspace is:

```text
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/ClearCalc_1.0.0_x64-setup.exe
```

Run `npm run tauri:build` to build the frontend and create the installer. The installer is written to the directory above. The packaged app loads bundled frontend assets and does not need the Vite development server.

The app uses the Microsoft Edge WebView2 Runtime to display its interface. Tauri's default `downloadBootstrapper` installation mode is in effect: if WebView2 is not already available, the installer downloads and runs its bootstrapper. Windows 10 and later commonly include the runtime.

## macOS desktop application

The macOS desktop app uses the same React frontend, packaged with Tauri 2 as separate architecture-specific DMGs:

| Mac processor | Rust target | Release download |
| --- | --- | --- |
| Apple Silicon (Apple M-series) | `aarch64-apple-darwin` | [ClearCalc_1.0.0_aarch64.dmg](https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_aarch64.dmg) |
| Intel | `x86_64-apple-darwin` | [ClearCalc_1.0.0_x64.dmg](https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_x64.dmg) |

These DMGs were built by the [GitHub Actions macOS workflow](.github/workflows/macos-build.yml). Both architecture jobs completed successfully, including the automated checks for DMG integrity, app bundle presence, `Info.plist` validity, and executable presence and permissions in the [successful workflow run](https://github.com/vasileiospetropoulos/ClearCalc/actions/runs/40307866542). These checks validate package contents, not GUI behavior. ClearCalc has not yet been interactively tested on physical Mac hardware. The v1.0.0 release provides Windows and macOS packages; it does not include a Linux package.

The macOS builds are not signed with an Apple Developer ID and are not notarized by Apple. macOS may display security warnings when opening them. Download the DMGs only from the [official ClearCalc v1.0.0 release](https://github.com/vasileiospetropoulos/ClearCalc/releases/tag/v1.0.0); do not bypass a security warning unless you understand and trust the source and the action being taken.

## Install the Windows application

Download the [Windows x64 installer](https://github.com/vasileiospetropoulos/ClearCalc/releases/download/v1.0.0/ClearCalc_1.0.0_x64-setup.exe) from the official v1.0.0 release or another trusted source, run it, and follow its prompts. The configured NSIS install mode installs for the current Windows user. Launch ClearCalc from the Start menu.

The packaged application does not require VS Code, Node.js, npm, Rust, or a manually started development server. WebView2 is required; the installer uses Tauri's bootstrapper mode if the runtime is missing.

## Install the macOS application

1. Download the DMG for your Mac from the [official ClearCalc v1.0.0 release](https://github.com/vasileiospetropoulos/ClearCalc/releases/tag/v1.0.0): choose the Apple Silicon build for an M-series Mac or the Intel build for an Intel Mac.
2. Open the DMG and inspect its contents.
3. Follow the installation layout provided in the mounted disk image to install or launch ClearCalc.

These instructions describe the package installation flow; installation and launch have not been verified on physical Mac hardware. The first launch may show a macOS security warning because the build is not Developer ID signed or notarized. Only proceed if the installer came from the official repository and you understand the warning.

## Development setup

### Web application

To develop or run the web version, install:

- Node.js **22.12 or later in the 22.x line, 24.x, or 26 or later**, and npm.
- Git to clone the repository.

These versions reflect the Node.js engine requirements of the project's Vite and Vitest dependencies. Install Node.js from [nodejs.org](https://nodejs.org/).

```sh
git clone <repository-url>
cd ClearCalc
npm install
npm run dev
```

Vite reports the local development URL when the server starts. Rust and the Windows C++ toolchain are not needed for the web application.

### Windows desktop development

In addition to the web prerequisites, building or running the Tauri desktop app on Windows requires:

- Rust and Cargo, installed using [rustup](https://www.rust-lang.org/tools/install). The project declares Rust 1.90 or later.
- Microsoft Visual C++ Build Tools with the **Desktop development with C++** workload. See the [Visual Studio C++ Build Tools download page](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
- The Windows x64 MSVC toolchain and Windows SDK included with the C++ workload.
- Microsoft Edge WebView2 Runtime to run the desktop application. Windows 10 and later commonly include it; otherwise install the [Evergreen WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section).

See the official [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for current platform setup details.

### macOS desktop development

For local macOS desktop development, install Node.js and npm, Rust and Cargo, and Xcode Command Line Tools. Tauri's [macOS prerequisites](https://v2.tauri.app/start/prerequisites/#macos) describe the current setup. Alternatively, the architecture-specific release DMGs are built in GitHub Actions using the manual **Build macOS DMGs** workflow.

## Commands

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm install` | Install JavaScript dependencies. |
| `npm run dev` | Start the Vite web development server. |
| `npm test` | Run the Vitest frontend test suite. |
| `npm run lint` | Run oxlint. |
| `npm run build` | Type-check the app and build the production frontend in `dist/`. |
| `npm run preview` | Preview the existing production frontend build locally. |
| `npm run tauri:dev` | Start Vite and open the Tauri desktop app in development mode. |
| `npm run tauri:build` | Build the production frontend and the Windows x64 NSIS installer. |

The desktop development command uses the configured Vite development URL. `npm run tauri:build` builds the Windows x64 NSIS installer. To build macOS DMGs, manually run **Build macOS DMGs** from the repository's GitHub Actions tab; the workflow builds the production frontend and bundles it for both macOS architectures.

## Project structure

```text
.
├── public/                  # Static public assets
├── src/
│   ├── components/          # Calculator modes, controls, display, and history UI
│   ├── test/                 # Calculator and math-engine tests
│   ├── utils/                # Arithmetic, expression parsing, and number formatting
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── src-tauri/
│   ├── icons/                # Desktop application icons and ClearCalc icon source
│   ├── src/                  # Rust entry point and Tauri application setup
│   ├── Cargo.toml
│   └── tauri.conf.json       # Window, frontend, and bundler configuration
├── package.json              # Dependencies and npm scripts
├── package-lock.json
├── vite.config.ts
└── README.md
```

The React components implement the UI and interactions. The calculator arithmetic and restricted mathematical expression parser are in `src/utils/`. Tauri packages the frontend and provides the desktop application window.

## Testing and verification

The frontend test suite covers standard calculator arithmetic and interactions, percentages, keyboard input, scientific calculations and keypad controls, function evaluation, example selection, and invalid expression handling.

Run the frontend checks with:

```sh
npm test
npm run lint
npm run build
```

At the time of this README update, these checks pass: 30 tests, lint, and the web production build. They validate the frontend; they do not by themselves verify an installed desktop application. The macOS DMGs have passed the automated package-integrity checks described above, but have not been tested interactively on physical Mac hardware. To verify the Windows app, build it with `npm run tauri:build`, install the resulting NSIS executable, and test the calculator modes and window resizing on Windows.

## Expression handling

Mathematical input is parsed by a restricted expression parser rather than executed as arbitrary JavaScript. The parser supports the documented arithmetic and mathematical functions, checks input length and numeric validity, and reports unsupported syntax and invalid domains. This describes the application's expression handling; it is not a claim that the app has undergone an independent security audit.

The desktop shell currently adds no application-specific Tauri plugins or native commands.

## Interface and accessibility

ClearCalc uses a dark visual theme and responsive layouts across Standard, Scientific, and Function modes. Controls have accessible names, keyboard focus is visible, and reduced-motion preferences are respected. The app supports mouse and keyboard interaction; the scientific keypad also allows calculations without a physical keyboard.

## Troubleshooting

- **`node` or `npm` is not recognized:** Install a supported Node.js version from [nodejs.org](https://nodejs.org), then open a new terminal and check `node --version` and `npm --version`.
- **Tauri reports that Cargo or Rust is unavailable:** Install Rust with [rustup](https://www.rust-lang.org/tools/install), restart the terminal, and verify `rustc --version` and `cargo --version`.
- **A Windows desktop build fails in native compilation:** Confirm that Visual Studio Build Tools has the **Desktop development with C++** workload and the x64 MSVC toolchain and Windows SDK installed.
- **The NSIS installer is not found after building:** Check that `npm run tauri:build` completed successfully, then inspect `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/`.
- **The desktop app cannot display its interface:** Confirm that the WebView2 Runtime is installed. If it is missing, install the [Evergreen WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section) and try again.
