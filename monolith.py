import os
import glob
import re

# Move catalog to fitness/catalog
os.system("git mv catalog fitness/catalog")

# We need to rewrite imports in fitness/catalog/**/*.py and fitness/**/*.py
# catalog.xxx -> fitness.catalog.xxx

def rewrite_file(filepath):
    try:
        with open(filepath, "r") as f:
            content = f.read()
    except Exception:
        return

    # from catalog... import ... -> from fitness.catalog... import ...
    new_content = re.sub(r"from\s+catalog(\.| )", r"from fitness.catalog\1", content)
    new_content = re.sub(r"import\s+catalog(\.| )", r"import fitness.catalog\1", new_content)

    if new_content != content:
        with open(filepath, "w") as f:
            f.write(new_content)

for ext in ["fitness/**/*.py", "fitness-devctl"]:
    for filepath in glob.glob(ext, recursive=True):
        if os.path.isfile(filepath):
            rewrite_file(filepath)

print("Moved catalog into fitness and rewritten imports.")
