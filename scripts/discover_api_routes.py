#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "backend" / "src" / "main" / "java"

CLASS_REQ_RE = re.compile(r"@RequestMapping\(([^)]*)\)", re.MULTILINE)
METHOD_RE = re.compile(r"@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(([^)]*)\)", re.MULTILINE)
STRING_RE = re.compile(r'"([^"]+)"')

HTTP_MAP = {
    "GetMapping": "GET",
    "PostMapping": "POST",
    "PutMapping": "PUT",
    "DeleteMapping": "DELETE",
    "PatchMapping": "PATCH",
}


def parse_paths(arg_text: str):
    vals = STRING_RE.findall(arg_text)
    if not vals:
        return [""]
    # first string literal is enough for current project style
    return [vals[0]]


routes = []
for file in SRC.rglob("*Controller.java"):
    text = file.read_text(encoding="utf-8")
    class_base = ""
    cm = CLASS_REQ_RE.search(text)
    if cm:
        class_paths = parse_paths(cm.group(1))
        class_base = class_paths[0]

    for mm in METHOD_RE.finditer(text):
        ann, args = mm.groups()
        method = HTTP_MAP[ann]
        method_paths = parse_paths(args)
        sub = method_paths[0]
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
