# ⚡ Monster Password Generator & Strength Analyzer — Ultra 3.0

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38BDF8.svg)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)

An ultra-modern, futuristic, zero-knowledge **Password Generator & Quantum-Safe Strength Analyzer** web application and CLI. Powered by multi-vector Shannon entropy calculations, pattern/leetspeak vulnerability audits, audio FX, and 1-click auto-enhancement.

---

## 🌟 Key Features

### 🎨 Ultra Modern UI & Aesthetics
- **Cyber-Glass Design System**: Dark cyber-glass card overlays (`backdrop-filter: blur`), animated glowing borders, and responsive theme switcher (**Cyber**, **Neon Midnight**, **Minimal Dark**).
- **Dynamic Particle Mesh**: Interactive background particle mesh canvas that responds to viewports.
- **Web Audio API Synthesizer**: Built-in sound effects for keypress clicks, copy success chimes, and power sound FX.
- **Micro-Animations & Confetti**: Interactive ripple animations and floating particle confetti upon copying passwords.

### 🛡️ Improved Multi-Vector Password Strength Engine
- **Effective Bit Entropy**: Calculates both raw Shannon pool entropy ($L \log_2 N$) and pattern-adjusted **effective entropy** (bits).
- **Leetspeak & Dictionary Audit**: Normalizes character substitutions (`@` $\to$ `a`, `3` $\to$ `e`, `0` $\to$ `o`, `$` $\to$ `s`) to detect hidden dictionary words like `P@ssw0rd123!`.
- **Spatial Keywalk & Pattern Detection**: Identifies QWERTY key rows (`qwerty`, `asdfgh`), sequential runs (`123456`), repetition (`aaa`), and predictable formatting templates.
- **Real-World Crack Time Matrix**:
  - *Online Throttled* (100 guesses/sec)
  - *Online Fast API* (10,000 guesses/sec)
  - *Offline Slow Hash* (Argon2id / bcrypt)
  - *Offline Fast GPU Cluster* (100 Billion hashes/sec)
  - *Quantum Grover Attack Estimate*
- **Auto-Fix & Enhance**: 1-click button that automatically transforms any weak password into a 100/100 Unbreakable strength password.

### 🚀 Generator Modules
- ⚡ **Quick Generator**: Instant 1-tap 24-character preset generator.
- 🛠 **Custom Studio**: Complete control over length (4–128 chars), character pools (lower, upper, digits, symbols, brackets, emojis, accented unicode, hex-only), ambiguity exclusions, and custom include/exclude.
- 🎯 **Pattern Forge**: Template-based generator supporting pattern tokens (`L`, `U`, `D`, `S`, `A`, `X`) and presets like `ULLL-DDDD-SSLL`.
- 🧩 **Passphrase & Phonetic Forge**: Cryptographically secure word-based passphrases and phonetic syllable passwords.
- 📦 **Bulk Generator**: Batch generate up to 1,000 passwords at once with live strength filtering and export options (`.TXT`, `.CSV`, `.JSON`).
- 🧪 **Strength Lab**: Standalone password auditor to test existing user passwords with live vulnerability reports.
- 📜 **Vault History**: Session history stored in encrypted local memory with password masking, copy, delete, and clear features.

---

## 📁 Repository Directory Structure

```
├── src/
│   ├── components/
│   │   ├── BackgroundCanvas.tsx  # Particle background animation
│   │   ├── BulkStudio.tsx        # Batch password generator & exporter
│   │   ├── CustomStudio.tsx      # Advanced custom generator studio
│   │   ├── Header.tsx            # Navigation header & theme/audio controls
│   │   ├── PassphraseForge.tsx   # Word-based & phonetic passphrase engine
│   │   ├── PatternForge.tsx      # Template-based pattern generator
│   │   ├── QuickGenerator.tsx    # 1-tap quick generator
│   │   ├── StrengthLab.tsx       # Standalone password auditor & tester
│   │   ├── StrengthMeter.tsx     # Strength gauge, crack times & warnings
│   │   └── VaultHistory.tsx      # Local history vault & export
│   ├── utils/
│   │   ├── generators.ts         # Cryptographically secure random generators
│   │   ├── soundEffects.ts       # Web Audio API sound synthesizer
│   │   └── strengthEngine.ts     # Multi-vector strength & entropy analyzer
│   ├── App.tsx                   # Main React application
│   ├── index.css                 # Cyber-glass CSS styling & Tailwind directives
│   └── main.tsx                  # React DOM entry point
├── python_pwgen.py               # Full-featured Python CLI version
├── f.txt                         # CLI reference script
├── index.html                    # HTML5 entry page
├── package.json                  # Dependencies & npm scripts
├── vite.config.ts                # Vite configuration with Tailwind CSS v4
├── README.md                     # Documentation
└── LICENSE                       # MIT License
```

---

## ⚙️ Quick Start

### 🌐 Web Application (Vite + React)

#### 1. Clone the repository
```bash
git clone https://github.com/themrtramble/monster-password-generator.git
cd monster-password-generator
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Start development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

#### 4. Build for production
```bash
npm run build
```

---

### 🐍 Python CLI Version

The repository includes a standalone Python CLI version with rich terminal graphics and multi-vector auditing.

#### Install dependencies:
```bash
pip install rich pyperclip
```

#### Run CLI:
```bash
python python_pwgen.py
```

---

## 🔒 Security & Privacy

- **Zero-Knowledge Architecture**: All password generation, entropy analysis, and history logging happen 100% client-side in browser memory / local terminal.
- **Cryptographic Security**: Uses `crypto.getRandomValues()` in the Web App and `secrets` module in Python for cryptographically secure pseudo-random number generation (CSPRNG).
- **No Remote Logging**: Zero network requests or analytics.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — created by [themrtramble](https://github.com/themrtramble).
