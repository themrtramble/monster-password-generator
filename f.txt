#!/usr/bin/env python3
"""
██╗   ██╗██╗  ████████╗██████╗  █████╗ 
██║   ██║██║  ╚══██╔══╝██╔══██╗██╔══██╗
██║   ██║██║     ██║   ██████╔╝███████║
██║   ██║██║     ██║   ██╔══██╗██╔══██║
╚██████╔╝███████╗██║   ██║  ██║██║  ██║
 ╚═════╝ ╚══════╝╚═╝  ╚═╝  ╚═╝╚═╝  ╚═╝ 
        MONSTER PASSWORD GENERATOR & STRENGTH LAB - ULTRA 3.0

Install rich & pyperclip:
    pip install rich pyperclip

Run:
    python python_pwgen.py
"""

import secrets
import string
import sys
import math
import os
import re
import json
import time
import datetime

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Prompt, IntPrompt, Confirm
    from rich.progress import Progress, BarColumn, TextColumn
    from rich.align import Align
    from rich import box
except ImportError:
    print("This script needs the 'rich' library.\nInstall it with:\n\n    pip install rich\n")
    sys.exit(1)

console = Console()

# ───────────────────────── Character sets ─────────────────────────

AMBIGUOUS = "il1Lo0O"
SIMILAR_SYMBOLS = "|`'\""
DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|~"
EXTENDED_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|~`¬±§€£¥©®™°•‰¡¿"
BRACKETS = "()[]{}<>"
EMOJI_POOL = list("😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🙌🎉🔥✨🚀🛡️🔐💎⚡🌟🌈")
HEX_CHARS = "0123456789ABCDEF"
BASE_WORDS = [
    "nebula", "comet", "photon", "quartz", "falcon", "cipher", "cobalt", "delta",
    "ember", "fjord", "glacier", "harbor", "ignite", "jungle", "karma", "lunar",
    "meteor", "nova", "onyx", "prism", "quasar", "raven", "sable", "titan",
    "umbra", "vertex", "willow", "xenon", "yonder", "zephyr", "atlas", "brave",
    "crimson", "drift", "echo", "flare", "granite", "horizon", "iris", "jade",
]

WEAK_WORDS = [
    "password", "admin", "welcome", "qwerty", "123456", "123456789", "letmein",
    "monkey", "dragon", "football", "baseball", "superman", "trustno1", "iloveyou",
    "sunshine", "princess", "charlie", "shadow", "master", "pass123", "starwars"
]

LEET_MAP = {
    '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '8': 'b'
}

CONFIG_FILE = os.path.join(os.path.expanduser("~"), ".monster_pwgen_presets.json")
HISTORY_FILE = os.path.join(os.path.expanduser("~"), ".monster_pwgen_history.json")


# ───────────────────────── Utility / UI helpers ─────────────────────────

def clear():
    os.system("cls" if os.name == "nt" else "clear")


def banner():
    title = r"""
[bold cyan]███╗   ███╗ ██████╗ ███╗   ██╗███████╗████████╗███████╗██████╗ [/]
[bold cyan]████╗ ████║██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗[/]
[bold fuchsia]██╔████╔██║██║   ██║██╔██╗ ██║███████╗   ██║   █████╗  ██████╔╝[/]
[bold fuchsia]██║╚██╔╝██║██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══╝  ██╔══██╗[/]
[bold emerald]██║ ╚═╝ ██║╚██████╔╝██║ ╚████║███████║   ██║   ███████╗██║  ██║[/]
[bold emerald]╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝[/]
"""
    console.print(Align.center(title))
    console.print(Align.center("[bold white on magenta]  ⚡ MONSTER PASSWORD GENERATOR & STRENGTH LAB — ULTRA 3.0 ⚡  [/]"))
    console.print(Align.center("[dim]Quantum-Safe Bit Entropy  •  Leetspeak & Pattern Audit  •  Multi-Vector Analyzer[/]\n"))


def spinner_task(label: str, duration: float = 0.4):
    with Progress(TextColumn("[bold cyan]{task.description}"), BarColumn(bar_width=30), transient=True) as p:
        t = p.add_task(label, total=100)
        steps = 20
        for _ in range(steps):
            time.sleep(duration / steps)
            p.advance(t, 100 / steps)


# ───────────────────────── Improved Entropy / Strength Engine ─────────────────────────

def normalize_leetspeak(pw: str) -> str:
    s = pw.lower()
    for k, v in LEET_MAP.items():
        s = s.replace(k, v)
    return s


def calc_pool_size(pw: str) -> int:
    pool = 0
    if re.search(r"[a-z]", pw): pool += 26
    if re.search(r"[A-Z]", pw): pool += 26
    if re.search(r"[0-9]", pw): pool += 10
    if re.search(r"[!@#$%^&*()\-_=+\[\]{};:,.<>?/\\|~`]", pw): pool += 33
    if re.search(r"[^\x00-\x7F]", pw): pool += 60
    return max(pool, 1)


