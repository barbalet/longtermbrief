#!/bin/bash

# Check if output filename is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 output_filename.c"
    exit 1
fi

output_file="$1"

# Check if output file already exists
if [ -f "$output_file" ]; then
    read -p "File $output_file already exists. Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Find all .c files in current directory
c_files=$(find . -maxdepth 1 -type f -name "*.c" | sort)

if [ -z "$c_files" ]; then
    echo "No .c files found in current directory."
    exit 1
fi

# Create the combined file
echo "/* Combined C files - Generated on $(date) */" > "$output_file"
echo "" >> "$output_file"

# Process each .c file
for file in $c_files; do
    if [ "$(realpath "$file")" != "$(realpath "$output_file")" ]; then
        echo "/* Start of file: $file */" >> "$output_file"
        cat "$file" >> "$output_file"
        echo "" >> "$output_file"
        echo "/* End of file: $file */" >> "$output_file"
        echo "" >> "$output_file"
    fi
done

echo "Successfully combined $(echo "$c_files" | wc -l) .c files into $output_file"
