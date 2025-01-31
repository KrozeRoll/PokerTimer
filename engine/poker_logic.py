import random
from table import HoldemTable

def change_card_format(card): 
    return card[0] + card[1].lower()

def calc_odds(players, common_cards):
    holdem_game = HoldemTable(num_players=len(players), deck_type='full')
    holdem_game.add_to_community(map(change_card_format, common_cards))
    for index in range(len(players)):
        holdem_game.add_to_hand(index + 1, map(change_card_format, players[index]))
    
    if (len(common_cards) < 5):
        simulate_result = holdem_game.simulate(num_scenarios=10000)
        odds_list = []
        for index in range(len(players)): 
            odds_list.append(
                float(simulate_result[f"Player {index + 1} Win"] / 100) + 
                float(simulate_result[f"Player {index + 1} Tie"] / 100)
            )
    else: 
        game_result = holdem_game.view_result()
        winners = []
        if ("ties" not in game_result): 
            winners.append(game_result.split(" ")[1])
        else: 
            winners = game_result[7:game_result.find("ties")].split(", ")

        winner_odds = 1 / len(winners)
        winners = list(map(lambda player_num: int(player_num) - 1, winners))
        odds_list = []
        for index in range(len(players)):
            if index in winners: 
                odds_list.append(winner_odds)
            else:
                odds_list.append(0)
    return odds_list

# players = [["AC", "AD"], ["KC", "KD"]]
# common = ["AH", "AS", "5H", "6H"]
# print(calc_odds(players, common))