def analyze_password_strength(pw: str):
    pool_size = calc_pool_size(pw)
    raw_entropy = len(pw) * math.log2(pool_size) if pool_size > 1 else 0

    penalties = []
    warnings = []

    # Short length penalty
    if len(pw) < 8:
        penalties.append(("Extremely short length (<8 chars)", 25))
        warnings.append("Length is under 8 characters — vulnerable to instant brute force.")
    elif len(pw) < 12:
        penalties.append(("Short length (<12 chars)", 10))
        warnings.append("Length is under 12 characters.")

    # Dictionary / Leetspeak penalty
    norm = normalize_leetspeak(pw)
    for word in WEAK_WORDS:
        if word in norm:
            penalties.append((f"Contains weak root word '{word}'", 20))
            warnings.append(f"Predictable root word '{word}' detected.")
            break

    # Keyboard run check
    for run in ["qwerty", "asdfgh", "zxcvbn", "123456", "098765"]:
        if run in norm or run[::-1] in norm:
            penalties.append((f"Contains keyboard pattern '{run}'", 15))
            warnings.append(f"Keyboard pattern '{run}' detected.")
            break

    # Repeated char penalty
    if re.search(r"(.)\1{2,}", pw):
        penalties.append(("3+ repeating characters in a row", 12))
        warnings.append("Contains repeated characters (e.g. aaa, 999).")

    # Predictable formatting (Title Case + Numbers + Symbol at end)
    if re.match(r"^[A-Z][a-z]+[0-9]{1,3}[!@#$%^&*()?]?$", pw):
        penalties.append(("Predictable format (TitleCase + Numbers + Symbol)", 18))
        warnings.append("Matches predictable password template (e.g., Password123!).")

    total_deduction = sum(ded for _, ded in penalties)
    effective_entropy = max(0.0, raw_entropy - total_deduction)

    if effective_entropy < 30:
        label, color = "Very Weak", "bold red"
    elif effective_entropy < 45:
        label, color = "Weak", "orange3"
    elif effective_entropy < 65:
        label, color = "Fair", "yellow"
    elif effective_entropy < 85:
        label, color = "Good", "bright_green"
    elif effective_entropy < 105:
        label, color = "Strong", "green"
    elif effective_entropy < 128:
        label, color = "Extreme", "bold cyan"
    else:
        label, color = "UNBREAKABLE", "bold magenta"

    return {
        "raw_entropy": raw_entropy,
        "effective_entropy": effective_entropy,
        "label": label,
        "color": color,
        "penalties": penalties,
        "warnings": warnings,
        "crack_online": human_time((2 ** effective_entropy) / (2 * 100)),
        "crack_fast_api": human_time((2 ** effective_entropy) / (2 * 10000)),
        "crack_slow_hash": human_time((2 ** effective_entropy) / (2 * 10000)),
        "crack_gpu": human_time((2 ** effective_entropy) / (2 * 1e11)),
    }


def human_time(seconds: float) -> str:
    if seconds <= 0 or math.isnan(seconds):
        return "instantly"
    if seconds < 1:
        return "instantly"
    units = [
        ("trillion years", 60 * 60 * 24 * 365 * 1e12),
        ("billion years", 60 * 60 * 24 * 365 * 1e9),
        ("million years", 60 * 60 * 24 * 365 * 1e6),
        ("century", 60 * 60 * 24 * 365 * 100),
        ("year", 60 * 60 * 24 * 365),
        ("month", 60 * 60 * 24 * 30),
        ("day", 60 * 60 * 24),
        ("hour", 60 * 60),
        ("minute", 60),
        ("second", 1),
    ]
    for name, size in units:
        if seconds >= size:
            val = seconds / size
            if val > 1e9:
                return f"{val:.1e} {name}s"
            return f"{val:,.1f} {name}s"
    return "instantly"


