import os

def create_java_files():
    for i in range(1, 11):
        filename = f"j{i}.java"
        with open(filename, 'w') as file:
            file.write(f"""public class j{i} {{
    public static void main(String[] args) {{
        System.out.println("This is {filename}");
    }}
}}
""")
        print(f"Created {filename}")

if __name__ == "__main__":
    create_java_files()