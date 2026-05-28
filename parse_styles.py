import json

def traverse(node):
    if isinstance(node, dict):
        if 'textPreview' in node and "Diverse solutions" in node.get('textPreview', ''):
            print(f"ID: {node.get('id')}")
            print(f"Styles: {json.dumps(node.get('sectionStyles', {}), indent=2)}")
            print("-" * 40)
        for key, value in node.items():
            traverse(value)
    elif isinstance(node, list):
        for item in node:
            traverse(item)

with open("data/design-extracts/home.json") as f:
  data = json.load(f)

traverse(data)