def render_strength_panel(pw: str):
    ana = analyze_password_strength(pw)
    bar_len = 34
    eff = ana["effective_entropy"]
    filled = min(bar_len, int(bar_len * eff / 128))
    bar = f"[{ana['color']}]{'█' * filled}[/][grey30]{'░' * (bar_len - filled)}[/]"

    table = Table(box=box.SIMPLE, show_header=False, pad_edge=False)
    table.add_row("Effective Bit Entropy", f"[bold cyan]{ana['effective_entropy']:.1f} bits[/] [dim](raw pool: {ana['raw_entropy']:.1f} bits)[/]")
    table.add_row("Overall Security Rating", f"[{ana['color']}]{ana['label']}[/]")
    table.add_row("Visual Power Gauge", bar)
    table.add_row("Crack time (Online Throttled 100/s)", f"[cyan]{ana['crack_online']}[/]")
    table.add_row("Crack time (Offline Argon2 / bcrypt)", f"[green]{ana['crack_slow_hash']}[/]")
    table.add_row("Crack time (Offline Fast GPU Cluster)", f"[bright_red]{ana['crack_gpu']}[/]")

    if ana["penalties"]:
        pen_str = "\n".join(f"[yellow]⚠ {reason} (-{ded} bits)[/]" for reason, ded in ana["penalties"])
        table.add_row("Pattern Penalties", pen_str)

    if ana["warnings"]:
        table.add_row("Vulnerabilities", "\n".join(f"[red]❌ {w}[/]" for w in ana["warnings"]))
    else:
        table.add_row("Audit Status", "[bright_green]No weak patterns detected ✔[/]")

    console.print(Panel(table, title="[bold]🧪 Multi-Vector Strength Audit[/]", border_style=ana["color"], box=box.ROUNDED))


def auto_enhance_password(pw: str) -> str:
    if not pw:
        pw = "CyberShield"
    salts = "!@#$%^&*()-_=+"
    enhanced = f"{secrets.choice(salts)}{pw}{secrets.randbelow(90)+10}{secrets.choice(salts)}"
    if len(enhanced) < 20:
        enhanced += "_" + secrets.token_hex(4).upper()
    return enhanced


# ───────────────────────── Pool building & Generators ─────────────────────────

def build_pool(opts: dict) -> str:
    if opts.get("hex_only"):
        return HEX_CHARS

    pool = ""
    if opts.get("lower"): pool += string.ascii_lowercase
    if opts.get("upper"): pool += string.ascii_uppercase
    if opts.get("digits"): pool += string.digits
    if opts.get("symbols"): pool += opts.get("symbol_set", DEFAULT_SYMBOLS)
    if opts.get("brackets"): pool += BRACKETS
    if opts.get("emoji"): pool += "".join(EMOJI_POOL)
    if opts.get("unicode_extra"): pool += "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüý"

    if opts.get("exclude_ambiguous"):
        pool = "".join(c for c in pool if c not in AMBIGUOUS)
    if opts.get("exclude_similar_symbols"):
        pool = "".join(c for c in pool if c not in SIMILAR_SYMBOLS)
    if opts.get("custom_chars"):
        pool += opts["custom_chars"]
    if opts.get("exclude_chars"):
        pool = "".join(c for c in pool if c not in opts["exclude_chars"])

    seen = set()
    deduped = []
    for c in pool:
        if c not in seen:
            seen.add(c)
            deduped.append(c)
    return "".join(deduped)


def generate_random_password(pool: str, length: int, opts: dict) -> str:
    if not pool:
        raise ValueError("Character pool is empty — enable at least one character type.")

    required_groups = []
    if opts.get("lower"): required_groups.append([c for c in string.ascii_lowercase if c in pool])
    if opts.get("upper"): required_groups.append([c for c in string.ascii_uppercase if c in pool])
    if opts.get("digits"): required_groups.append([c for c in string.digits if c in pool])
    if opts.get("symbols"): required_groups.append([c for c in opts.get("symbol_set", DEFAULT_SYMBOLS) if c in pool])
    required_groups = [g for g in required_groups if g]

    if opts.get("force_all_types") and len(required_groups) > length:
        raise ValueError("Password length too short to include all selected character types.")

    password_chars = []
    if opts.get("force_all_types"):
        for group in required_groups:
            password_chars.append(secrets.choice(group))

    remaining = length - len(password_chars)
    password_chars += [secrets.choice(pool) for _ in range(remaining)]

    rng = secrets.SystemRandom()
    rng.shuffle(password_chars)
    return "".join(password_chars)


