import json

with open("data/external.json", 'r') as data_file:
    data = json.load(data_file)

data["is_active_now"] = not data["is_active_now"]

with open("data/external.json", 'w') as data_file:
    print(json.dumps(data, ensure_ascii=False, indent=4), file=data_file)
