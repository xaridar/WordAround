let wordList = [];
let letterNum = 6;
const startGiven = 4;
let points = 0;
let gameOver = true;
let letterSpaces, guessBtn, pointsWorth, totalPoints;
let acceptLetters = false;
let rounds = 0;

const load = async () => {
    setDarkMode();
    setLetters();
    initializeUI();
    const info = document.querySelector('info-content');
    const settings = document.querySelector('settings-content');
    const game = document.querySelector('game-content');
    document.querySelector('#settings').addEventListener('click', () => {
        settings.style.display =
            settings.style.display === 'none' ? 'flex' : 'none';
        info.style.display = 'none';
        game.style.display =
            settings.style.display === 'none' ? 'flex' : 'none';
    });
    document.querySelector('#info').addEventListener('click', () => {
        settings.style.display = 'none';
        info.style.display = info.style.display === 'none' ? 'flex' : 'none';
        game.style.display = info.style.display === 'none' ? 'flex' : 'none';
    });
    letterSpaces = Array.prototype.slice
        .call(document.querySelectorAll('[id ^= "letter-"]'))
        .sort((a, b) => a.id.slice(-1) - b.id.slice(-1));
    guessBtn = document.querySelector('.go-btn');
    pointsWorth = document.querySelector('.points-worth');
    totalPoints = document.querySelector('#score');
    await createWordList();
    playGame();
};

const initializeUI = () => {
    const container = document.querySelector('.word-container');
    for (let i = 0; i < letterNum; i++) {
        const letterContainer = document.createElement('div');
        letterContainer.className = 'letter-container';
        letterContainer.id = 'letter-' + i;
        letterContainer.style.transform = `rotate(${
            (360 * i) / letterNum
        }deg) skewY(${-90 + 360 / letterNum}deg)`;
        const letter = document.createElement('div');
        letter.className = 'letter';
        letterContainer.appendChild(letter);
        const btn = container.lastElementChild;
        container.removeChild(btn);
        container.appendChild(letterContainer);
        container.appendChild(btn);
    }
    document
        .querySelectorAll('.letter')
        .forEach(
            (letter) =>
                (letter.style.transform = `skewY(${
                    90 - 360 / letterNum
                }deg) rotate(${180 / letterNum}deg)`)
        );
};