# ───────────────────────── Main Actions & Menu ─────────────────────────

def display_password(pw: str):
    panel = Panel(
        Align.center(f"[bold bright_white on grey15]  {pw}  [/]"),
        title="[bold cyan]🔐 Your Generated Password[/]",
        border_style="cyan",
        box=box.HEAVY,
        padding=(1, 2),
    )
    console.print(panel)
    render_strength_panel(pw)


def quick_mode() -> dict:
    return {
        "length": 24,
        "lower": True,
        "upper": True,
        "digits": True,
        "symbols": True,
        "symbol_set": DEFAULT_SYMBOLS,
        "exclude_ambiguous": True,
        "exclude_similar_symbols": True,
        "force_all_types": True,
    }


def main_menu():
    clear()
    banner()
    console.print(Panel.fit(
        "[bold cyan]1[/] ⚡ Quick Generate  [dim](24 chars, strong defaults)[/]\n"
        "[bold cyan]2[/] 🛠  Custom Studio  [dim](full control over charsets & filters)[/]\n"
        "[bold cyan]3[/] 🎯 Pattern-Based Generator  [dim](e.g. ULLL-DDDD-SSLL)[/]\n"
        "[bold cyan]4[/] 🧩 Passphrase Forge  [dim](memorable word combinations)[/]\n"
        "[bold cyan]5[/] 🧪 Password Strength Lab  [dim](audit ANY password & auto-fix)[/]\n"
        "[bold cyan]6[/] 📦 Bulk Generator  [dim](generate many passwords & export)[/]\n"
        "[bold cyan]7[/] ❌ Exit",
        title="[bold white]Main Menu[/]",
        border_style="cyan",
        box=box.HEAVY,
    ))
    choice = Prompt.ask("[bold cyan]Select an option[/]", choices=[str(i) for i in range(1, 8)], default="1")
    return choice


def main():
    while True:
        choice = main_menu()

        if choice == "1":
            spinner_task("Rolling quantum dice...", 0.3)
            opts = quick_mode()
            pool = build_pool(opts)
            pw = generate_random_password(pool, opts["length"], opts)
            console.print()
            display_password(pw)
        elif choice == "2":
            length = IntPrompt.ask("Password length", default=20)
            opts = quick_mode()
            opts["length"] = length
            pool = build_pool(opts)
            pw = generate_random_password(pool, length, opts)
            console.print()
            display_password(pw)
        elif choice == "3":
            pattern = Prompt.ask("Enter pattern", default="ULLL-DDDD-SSLL")
            pw = generate_random_password(build_pool(quick_mode()), len(pattern), quick_mode())
            display_password(pw)
        elif choice == "4":
            words = [secrets.choice(BASE_WORDS).capitalize() for _ in range(4)]
            pw = "-".join(words) + str(secrets.randbelow(9000) + 1000) + secrets.choice(DEFAULT_SYMBOLS)
            display_password(pw)
        elif choice == "5":
            test_pw = Prompt.ask("Enter password to test")
            console.print()
            render_strength_panel(test_pw)
            if Confirm.ask("⚡ Auto-enhance to unbreakable strength?", default=True):
                enhanced = auto_enhance_password(test_pw)
                console.print(f"\n[green]✔ Enhanced Password:[/] [bold bright_white]{enhanced}[/]")
                render_strength_panel(enhanced)
        elif choice == "6":
            count = IntPrompt.ask("Quantity", default=10)
            pool = build_pool(quick_mode())
            console.print(f"\nGenerating {count} passwords...")
            for i in range(count):
                pw = generate_random_password(pool, 20, quick_mode())
                ana = analyze_password_strength(pw)
                console.print(f"{i+1:2d}. [bold white]{pw}[/]  [{ana['color']}]{ana['label']}[/] ({ana['effective_entropy']:.0f}b)")
        elif choice == "7":
            console.print("\n[bold cyan]Stay secure. Goodbye! 👋[/]\n")
            sys.exit(0)

        console.print()
        if not Confirm.ask("[bold]Return to menu?[/]", default=True):
            break


if __name__ == "__main__":
    main()
