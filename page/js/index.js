const ROUNDS_STRING = `
1. [+0:00] -- 25 / 50
2. [+0:15] -- 50 / 100
3. [+0:30] -- 75 / 150
4. [+0:45] -- 100 / 200
5. [+1:00] -- 125 / 250
6. [+1:15] -- 175 / 350
7. [+1:30] -- 200 / 400
8. [+1:45] -- 300 / 600
9. [+2:00] -- 500 / 1000
10. [+2:15] -- 700 / 1400
11. [+2:30] -- 1000 / 2000
12. [+2:45] -- 1500 / 3000
`;
const ROUND_DURATION_MINUTES = 15
const ROUNDS = parseRoundsData(ROUNDS_STRING)

let currentRound = 0
let isStarted = false
let currentRoundSeconds = 0
let timerInterval
let jsonData = []
let is_active_view_now = false

const playButton = document.getElementById("play")
const prevRoundButton = document.getElementById("prev_round")
const nextRoundButton = document.getElementById("next_round")
const timeDisplay = document.getElementById("time")
const progressBarDisplay = document.getElementById("progress_bar")

playButton.onclick = clickPlay
prevRoundButton.onclick = clickPrevRound
nextRoundButton.onclick = clickNextRound

const dataFetchInterval = setInterval(dataFetch, 3000)

async function getFileData(filePath) {
    try {
        const response = await fetch(filePath);

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch file:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching file:', error);
    }
}

async function dataFetch() {
    const newData = await getFileData("./../data/external.json")
    const hasUpdate = JSON.stringify(newData) !== JSON.stringify(jsonData);
    if (hasUpdate) {
        if (newData["is_active_now"]) {
            if (!is_active_view_now) {
                document.getElementById("active_view").style.display = "block"
                document.getElementById("timer_rounds").style.display = "none"
                document.getElementById("level").textContent = "It's All In!"
                
                is_active_view_now = true
            }
            updateActiveView(newData)
        } else {
            if (is_active_view_now) {
                document.getElementById("active_view").style.display = "none"
                document.getElementById("timer_rounds").style.display = "flex"
                
                document.getElementById("level").textContent = `Round ${currentRound + 1}`
                cleanActiveView()
                is_active_view_now = false
            }
        }
        jsonData = newData
    }
}

// "players": [
//         {
//             "cards": [
//                 "2D",
//                 "2C"
//             ],
//             "odds": 0.8,
//             "out_cards": [
//                 "2D",
//                 "2C"
//             ]
//         },

function updateActiveView(situationData) {
    console.log("To Update")
    cleanActiveView()
    const common_cards = situationData["common_cards"]
    common_cards.forEach((card, index) => {
        document.getElementById(`open${index}`).getElementsByTagName("img")[0].src = getCardPath(card)
    })

    const playersData = situationData["players"]
    playersData.forEach((item, index) => {
        document.getElementById(`player${index}`).style.display="flex"

        const cards = item["cards"].map((card) => (getCardPath(card)))
        document.getElementById(`player${index}_0`).getElementsByTagName("img")[0].src = cards[0]
        document.getElementById(`player${index}_1`).getElementsByTagName("img")[0].src = cards[1]

        document.getElementById(`odds${index}`).textContent = `${(item["odds"] * 100).toFixed(2)}%`
    })
}

function cleanActiveView() {
    console.log("To Clean")
    for (let i = 0; i < 6; i++) {
        document.getElementById(`player${i}`).style.display="none"
    }
    for (let i = 0; i < 5; i++) {
        document.getElementById(`open${i}`).getElementsByTagName("img")[0].src = getCardPath("1B")
    }
}

function getCardPath(card) {
    return `svg/cards/${card}.svg`
}

function parseRoundsData(roundsString) {
    const result = []
    roundsString.matchAll(/.*?-- (\d+) \/ (\d+)( \(ante = (\d+)\))?$/gm).forEach((item) => {
        result.push([Number(item[1] || 0), Number(item[2] || 0), Number(item[4] || 0), ROUND_DURATION_MINUTES])
    })
    return result
}

function newRound(roundNumber) {
    // console.log(readDB("./data/external.json"))
    const currentBlindDisplay = document.getElementById("game_blinds")
    const nextBlindDisplay = document.getElementById("blinds_next")
    const currentAnteDisplay = document.getElementById("game_ante")
    const nextAnteDisplay = document.getElementById("ante_next")
    const levelDisplay = document.getElementById("level")

    const currentRoundData = ROUNDS[roundNumber]
    currentBlindDisplay.textContent = `${currentRoundData[0]} / ${currentRoundData[1]}`
    currentAnteDisplay.textContent = `${currentRoundData[2]}`
    levelDisplay.textContent = `Round ${roundNumber + 1}`
    currentRoundSeconds = currentRoundData[3] * 60
    displaySeconds(currentRoundSeconds, 0)
    currentRound = roundNumber
    cleanActiveView()
    // TODO: Play sound

    if (roundNumber + 1 < ROUNDS.length) {
        const nextRoundData = ROUNDS[roundNumber + 1]
        nextBlindDisplay.textContent = `Next ${nextRoundData[0]} / ${nextRoundData[1]}`
        nextAnteDisplay.textContent = `Next ${nextRoundData[2]}`
    }
}

function clickPlay() {
    if (isStarted) {
        return clickStop()
    }
    return clickStart()
}

function clickStart() {
    isStarted = true
    playButton.style.backgroundImage = "url(./svg/pause.svg)"
    timerInterval = setInterval(updateTimer, 1000);
}

function clickStop() {
    isStarted = false
    playButton.style.backgroundImage = "url(./svg/play.svg)"
    clearInterval(timerInterval)
}

function clickPrevRound() {
    if (currentRound > 0) {
        currentRound--
        newRound(currentRound)
    }
}

function clickNextRound() {
    if (currentRound + 1 < ROUNDS.length) {
        currentRound++
        newRound(currentRound)
    }
}

function displaySeconds(currentSeconds, progressRate) {
    const minutes = Math.floor(currentSeconds / 60)
    const seconds = currentSeconds % 60
    
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    progressBarDisplay.style.width = `${(progressRate * 100)}%`
    
}

function updateTimer() {
    currentRoundSeconds--
    displaySeconds(currentRoundSeconds, 1 - currentRoundSeconds / (ROUNDS[currentRound][3] * 60))

    if (currentRoundSeconds <= 0 && currentRound + 1 < ROUNDS.length) {
        currentRound++
        newRound(currentRound)
    }
}