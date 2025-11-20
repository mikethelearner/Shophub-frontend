#!/bin/bash

# This script converts the SVG favicon to various PNG sizes
# Requires Inkscape or other SVG converter to be installed

# Convert SVG to 16x16 favicon.ico
echo "Converting SVG to favicon.ico..."
convert -background transparent favicon.svg -define icon:auto-resize=16,32,48,64 favicon.ico

# Convert SVG to 192x192 PNG for Android
echo "Converting SVG to favicon-192.png..."
convert -background transparent favicon.svg -resize 192x192 favicon-192.png

# Convert SVG to 512x512 PNG for PWA
echo "Converting SVG to favicon-512.png..."
convert -background transparent favicon.svg -resize 512x512 favicon-512.png

# Convert SVG to 180x180 PNG for Apple Touch Icon
echo "Converting SVG to apple-touch-icon.png..."
convert -background transparent favicon.svg -resize 180x180 apple-touch-icon.png

echo "Conversion complete!" 