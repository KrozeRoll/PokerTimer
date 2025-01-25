const ROUNDS_STRING = `
1. [+0:00] -- 25 / 50
2. [+0:15] -- 50 / 100
3. [+0:30] -- 75 / 150
4. [+0:45] -- 100 / 200
5. [+1:00] -- 100 / 200 (ante = 25)
6. [+1:15] -- 125 / 250 (ante = 25)
7. [+1:30] -- 175 / 350 (ante = 50)
8. [+1:45] -- 200 / 400 (ante = 50)
9. [+2:00] -- 300 / 600 (ante = 75)
10. [+2:15] -- 500 / 1000 (ante = 100)
11. [+2:30] -- 700 / 1400 (ante = 200)
12. [+2:45] -- 1000 / 2000 (ante = 300)
`;
const ROUND_DURATION_MINUTES = 1
const ROUNDS = parseRoundsData(ROUNDS_STRING)

let currentRound = 0
let isStarted = false
let currentRoundSeconds = 0
let timerInterval

playButton = document.getElementById("play")
prevRoundButton = document.getElementById("prev_round")
nextRoundButton = document.getElementById("next_round")
timeDisplay = document.getElementById("time")
progressBarDisplay = document.getElementById("progress_bar")

playButton.onclick = clickPlay
prevRoundButton.onclick = clickPrevRound
nextRoundButton.onclick = clickNextRound

dataFetchInterval = setInterval(dataFetch, 1000)

function dataFetch() {
    fetch("./../data/external.json")
    .then((res) => res.text())
    .then((text) => {
        // console.log(text)
    })
    .catch((e) => console.error(e));
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