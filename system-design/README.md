# ArmyVerse System Design Documentation

This directory contains modular LaTeX files for the complete system design documentation.

## Files Structure

```
system-design/
├── main.tex                    # Main document (compile this)
├── 01-architecture.tex         # High-level system architecture
├── 02-api-endpoints.tex        # API endpoints mapping
├── 03-database.tex             # Database schema & models
├── 04-components.tex           # Frontend components
├── 05-services.tex             # External services integration
├── 06-dataflows.tex            # Data flow diagrams
├── 07-game-system.tex          # Game system (Boraverse) flow
├── 08-tech-stack.tex           # Technology stack summary
├── Makefile                    # Build automation
└── README.md                   # This file
```

## Prerequisites

Install LaTeX distribution:

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install texlive-full texlive-latex-extra
```

### macOS
```bash
brew install --cask mactex
```

### Windows
Download and install MiKTeX or TeX Live from:
- https://miktex.org/
- https://www.tug.org/texlive/

## Compilation

### Method 1: Using Makefile (Recommended)
```bash
cd system-design/
make
```

This will:
1. Compile the LaTeX document
2. Generate `system-design.pdf`
3. Clean up temporary files

Other Makefile commands:
```bash
make clean      # Remove temporary files
make cleanall   # Remove all generated files including PDF
make view       # Compile and open PDF (Linux/macOS)
```

### Method 2: Manual Compilation
```bash
cd system-design/
pdflatex main.tex
pdflatex main.tex  # Run twice for proper references
```

### Method 3: Using latexmk
```bash
cd system-design/
latexmk -pdf main.tex
```

## Output

The compilation will generate:
- **system-design.pdf** - The complete system design document

## Viewing the PDF

### Linux
```bash
xdg-open system-design.pdf
```

### macOS
```bash
open system-design.pdf
```

### Windows
```bash
start system-design.pdf
```

## Customization

To modify specific sections:
1. Edit the corresponding `.tex` file (e.g., `03-database.tex` for database schema)
2. Recompile using `make` or `pdflatex main.tex`

## Document Contents

1. **High-Level Architecture** - Complete system overview with all layers
2. **API Endpoints** - All 50+ API routes categorized by domain
3. **Database Schema** - 18 MongoDB models with relationships
4. **Components** - 50+ React components organized by feature
5. **Services Integration** - Firebase, Spotify, YouTube, Gemini, Cloudinary
6. **Data Flows** - Authentication and playlist generation flows
7. **Game System** - Boraverse quiz, craft, mastery mechanics
8. **Tech Stack** - Complete technology stack with versions

## Troubleshooting

### Missing TikZ library error
Install additional packages:
```bash
sudo apt-get install texlive-pictures
```

### Font issues
Ensure you have the Helvetica font or install:
```bash
sudo apt-get install texlive-fonts-recommended
```

### Compilation errors
- Run `pdflatex` twice for cross-references
- Check that all `.tex` files are in the same directory
- Ensure no syntax errors in individual files

## Notes

- Document is optimized for landscape orientation
- Uses TikZ for professional system diagrams
- Industry-standard color coding for different components
- Modular design allows easy updates to specific sections
