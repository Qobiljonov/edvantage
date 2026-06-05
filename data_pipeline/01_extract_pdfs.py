import os
import pymupdf4llm  # type: ignore

# Define paths based on your project architecture
# We use relative paths assuming you run this from inside the data_pipeline/ folder
RAW_PDF_DIR = "../data/raw_pdfs/"
MD_OUTPUT_DIR = "../data/processed_markdown/"

def extract_pdfs_to_markdown():
    # Ensure the output directory exists
    os.makedirs(MD_OUTPUT_DIR, exist_ok=True)
    
    # Loop through all PDFs in the raw folder
    for filename in os.listdir(RAW_PDF_DIR):
        if filename.lower().endswith(".pdf"):
            pdf_path = os.path.join(RAW_PDF_DIR, filename)
            print(f"Processing: {filename}...")
            
            # The magic step: Extract PDF directly to Markdown format
            md_text = pymupdf4llm.to_markdown(pdf_path)
            
            # Save the new Markdown file
            md_filename = filename.replace(".pdf", ".md")
            md_path = os.path.join(MD_OUTPUT_DIR, md_filename)
            
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_text)
                
            print(f"Successfully saved Markdown to: {md_path}\n")

if __name__ == "__main__":
    print("Starting extraction pipeline...")
    extract_pdfs_to_markdown()
    print("Extraction complete!")