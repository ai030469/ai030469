#!/usr/bin/env python3
"""
Prompt Injection Detection System — מערכת זיהוי הזרקת פרומפט
7-layer defense for terminal use.
"""

import sys
import os
import re
import base64
import hashlib
import json
import struct
import zlib
from pathlib import Path
from typing import Optional


# ─────────────────────────────────────────────
# LAYER 2 — Injection patterns (text-level)
# ─────────────────────────────────────────────

INJECTION_PATTERNS = [
    # Instruction override
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)",
    r"disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)",
    r"forget\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)",
    r"override\s+(your\s+)?(previous|prior|above|earlier|system)?\s*(instructions?|prompts?|rules?|directives?)",
    r"new\s+instructions?\s*[:：]",
    r"from\s+now\s+on\s+(you\s+(are|will|must|should))",
    r"you\s+are\s+now\s+(a|an|the)\s+\w+",
    r"act\s+as\s+(a|an|the)\s+\w+",
    r"pretend\s+(to\s+be|you\s+are)",
    r"your\s+(new\s+)?(role|persona|identity|task|job|purpose)\s+(is|will\s+be)",

    # System prompt leaking
    r"(reveal|show|print|output|display|repeat|tell\s+me)\s+(your|the)\s+(system\s+prompt|instructions?|rules?|guidelines?)",
    r"what\s+(are\s+your|is\s+your)\s+(system\s+prompt|instructions?|guidelines?|constraints?)",

    # Jailbreak keywords
    r"\bDAN\b",
    r"\bjailbreak\b",
    r"\bunrestricted\s+mode\b",
    r"\bDeveloper\s+Mode\b",
    r"\bGod\s+Mode\b",
    r"\bno\s+filter(s)?\b",

    # Role confusion
    r"(you\s+are|you're)\s+(not\s+an?\s+)?(AI|assistant|language\s+model|LLM|bot)",
    r"(human|user|admin|root)\s+(mode|override|access)",

    # Privilege escalation
    r"sudo\s+",
    r"as\s+(root|admin|superuser|administrator)",
    r"(grant|give)\s+(me\s+)?(root|admin|full)\s+(access|privileges?|permissions?)",

    # Hidden instruction markers
    r"<\s*system\s*>",
    r"\[SYSTEM\]",
    r"\[INST\]",
    r"<<SYS>>",
    r"<\|im_start\|>",
    r"\[/INST\]",
    r"###\s*(Instruction|System|Human|Assistant)\s*:",

    # Hebrew injection patterns
    r"התעלם\s+מ(כל\s+)?(ההוראות|ההנחיות|ההקשר)",
    r"הוראות\s+חדשות\s*[:：]",
    r"מעכשיו\s+אתה",
    r"(גלה|חשוף|הצג)\s+(את\s+)?(הוראות|פרומפט)\s+המערכת",
]

# ─────────────────────────────────────────────
# LAYER 5 — Base64 detection regex
# ─────────────────────────────────────────────

BASE64_PATTERN = re.compile(r'[A-Za-z0-9+/]{40,}={0,2}')


# ─────────────────────────────────────────────
# Helper: ANSI colors for terminal output
# ─────────────────────────────────────────────

class Colors:
    RED    = "\033[91m"
    YELLOW = "\033[93m"
    GREEN  = "\033[92m"
    CYAN   = "\033[96m"
    BOLD   = "\033[1m"
    RESET  = "\033[0m"

def red(s):    return f"{Colors.RED}{s}{Colors.RESET}"
def yellow(s): return f"{Colors.YELLOW}{s}{Colors.RESET}"
def green(s):  return f"{Colors.GREEN}{s}{Colors.RESET}"
def cyan(s):   return f"{Colors.CYAN}{s}{Colors.RESET}"
def bold(s):   return f"{Colors.BOLD}{s}{Colors.RESET}"


# ─────────────────────────────────────────────
# Detection result container
# ─────────────────────────────────────────────

