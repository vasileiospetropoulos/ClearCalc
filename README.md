# ClearCalc

ClearCalc is a polished, responsive calculator for everyday arithmetic. It runs entirely in the browser and supports mouse, touch, and physical keyboard input.

## Features

- Addition, subtraction, multiplication, and division with standard operator precedence.
- Percentage behavior that follows common calculator conventions.
- Decimal input, sign toggle, backspace, clear-entry, and all-clear controls.
- Repeated equals operations and a reusable list of the 10 most recent calculations.
- Keyboard controls, screen-reader labels, visible focus indicators, and reduced-motion support.
- Responsive layout for desktop, tablet, and mobile screens.
- Safe arithmetic evaluation without `eval()` or dynamic JavaScript execution.

## Technology

- React 19
- TypeScript
- Vite
- Vitest, Testing Library, and jsdom

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local development URL after startup.

## Checks

```sh
npm test
npm run lint
npm run build
```

## Project structure

```text
clear-calc/
├── public/
├── src/
│   ├── components/
│   │   ├── CalculationHistory.tsx
│   │   ├── Calculator.css
│   │   ├── Calculator.tsx
│   │   ├── CalculatorButton.tsx
│   │   └── CalculatorDisplay.tsx
│   ├── test/
│   │   ├── Calculator.test.tsx
│   │   └── setup.ts
│   ├── utils/
│   │   ├── calculatorEngine.ts
│   │   └── formatNumber.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Calculation behavior

Multiplication and division are evaluated before addition and subtraction; operations of equal precedence are evaluated from left to right. Calculator percentages convert to a decimal for multiplication and division. For addition or subtraction, the entered percentage is based on the preceding operand (for example, `200 + 10%` adds 20). Results are normalized to 15 significant digits to avoid common floating-point display artifacts such as `0.30000000000000004`. Very large and very small values use scientific notation.

## Accessibility and responsive design

Controls are semantic buttons with accessible names. The display announces updates, keyboard focus is visible, the layout reflows on narrow screens, and reduced-motion preferences are respected. Keyboard shortcuts are ignored while focus is in a text-entry field.

The production build is a static Vite bundle in `dist/`, ready to deploy to a static web host.
