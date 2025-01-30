import json

def write_data(is_active_now, common_cards=[], players=[], odds=[]):
    players_dicts = []
    for index in range(len(players)):
        player = players[index]
        if len(player) != 2:
            continue
        players_dicts.append({
            "cards": [player[0], player[1]], 
            "odds": odds[index] if index < len(odds) else None
        })
    result_data = {
        "is_active_now": is_active_now, 
        "common_cards": common_cards, 
        "players": players_dicts
    }

    with open("data/external.json", 'w') as data_file:
        print(json.dumps(result_data, ensure_ascii=False, indent=4), file=data_file)
