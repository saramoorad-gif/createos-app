#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Export all UI code (pages, components, layouts, styles) into a
# single text file for feeding to Claude Design / any AI UI tool.
#
# Excludes: API routes, migrations, config files, node_modules, .next
# Includes: pages, components, layouts, Tailwind config, globals.css
#
# Usage: bash scripts/export-ui-for-claude.sh
# Output: createsuite-ui-export.txt (in project root)
# ═══════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

OUT="createsuite-ui-export.txt"
rm -f "$OUT"

echo "# CreateSuite — Full UI Codebase Export" > "$OUT"
echo "" >> "$OUT"
echo "Generated: $(date)" >> "$OUT"
echo "" >> "$OUT"
echo "## Stack" >> "$OUT"
echo "- Next.js 14 App Router" >> "$OUT"
echo "- Tailwind CSS (design tokens in tailwind.config.ts)" >> "$OUT"
echo "- Design system: cream #FAF8F4, beige #F0EAE0, pale blue #F2F8FB," >> "$OUT"
echo "  accent blue #7BAFC8, navy #1E3F52, ink #1A2C38" >> "$OUT"
echo "- Fonts: Instrument Serif (display italics), DM Sans (body), IBM Plex Mono" >> "$OUT"
echo "- Route groups: (marketing) public marketing site," >> "$OUT"
echo "  (public) signup/login/checkout," >> "$OUT"
echo "  (app) authenticated app" >> "$OUT"
echo "" >> "$OUT"
echo "---" >> "$OUT"
echo "" >> "$OUT"

write_file() {
  local file="$1"
  echo "" >> "$OUT"
  echo "---" >> "$OUT"
  echo "" >> "$OUT"
  echo "## \`$file\`" >> "$OUT"
  echo "" >> "$OUT"

  # Pick language hint from extension
  case "$file" in
    *.tsx|*.ts) lang="tsx" ;;
    *.css) lang="css" ;;
    *.json) lang="json" ;;
    *) lang="" ;;
  esac

  echo "\`\`\`$lang" >> "$OUT"
  cat "$file" >> "$OUT"
  echo "\`\`\`" >> "$OUT"
}

# ─── 1. Design system config ─────────────────────────────
echo "## 1. DESIGN SYSTEM CONFIG" >> "$OUT"
[ -f "tailwind.config.ts" ] && write_file "tailwind.config.ts"
[ -f "tailwind.config.js" ] && write_file "tailwind.config.js"
[ -f "src/app/globals.css" ] && write_file "src/app/globals.css"
[ -f "src/app/layout.tsx" ] && write_file "src/app/layout.tsx"

# ─── 2. Marketing site ──────────────────────────────────
echo "" >> "$OUT"
echo "# 2. MARKETING SITE (createsuite.co public pages)" >> "$OUT"
find "src/app/(marketing)" -name "*.tsx" 2>/dev/null | sort | while read f; do
  write_file "$f"
done

# ─── 3. Public routes (signup, login, checkout, etc.) ───
echo "" >> "$OUT"
echo "# 3. PUBLIC ROUTES (signup, login, checkout, onboarding)" >> "$OUT"
find "src/app/(public)" -name "*.tsx" 2>/dev/null | sort | while read f; do
  write_file "$f"
done

# ─── 4. Authenticated app pages ─────────────────────────
echo "" >> "$OUT"
echo "# 4. APP PAGES (authenticated creator + agency app)" >> "$OUT"
find "src/app/(app)" -name "*.tsx" 2>/dev/null | sort | while read f; do
  write_file "$f"
done

# ─── 5. Admin pages ─────────────────────────────────────
echo "" >> "$OUT"
echo "# 5. ADMIN PORTAL" >> "$OUT"
find "src/app/admin" -name "*.tsx" 2>/dev/null | sort | while read f; do
  write_file "$f"
done

# ─── 6. Shared components ───────────────────────────────
echo "" >> "$OUT"
echo "# 6. SHARED COMPONENTS" >> "$OUT"
find "src/components" -name "*.tsx" 2>/dev/null | sort | while read f; do
  write_file "$f"
done

# ─── 7. Summary ─────────────────────────────────────────
{
  echo ""
  echo "---"
  echo ""
  echo "## Export summary"
  echo ""
  FILE_COUNT=$(grep -c '^## `' "$OUT")
  echo "- Files included: $FILE_COUNT"
  echo "- Total characters: $(wc -c < "$OUT" | tr -d ' ')"
} >> "$OUT"

echo "✓ Exported to: $OUT"
echo "  Files: $(grep -c '^## `' "$OUT")"
echo "  Size:  $(du -h "$OUT" | cut -f1)"
