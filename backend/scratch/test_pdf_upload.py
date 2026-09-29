import io
import os
import requests

# Test app endpoint with PyPDF2 and sample text
from PyPDF2 import PdfWriter
def create_sample_pdf(filename, text):
    # Create simple PDF file using PyPDF2 / pdf generator or text
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    # Write page content
    with open(filename, "wb") as f:
        writer.write(f)

print("Testing python backend endpoints...")