const setDarkMode = () => {
    const darkModeStr = localStorage.getItem('darkMode');
    let darkMode =
        darkModeStr === 'true' ? true : darkModeStr === 'false' ? false : null;
    if (darkMode === null) {
        localStorage.setItem('darkMode', true);
        darkMode = true;
    }
    if (darkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    document.querySelector('#dark-mode').checked = darkMode;
};

const setLetters = (firstLoad = true) => {
    const lettersStr = localStorage.getItem('numLetters');
    let letters = +lettersStr || 6;
    const oldNum = letterNum;
    letterNum = letters;
    document.querySelector('#letternum').checked = letterNum === 7;
    createWordList().then(() => {
        if (!firstLoad && oldNum !== letterNum) window.location.reload();
    });
};

const createWordList = async () => {
    wordList = (await fetch('words.json').then((res) => res.json()))[letterNum];
};

const randWord = (lastWord) => {
    return wordList
        .filter((word) => word !== lastWord)
        [Math.floor(Math.random() * wordList.length)].toLowerCase();
};

const playGame = (lastWord = '') => {
    acceptLetters = true;
    gameOver = false;
    const currGuess = Array.from(Array(letterNum).map((i) => ''));
    if (!lastWord) {
        points = 0;
        rounds = 0;
    }

    rounds++;

    const word = randWord(lastWord);
    letterSpaces.forEach((space) => {
        space.querySelector('.letter').textContent = '';
        space.classList.remove('active');
        space.classList.remove('preset');
    });

    const given = [];
    if (lastWord === '') {
        const shuffled = Array.from(Array(letterNum).keys())
            .map((val) => ({ val, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ val }) => val);
        given.push(...shuffled.slice(0, startGiven));
    } else {
        for (let i = 0; i < letterNum; i++) {
            if (lastWord.charAt(i) === word.charAt(i)) given.push(i);
        }
    }
    given.forEach((i) => (currGuess[i] = word[i]));
    for (let i = 0; i < given.length; i++) {
        letterSpaces[given[i]].querySelector('.letter').textContent =
            word.charAt(given[i]);
        letterSpaces[given[i]].classList.add('preset');
    }
    pointsWorth.textContent = `This word is worth ${
        letterNum - given.length - 1
    } point${letterNum - given.length - 1 !== 1 ? 's' : ''}.`;

    let nextNotGiven = getNextToFill(currGuess);
    letterSpaces[nextNotGiven].classList.add('active');

    const guessListener = () => {
        if (guessBtn.classList.contains('enabled')) {
            if (gameOver) {
                guessBtn.querySelector('.guess-text').textContent = 'GUESS';
                guessBtn.classList.remove('enabled');
                guessBtn.removeEventListener('click', guessListener);
                document.body.removeEventListener('keydown', keyListener);

                document
                    .querySelector('#no-guess')
                    .removeEventListener('click', noGuessListener);
                document.querySelector('#no-guess').textContent = 'No Guess';
                playGame();
                return;
            }
            if (currGuess.join('') === word) {
                points += letterNum - given.length - 1;
                totalPoints.style.animation = 'points-correct 1s';
                totalPoints.textContent = points;
                guessBtn.classList.remove('enabled');
                guessBtn.removeEventListener('click', guessListener);
                document.body.removeEventListener('keydown', keyListener);

                document
                    .querySelector('#no-guess')
                    .removeEventListener('click', noGuessListener);
                setTimeout(() => {
                    playGame(word);
                }, 1000);
            } else {
                totalPoints.style.animation = 'points-incorrect 1s';
                guessBtn.classList.remove('enabled');
                acceptLetters = false;
                setTimeout(() => {
                    totalPoints.style.animation = '';
                    nextNotGiven = newLetter(
                        word,
                        given,
                        currGuess,
                        nextNotGiven
                    );
                    acceptLetters = true;
                }, 1000);
            }
        }
    };

    guessBtn.addEventListener('click', guessListener);

    const keyListener = (k) => {
        if (
            !acceptLetters &&
            'abcdefghijklmnopqrstuvwxyz'.includes(k.key.toLowerCase())
        )
            return;
        switch (k.key) {
            case 'Enter':
                if (guessBtn.classList.contains('enabled')) {
                    guessBtn.click();
                }
                return;
            case 'Backspace':
                if (
                    findLastNotGiven(
                        nextNotGiven === undefined ? letterNum : nextNotGiven,
                        given
                    ) === -1
                )
                    return;
                currGuess[
                    findLastNotGiven(
                        nextNotGiven === undefined ? letterNum : nextNotGiven,
                        given
                    )
                ] = '';
                letterSpaces[
                    findLastNotGiven(
                        nextNotGiven === undefined ? letterNum : nextNotGiven,
                        given
                    )
                ].querySelector('.letter').textContent = '';
                nextNotGiven = getNextToFill(currGuess);
                letterSpaces.forEach((space) =>
                    space.classList.remove('active')
                );
                letterSpaces[nextNotGiven]?.classList.add('active');
                if (
                    currGuess.filter((letter) => letter).length === letterNum &&
                    !gameOver
                ) {
                    guessBtn.classList.add('enabled');
                } else {
                    guessBtn.classList.remove('enabled');
                }
                break;
            default:
                if (
                    'abcdefghijklmnopqrstuvwxyz'.includes(
                        k.key.toLowerCase()
                    ) &&
                    nextNotGiven < letterNum
                ) {
                    currGuess[nextNotGiven] = k.key.toLowerCase();
                    letterSpaces[nextNotGiven].querySelector(
                        '.letter'
                    ).textContent = k.key.toLowerCase();
                    nextNotGiven = getNextToFill(currGuess);
                    if (nextNotGiven === -1) nextNotGiven = undefined;
                    letterSpaces.forEach((space) =>
                        space.classList.remove('active')
                    );
                    letterSpaces[nextNotGiven]?.classList.add('active');
                    if (nextNotGiven === undefined)
                        letterSpaces[getLastNotGiven(given)].classList.add(
                            'active'
                        );
                    if (
                        currGuess.filter((letter) => letter).length ===
                            letterNum &&
                        !gameOver
                    ) {
                        guessBtn.classList.add('enabled');
                    } else {
                        guessBtn.classList.remove('enabled');
                    }
                }
        }
    };

    document.body.addEventListener('keydown', keyListener);

    const noGuessListener = () => {
        if (!gameOver)
            nextNotGiven = newLetter(word, given, currGuess, nextNotGiven);
        else {
            navigator.clipboard.writeText(
                `WordAround\nRounds: ${rounds}\nPoints: ${points}`
            );
            alert('Copied to clipboard');
        }
    };

    document
        .querySelector('#no-guess')
        .addEventListener('click', noGuessListener);
};

const newLetter = (word, given, currGuess, nextNotGiven) => {
    if (given.length + 1 >= letterNum) {
        gameOver = true;
        guessBtn.querySelector('.guess-text').textContent = 'Play Again?';
        guessBtn.classList.add('enabled');
        letterSpaces.forEach((space, i) => {
            space.classList.add('preset');
            space.querySelector('.letter').textContent = word[i];
        });
        currGuess.length = 0;
        currGuess.push(...word.split(''));
        document.querySelector('#no-guess').textContent = 'Copy Results';
        return;
    }
    guessBtn.classList.remove('enabled');
    const shuffledPool = Array.from(Array(letterNum).keys())
        .filter((i) => !given.includes(i))
        .map((val) => ({ val, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ val }) => val);
    const added = shuffledPool[0];
    given.push(added);
    currGuess[added] = word.charAt(added);
    letterSpaces[added].querySelector('.letter').textContent =
        word.charAt(added);
    letterSpaces[added].classList.add('preset');
    letterSpaces.forEach((space) => {
        space.classList.remove('active');
    });
    letterSpaces.forEach((letter, i) => {
        if (given.includes(i)) return;
        letter.querySelector('.letter').textContent = '';
        currGuess[i] = '';
    });
    nextNotGiven = getNextToFill(currGuess);
    letterSpaces[nextNotGiven].classList.add('active');
    pointsWorth.textContent = `This word is worth ${
        letterNum - given.length - 1
    } point${letterNum - given.length - 1 !== 1 ? 's' : ''}.`;
    return nextNotGiven;
};

const getNextToFill = (currGuess) => {
    const ret = Array.from(Array(letterNum).keys())
        .filter((num) => !currGuess[num])
        .sort((a, b) => a - b)[0];
    return ret === undefined ? -1 : ret;
};

const getLastNotGiven = (given) => {
    const ret = Array.from(Array(letterNum).keys())
        .filter((num) => !given.includes(num))
        .sort((a, b) => a - b);
    return ret[ret.length - 1];
};

const findLastNotGiven = (lastNum, given) => {
    if (lastNum <= 0) return -1;
    if (!given.includes(lastNum - 1)) return lastNum - 1;
    return findLastNotGiven(lastNum - 1, given);
};

const toggleDarkMode = (e) => {
    const darkMode = e.target.checked;
    localStorage.setItem('darkMode', darkMode);
    setDarkMode();
};

const toggleLetters = (e) => {
    const numLetters = e.target.checked ? 7 : 6;
    localStorage.setItem('numLetters', numLetters);
    setLetters(false);
};
