import base64

# Path to your .dex file
dex_path = "menu.dex"
# Output text file to save the Base64 string
output_path = "menu_base64.txt"

with open(dex_path, "rb") as f:
    dex_bytes = f.read()

dex_b64 = base64.b64encode(dex_bytes).decode("utf-8")

with open(output_path, "w") as f:
    f.write(dex_b64)

print("Base64 string saved to", output_path)