class DetectionResult:
    def __init__(self):
        self.findings: list[dict] = []
        self.risk_level: str = "CLEAN"  # CLEAN / LOW / MEDIUM / HIGH / CRITICAL

    def add(self, layer: int, layer_name: str, severity: str, description: str, detail: str = ""):
        self.findings.append({
            "layer": layer,
            "layer_name": layer_name,
            "severity": severity,
            "description": description,
            "detail": detail,
        })
        order = ["CLEAN", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
        if order.index(severity) > order.index(self.risk_level):
            self.risk_level = severity

    def is_clean(self) -> bool:
        return self.risk_level == "CLEAN"

    def report(self) -> str:
        lines = []
        sep = "─" * 60
        lines.append(bold(sep))
        lines.append(bold("  PROMPT INJECTION DETECTION REPORT"))
        lines.append(bold(sep))

        if self.is_clean():
            lines.append(green("  ✔  No threats detected — input appears clean"))
        else:
            color_map = {
                "LOW":      yellow,
                "MEDIUM":   yellow,
                "HIGH":     red,
                "CRITICAL": red,
            }
            risk_color = color_map.get(self.risk_level, red)
            lines.append(risk_color(f"  ⚠  Risk level: {self.risk_level}"))
            lines.append("")
            for f in self.findings:
                c = color_map.get(f["severity"], red)
                lines.append(c(f"  [{f['severity']}] Layer {f['layer']} — {f['layer_name']}"))
                lines.append(f"       {f['description']}")
                if f["detail"]:
                    lines.append(cyan(f"       → {f['detail']}"))

        lines.append(bold(sep))
        return "\n".join(lines)


# ═════════════════════════════════════════════
# LAYER 1 — File static checks (image/pdf metadata & color)
# ═════════════════════════════════════════════

def check_exif_metadata(file_path: str, result: DetectionResult):
    """Layer 1b — EXIF metadata extraction without external tools."""
    try:
        with open(file_path, "rb") as f:
            data = f.read()

        # Look for suspicious long strings in raw bytes (hidden text)
        text_chunks = re.findall(rb'[\x20-\x7E]{20,}', data)
        for chunk in text_chunks:
            decoded = chunk.decode("ascii", errors="ignore")
            for pat in INJECTION_PATTERNS:
                if re.search(pat, decoded, re.IGNORECASE):
                    result.add(1, "File Metadata", "CRITICAL",
                               "Injection pattern in file binary data",
                               decoded[:120])
                    return
            if BASE64_PATTERN.search(decoded):
                try:
                    candidate = base64.b64decode(decoded + "==").decode("utf-8", errors="ignore")
                    for pat in INJECTION_PATTERNS:
                        if re.search(pat, candidate, re.IGNORECASE):
                            result.add(1, "File Metadata", "CRITICAL",
                                       "Base64-encoded injection in file binary",
                                       candidate[:120])
                            return
                except Exception:
                    pass

        # PNG tEXt / zTXt chunks
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            offset = 8
            while offset < len(data) - 12:
                length = struct.unpack(">I", data[offset:offset+4])[0]
                chunk_type = data[offset+4:offset+8]
                chunk_data = data[offset+8:offset+8+length]
                if chunk_type in (b'tEXt', b'iTXt'):
                    text = chunk_data.decode("utf-8", errors="ignore")
                    for pat in INJECTION_PATTERNS:
                        if re.search(pat, text, re.IGNORECASE):
                            result.add(1, "PNG Text Chunk", "CRITICAL",
                                       f"Injection in PNG {chunk_type.decode()} chunk",
                                       text[:120])
                if chunk_type == b'zTXt':
                    try:
                        keyword_end = chunk_data.index(b'\x00')
                        compressed = chunk_data[keyword_end+2:]
                        text = zlib.decompress(compressed).decode("utf-8", errors="ignore")
                        for pat in INJECTION_PATTERNS:
                            if re.search(pat, text, re.IGNORECASE):
                                result.add(1, "PNG zTXt Chunk", "HIGH",
                                           "Injection in compressed PNG text chunk",
                                           text[:120])
                    except Exception:
                        pass
                offset += 12 + length

    except Exception as e:
        result.add(1, "File Metadata", "LOW", f"Could not fully parse file: {e}")


def check_multi_resolution_ocr(file_path: str, result: DetectionResult):
    """Layer 1a — Multi-resolution OCR (requires pytesseract + Pillow)."""
    try:
        import pytesseract
        from PIL import Image

        img = Image.open(file_path)
        w, h = img.size
        scales = [1.0, 0.5, 0.25, 0.1]
        texts = {}
        for scale in scales:
            resized = img.resize((max(1, int(w * scale)), max(1, int(h * scale))))
            texts[scale] = pytesseract.image_to_string(resized)

        # Check each scale for injection patterns
        for scale, text in texts.items():
            for pat in INJECTION_PATTERNS:
                if re.search(pat, text, re.IGNORECASE):
                    result.add(1, "Multi-Res OCR", "CRITICAL",
                               f"Injection detected at scale {int(scale*100)}%",
                               text[:120])

        # Downscaling attack: text appears at small scale but not at 100%
        full_words = set(texts[1.0].split())
        for scale in [0.25, 0.1]:
            small_words = set(texts[scale].split())
            hidden = small_words - full_words
            if len(hidden) > 5:
                result.add(1, "Multi-Res OCR", "HIGH",
                           f"Possible downscaling attack — {len(hidden)} words appear only at {int(scale*100)}%",
                           " ".join(list(hidden)[:10]))

    except ImportError:
        result.add(1, "Multi-Res OCR", "LOW",
                   "pytesseract/Pillow not installed — OCR checks skipped")
    except Exception as e:
        result.add(1, "Multi-Res OCR", "LOW", f"OCR error: {e}")


# ═════════════════════════════════════════════
# LAYER 2 — Content / text injection scan
# ═════════════════════════════════════════════

def check_text_injection(text: str, result: DetectionResult):
    """Layer 2 — Scan plain text for injection patterns."""
    for pat in INJECTION_PATTERNS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            start = max(0, m.start() - 30)
            snippet = text[start:m.end() + 30].replace("\n", " ")
            result.add(2, "Text Injection Scan", "CRITICAL",
                       f"Pattern matched: {pat[:60]}",
                       f"...{snippet}...")


def check_unicode_tricks(text: str, result: DetectionResult):
    """Layer 2b — Detect Unicode-based obfuscation."""
    suspicious_ranges = [
        (0x200B, 0x200F, "zero-width characters"),
        (0x202A, 0x202E, "bidirectional override"),
        (0xFFF0, 0xFFFF, "specials block"),
        (0xE0000, 0xE007F, "tag characters (invisible text)"),
    ]
    for start, end, label in suspicious_ranges:
        found = [c for c in text if start <= ord(c) <= end]
        if found:
            result.add(2, "Unicode Obfuscation", "HIGH",
                       f"Found {len(found)} {label} characters",
                       f"Codepoints: {[hex(ord(c)) for c in found[:5]]}")

    # Homoglyph detection: Cyrillic/Greek chars that look like Latin
    homoglyphs = {
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c',
        'х': 'x', 'і': 'i', 'ѕ': 's', 'ԁ': 'd', 'ɡ': 'g',
    }
    found_glyphs = [(c, homoglyphs[c]) for c in text if c in homoglyphs]
    if found_glyphs:
        result.add(2, "Homoglyph Attack", "HIGH",
                   f"Found {len(found_glyphs)} homoglyph chars (look-alike letters)",
                   f"Examples: {found_glyphs[:5]}")


# ═════════════════════════════════════════════
# LAYER 3 — Base64 decode + re-scan
# ═════════════════════════════════════════════

def check_base64_payloads(text: str, result: DetectionResult):
    """Layer 3 — Find and decode base64 strings, then re-scan for injection."""
    candidates = BASE64_PATTERN.findall(text)
    for candidate in candidates:
        # Pad if needed
        padded = candidate + "=" * (-len(candidate) % 4)
        try:
            decoded = base64.b64decode(padded).decode("utf-8", errors="ignore")
            if len(decoded.strip()) < 8:
                continue
            for pat in INJECTION_PATTERNS:
                if re.search(pat, decoded, re.IGNORECASE):
                    result.add(3, "Base64 Payload", "CRITICAL",
                               "Injection pattern found inside base64-encoded string",
                               decoded[:120])
                    return
            # Nested base64
            if BASE64_PATTERN.search(decoded):
                result.add(3, "Base64 Payload", "MEDIUM",
                           "Nested base64 detected — possible multi-layer encoding",
                           decoded[:80])
        except Exception:
            pass


# ═════════════════════════════════════════════
# LAYER 4 — PDF checks
# ═════════════════════════════════════════════

def check_pdf(file_path: str, result: DetectionResult):
    """Layer 4 — Extract all text layers including invisible ones."""
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(file_path)
        if text:
            check_text_injection(text, result)
            check_base64_payloads(text, result)
    except ImportError:
        result.add(4, "PDF Check", "LOW", "pdfminer not installed — PDF text extraction skipped")
    except Exception as e:
        result.add(4, "PDF Check", "LOW", f"PDF parse error: {e}")

    # Raw PDF scan for /JavaScript, /JS, /AA (auto-action)
    try:
        with open(file_path, "rb") as f:
            raw = f.read()
        for keyword in [b"/JavaScript", b"/JS", b"/AA", b"/OpenAction"]:
            if keyword in raw:
                result.add(4, "PDF JavaScript", "CRITICAL",
                           f"PDF contains {keyword.decode()} — possible active content")
    except Exception:
        pass


# ═════════════════════════════════════════════
# LAYER 5 — QR / Barcode
# ═════════════════════════════════════════════

def check_qr_codes(file_path: str, result: DetectionResult):
    """Layer 5 — Decode QR codes in image and scan content."""
    try:
        from pyzbar.pyzbar import decode
        from PIL import Image

        image = Image.open(file_path)
        codes = decode(image)
        for code in codes:
            content = code.data.decode("utf-8", errors="ignore")
            result.add(5, "QR/Barcode", "MEDIUM",
                       f"QR/Barcode found (type: {code.type}), scanning content...",
                       content[:120])
            for pat in INJECTION_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    result.add(5, "QR/Barcode", "CRITICAL",
                               "Injection pattern inside QR/barcode payload",
                               content[:120])
                    break
            check_base64_payloads(content, result)
    except ImportError:
        result.add(5, "QR/Barcode", "LOW", "pyzbar/Pillow not installed — QR checks skipped")
    except Exception as e:
        result.add(5, "QR/Barcode", "LOW", f"QR scan error: {e}")


# ═════════════════════════════════════════════
# LAYER 6 — Runtime / behavioral checks (static simulation)
# ═════════════════════════════════════════════

DANGEROUS_COMMANDS = [
    r"curl\s+https?://",
    r"wget\s+https?://",
    r"nc\s+",                      # netcat
    r"bash\s+-c\s+",
    r"python\s+-c\s+",
    r"eval\(",
    r"exec\(",
    r"os\.system\(",
    r"subprocess\.",
    r"__import__\(",
    r"rm\s+-rf",
    r"dd\s+if=",
    r"chmod\s+[0-7]{3,4}",
    r"ssh\s+",
    r"scp\s+",
    r"cat\s+~/\.(ssh|aws|bash_history|zsh_history)",
    r"\$\(.*\)",                   # command substitution
    r"`.*`",                       # backtick execution
]

def check_command_injection(text: str, result: DetectionResult):
    """Layer 6 — Detect embedded shell/code execution attempts."""
    for pat in DANGEROUS_COMMANDS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            start = max(0, m.start() - 20)
            snippet = text[start:m.end() + 20].replace("\n", " ")
            result.add(6, "Command Injection", "CRITICAL",
                       f"Dangerous command pattern: {pat[:50]}",
                       f"...{snippet}...")


# ═════════════════════════════════════════════
# LAYER 7 — File integrity (hash verification)
# ═════════════════════════════════════════════

def compute_hash(file_path: str) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha.update(chunk)
    return sha.hexdigest()


def check_file_hash(file_path: str, expected_hash: Optional[str], result: DetectionResult):
    """Layer 7 — Verify file integrity against known hash."""
    actual = compute_hash(file_path)
    if expected_hash:
        if actual.lower() != expected_hash.lower():
            result.add(7, "File Integrity", "CRITICAL",
                       "Hash mismatch — file was modified after creation",
                       f"Expected: {expected_hash}\nActual:   {actual}")
        else:
            result.add(7, "File Integrity", "LOW",
                       "Hash verified — file intact", actual)
    else:
        # Just report the hash
        result.add(7, "File Integrity", "LOW",
                   "No reference hash provided — computed hash for reference", actual)


# ═════════════════════════════════════════════
# MAIN SCANNER
# ═════════════════════════════════════════════

def scan_text(text: str) -> DetectionResult:
    """Scan a plain-text string through all applicable layers."""
    result = DetectionResult()
    check_text_injection(text, result)
    check_unicode_tricks(text, result)
    check_base64_payloads(text, result)
    check_command_injection(text, result)
    return result


def scan_file(file_path: str, expected_hash: Optional[str] = None) -> DetectionResult:
    """Scan a file (image / PDF / text) through all applicable layers."""
    result = DetectionResult()
    path = Path(file_path)

    if not path.exists():
        result.add(0, "File Check", "CRITICAL", f"File not found: {file_path}")
        return result

    ext = path.suffix.lower()

    # Layer 7 — always first for files
    check_file_hash(file_path, expected_hash, result)

    if ext in (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff"):
        check_exif_metadata(file_path, result)
        check_multi_resolution_ocr(file_path, result)
        check_qr_codes(file_path, result)

    elif ext == ".pdf":
        check_exif_metadata(file_path, result)
        check_pdf(file_path, result)

    elif ext in (".txt", ".md", ".csv", ".json", ".xml", ".html"):
        with open(file_path, "r", errors="ignore") as f:
            text = f.read()
        check_text_injection(text, result)
        check_unicode_tricks(text, result)
        check_base64_payloads(text, result)
        check_command_injection(text, result)

    else:
        # Generic binary: scan for printable text segments
        check_exif_metadata(file_path, result)

    return result


# ═════════════════════════════════════════════
# CLI entry point
# ═════════════════════════════════════════════

def usage():
    print(f"""
{bold('Prompt Injection Detector')}

Usage:
  {cyan('python prompt_injection_detector.py text')}   — scan stdin or typed text
  {cyan('python prompt_injection_detector.py file <path> [expected_sha256]')}

Examples:
  echo "Ignore all previous instructions" | python prompt_injection_detector.py text
  python prompt_injection_detector.py file ./image.png
  python prompt_injection_detector.py file ./doc.pdf abc123...
""")


def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        usage()
        return

    mode = args[0].lower()

    if mode == "text":
        if len(args) > 1:
            text = " ".join(args[1:])
        else:
            print(cyan("Paste text to scan (Ctrl+D when done):"))
            text = sys.stdin.read()
        result = scan_text(text)
        print(result.report())
        sys.exit(0 if result.is_clean() else 1)

    elif mode == "file":
        if len(args) < 2:
            print(red("Error: provide a file path"))
            usage()
            sys.exit(2)
        file_path = args[1]
        expected_hash = args[2] if len(args) > 2 else None
        result = scan_file(file_path, expected_hash)
        print(result.report())
        sys.exit(0 if result.is_clean() else 1)

    else:
        # Treat entire argument as text to scan
        result = scan_text(" ".join(args))
        print(result.report())
        sys.exit(0 if result.is_clean() else 1)


if __name__ == "__main__":
    main()
