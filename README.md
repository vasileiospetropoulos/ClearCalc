# ClearCalc

ClearCalc is a polished, responsive calculator and compact mathematical toolkit. It runs entirely in the browser and supports mouse, touch, and physical keyboard input.

## Features

- Addition, subtraction, multiplication, and division with standard operator precedence.
- Percentage behavior that follows common calculator conventions.
- Decimal input, sign toggle, backspace, clear-entry, and all-clear controls.
- Repeated equals operations and a reusable list of the 10 most recent calculations.
- Scientific mode with roots, powers, factorials, logarithms, trigonometry, constants, and degree/radian selection.
- Function mode for defining and evaluating expressions such as `f(x) = x^2 + 3x + 2`.
- Safe expression parsing with parentheses, operator precedence, and implicit multiplication.
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
│   │   ├── CalculatorDisplay.tsx
│   │   ├── FunctionCalculator.tsx
│   │   └── ScientificCalculator.tsx
│   ├── test/
│   │   ├── Calculator.test.tsx
│   │   ├── calculatorEngine.test.ts
│   │   ├── mathEngine.test.ts
│   │   └── setup.ts
│   ├── utils/
│   │   ├── calculatorEngine.ts
│   │   ├── formatNumber.ts
│   │   └── mathEngine.ts
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

Scientific mode supports square, cube, and general roots; powers; reciprocal; absolute value; factorial; natural and base-10 logarithms; exponential; sine, cosine, tangent and their inverses; and π/e constants. Trigonometric angle units can be switched between degrees and radians. Factorial accepts integers from 0 through 170, and general real roots use `root(value, degree)`.

Function mode evaluates a single-variable `x` expression. It supports explicit operations and implicit multiplication (for example, `3x`), parentheses, constants, and the same supported mathematical functions. Expressions are parsed by a restricted TypeScript parser; arbitrary JavaScript is not evaluated. Unsupported syntax, invalid domains, and undefined results display an error.

The parser and scientific functions are implemented locally; no third-party math-expression dependency is required.

## Accessibility and responsive design

Controls are semantic buttons with accessible names. The display announces updates, keyboard focus is visible, the layout reflows on narrow screens, and reduced-motion preferences are respected. Keyboard shortcuts are ignored while focus is in a text-entry field.

The production build is a static Vite bundle in `dist/`, ready to deploy to a static web host.
