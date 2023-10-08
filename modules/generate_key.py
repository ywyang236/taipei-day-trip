import subprocess

def generate_complex_value():
    result = subprocess.run(["openssl", "rand", "-base64", "32"], capture_output=True, text=True)
    return result.stdout.strip()

print(generate_complex_value())