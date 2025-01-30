import script_config
import telebot
import data_io
import poker_logic

CARD_TYPES = ["S", "C", "D", "H"]
CARD_VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
TYPE_TO_EMOJI = {
    "S": "♠",
    "C": "♣",
    "D": "♦",
    "H": "♥"
}


bot = telebot.TeleBot(script_config.BOT_TOKEN)

common_cards = []
players = []


@bot.message_handler(commands=['start'])
def welcome(message):
    chat_id = message.chat.id
    keyboard = telebot.types.ReplyKeyboardMarkup()
    button_start = telebot.types.InlineKeyboardButton(
        text="Action")
    button_stop = telebot.types.InlineKeyboardButton(
        text="Stop")
    keyboard.add(button_start).add(button_stop)
    bot.send_message(chat_id,
                     "Game start",
                     reply_markup=keyboard)


@bot.message_handler(
    func=lambda message: message.text == 'Action')
def start_action(message):
    global common_cards, players
    common_cards = []
    players = []

    chat_id = message.chat.id
    keyboard = telebot.types.InlineKeyboardMarkup()
    for value in CARD_VALUES:
        card_buttons = []
        for type in CARD_TYPES: 
            card_display_text = (value if value != "T" else "10")  + TYPE_TO_EMOJI[type]
            card_button = telebot.types.InlineKeyboardButton(
                text=card_display_text,
                callback_data=f"player_{value}{type}"
            )
            card_buttons.append(card_button)
        keyboard.row(*card_buttons)
    
    end_button = telebot.types.InlineKeyboardButton(text="End",
                                                     callback_data="end_players")
    keyboard.row(end_button)
    bot.send_message(chat_id, 'Players cards', reply_markup=keyboard)

@bot.callback_query_handler(func=lambda call: call.data == "end_players")
def end_players(call):
    chat_id = call.message.chat.id
    keyboard = telebot.types.InlineKeyboardMarkup()
    for value in CARD_VALUES:
        card_buttons = []
        for type in CARD_TYPES: 
            card_display_text = (value if value != "T" else "10") + TYPE_TO_EMOJI[type]
            card_button = telebot.types.InlineKeyboardButton(
                text=card_display_text,
                callback_data=f"common_{value}{type}"
            )
            card_buttons.append(card_button)
        keyboard.row(*card_buttons)
    
    end_button = telebot.types.InlineKeyboardButton(text="Print",
                                                     callback_data="print_common")
    keyboard.row(end_button)
    bot.send_message(chat_id, 'Common cards', reply_markup=keyboard)
    bot.answer_callback_query(call.id, text=f"Players end")

@bot.callback_query_handler(func=lambda call: call.data.startswith("player_"))
def add_player(call):
    card = call.data.split("_")[1]
    if (len(players) == 0 or len(players[-1]) == 2): 
        players.append([])
    players[-1].append(card)
    bot.answer_callback_query(call.id, text=f"Added to player {len(players)}: {card}")

@bot.callback_query_handler(func=lambda call: call.data.startswith("common_"))
def add_common(call):
    card = call.data.split("_")[1]
    common_cards.append(card)
    # data_io.write_data(True, common_cards, players)
    bot.answer_callback_query(call.id, text=f"Added to common: {card} ")

@bot.callback_query_handler(func=lambda call: call.data == "print_common")
def print_common(call):
    odds = []
    for player in players:
        odds.append(poker_logic.calc_odds(player, common_cards))
    data_io.write_data(True, common_cards, players, odds)
    bot.answer_callback_query(call.id, text=f"Printed")

@bot.message_handler(func=lambda message: message.text == 'Stop')
def stop_action(message):    
    global common_cards, players
    common_cards = []
    players = []
    data_io.write_data(False)

if __name__ == '__main__':
    print('Бот запущен!')
    bot.infinity_polling()