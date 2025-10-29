# Makefile for ArmyVerse System Design Documentation

# Output filename
OUTPUT = system-design
MAIN = main

# LaTeX compiler
LATEX = pdflatex
LATEX_FLAGS = -interaction=nonstopmode -halt-on-error

# PDF viewer (adjust based on OS)
ifeq ($(shell uname), Darwin)
    VIEWER = open
else ifeq ($(shell uname), Linux)
    VIEWER = xdg-open
else
    VIEWER = start
endif

# Default target
.PHONY: all
all: $(OUTPUT).pdf

# Compile the LaTeX document
$(OUTPUT).pdf: $(MAIN).tex *.tex
	@echo "Compiling LaTeX document..."
	$(LATEX) $(LATEX_FLAGS) $(MAIN).tex
	@echo "Running second pass for references..."
	$(LATEX) $(LATEX_FLAGS) $(MAIN).tex
	@mv $(MAIN).pdf $(OUTPUT).pdf
	@echo "Successfully generated $(OUTPUT).pdf"

# Clean temporary files
.PHONY: clean
clean:
	@echo "Cleaning temporary files..."
	@rm -f *.aux *.log *.out *.toc *.nav *.snm *.vrb *.bbl *.blg *.synctex.gz
	@echo "Cleanup complete"

# Clean all generated files including PDF
.PHONY: cleanall
cleanall: clean
	@echo "Removing PDF..."
	@rm -f $(OUTPUT).pdf $(MAIN).pdf
	@echo "All generated files removed"

# Compile and view
.PHONY: view
view: $(OUTPUT).pdf
	@echo "Opening PDF..."
	@$(VIEWER) $(OUTPUT).pdf

# Quick compile (single pass)
.PHONY: quick
quick:
	@echo "Quick compilation (single pass)..."
	$(LATEX) $(LATEX_FLAGS) $(MAIN).tex
	@mv $(MAIN).pdf $(OUTPUT).pdf

# Watch mode (requires latexmk)
.PHONY: watch
watch:
	@echo "Starting watch mode..."
	@latexmk -pdf -pvc $(MAIN).tex

# Help
.PHONY: help
help:
	@echo "ArmyVerse System Design - Makefile Commands"
	@echo "==========================================="
	@echo "make          - Compile the document (default)"
	@echo "make clean    - Remove temporary files"
	@echo "make cleanall - Remove all generated files"
	@echo "make view     - Compile and open PDF"
	@echo "make quick    - Quick compile (single pass)"
	@echo "make watch    - Watch mode (requires latexmk)"
	@echo "make help     - Show this help message"
