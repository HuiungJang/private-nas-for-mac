#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "backend" / "src" / "main" / "java"

CLASS_REQ_RE = re.compile(r"@RequestMapping\(([^)]*)\)", re.MULTILINE)
METHOD_RE = re.compile(r"@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(([^)]*)\)", re.MULTILINE)
STRING_RE = re.compile(r'"([^"]+)"')
PATH_ATTR_RE = re.compile(r"(?:value|path)\s*=\s*\{?([^}]*)\}?")

HTTP_MAP = {
    "GetMapping": "GET",
    "PostMapping": "POST",
    "PutMapping": "PUT",
    "DeleteMapping": "DELETE",
    "PatchMapping": "PATCH",
}


def parse_paths(arg_text: str):
    arg_text = (arg_text or "").strip()
    if not arg_text:
        return [""]

    m = PATH_ATTR_RE.search(arg_text)
    if m:
        vals = STRING_RE.findall(m.group(1))
        return vals or [""]

    vals = STRING_RE.findall(arg_text)
    return vals or [""]


routes = []
for file in SRC.rglob("*Controller.java"):
    text = file.read_text(encoding="utf-8")
    class_base = ""
    cm = CLASS_REQ_RE.search(text)
    class_paths = [""]
    if cm:
        class_paths = parse_paths(cm.group(1))

    for mm in METHOD_RE.finditer(text):
        ann, args = mm.groups()
        method = HTTP_MAP[ann]
        method_paths = parse_paths(args)
        for class_base in class_paths:
            for sub in method_paths:
                full = (class_base.rstrip("/") + "/" + sub.lstrip("/")).replace("//", "/")
                if not full.startswith("/"):
                    full = "/" + full
                routes.append({
                    "method": method,
                    "path": full,
                    "source": str(file.relative_to(ROOT)),
                })

# dedupe
uniq = {(r["method"], r["path"]): r for r in routes}
out = [uniq[k] for k in sorted(uniq.keys())]
print(json.dumps(out, ensure_ascii=False))
