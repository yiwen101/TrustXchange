import os
import re

def rename_files_in_folder(folder_path):
    # Regular expression to match the class name
    class_pattern = re.compile(r'public\s+class\s+(\w+)\s*\{')

    # Iterate over all files in the folder
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        # Only process files (skip directories)
        if os.path.isfile(file_path):
            with open(file_path, 'r') as file:
                content = file.read()

                # Search for the class name in the file content
                match = class_pattern.search(content)
                if match:
                    class_name = match.group(1)
                    new_filename = f"{class_name}.java"
                    new_file_path = os.path.join(folder_path, new_filename)

                    # Rename the file
                    os.rename(file_path, new_file_path)
                    print(f"Renamed '{filename}' to '{new_filename}'")

# Example usage
folder_path = './src/main/java/com/trustXchange/DTO/P2P'
rename_files_in_folder(folder_path)