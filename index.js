let wordList = [];
let letterNum = 6;
const startGiven = 4;
let availPoints,
    points = 0;
let gameOver = true;
let letterSpaces, guessBtn, pointsWorth, totalPoints;
let acceptLetters = false;
let rounds = 0;
let given = [];
let nextNotGiven = -1;

let wordStartPoint = 0;

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
        const input = document.createElement('input');
        input.spellcheck = false;
        input.maxLength = 1;
        input.pattern = 'gamer';
        input.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
        letter.appendChild(input);
        letterContainer.appendChild(letter);
        letterContainer.addEventListener('click', () => {
            if (!given.includes(i)) nextNotGiven = i;
            letterSpaces.forEach((space) => space.classList.remove('active'));
            letterContainer.classList.add('active');
        });
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

const moveStart = (word) => {
    const rand = Math.floor(Math.random() * word.length);
    const retArr = [];
    for (let i = 0; i < word.length; i++) {
        retArr[i] = word[(rand + i) % word.length];
    }
    return { word: retArr.join(''), wordStartPoint: word.length - rand };
};

const playGame = (lastWord = '') => {
    // if (lastWord) {
    //     letterSpaces.forEach((space, i) => {
    //         space.querySelector('.letter > input').placeholder = lastWord[i];
    //     });
    // } else {
    //     letterSpaces.forEach((space, i) => {
    //         space.querySelector('.letter > input').placeholder = '\u2007';
    //     });
    // }
    acceptLetters = true;
    gameOver = false;
    const currGuess = Array.from(Array(letterNum).map(() => ''));
    if (!lastWord) {
        points = 0;
        rounds = 0;
    }

    rounds++;

    const ret = moveStart(randWord(lastWord));
    wordStartPoint = ret.wordStartPoint;
    const { word } = ret;
    console.log(word);
    availPoints = letterNum;
    given = [];
    nextNotGiven = getNextNotGiven(-1, given);
    letterSpaces.forEach((space, i) => {
        space.querySelector('.letter').querySelector('input').value = '';
        space.classList.remove('active');
        space.classList.remove('first');
        space.classList.remove('preset');
    });

    // if (lastWord === '') {
    //     const shuffled = Array.from(Array(letterNum).keys())
    //         .map((val) => ({ val, sort: Math.random() }))
    //         .sort((a, b) => a.sort - b.sort)
    //         .map(({ val }) => val);
    //     given.push(...shuffled.slice(0, startGiven));
    // } else {
    //     for (let i = 0; i < letterNum; i++) {
    //         if (lastWord.charAt(i) === word.charAt(i)) given.push(i);
    //     }
    // }
    // given.forEach((i) => (currGuess[i] = word[i]));
    // for (let i = 0; i < given.length; i++) {
    //     letterSpaces[given[i]]
    //         .querySelector('.letter')
    //         .querySelector('input').value = word.charAt(given[i]);
    //     letterSpaces[given[i]].classList.add('preset');
    // }
    pointsWorth.textContent = `This word is worth ${availPoints} point${
        availPoints !== 1 ? 's' : ''
    }.`;

    letterSpaces[nextNotGiven].classList.add('active');

    const guessListener = () => {
        if (guessBtn.classList.contains('enabled')) {
            if (gameOver) {
                guessBtn.querySelector('.guess-text').textContent = 'GUESS';
                guessBtn.classList.remove('enabled');
                guessBtn.removeEventListener('click', guessListener);
                document.body.removeEventListener('keydown', keyListener);
                pointsWorth.style.display = 'block';

                document
                    .querySelector('#copy')
                    .removeEventListener('click', copyListener);
                document.querySelector('#copy').style.display = 'none';
                playGame();
                return;
            }
            if (currGuess.join('') === word) {
                points += availPoints;
                totalPoints.style.animation = 'points-correct 1s';
                totalPoints.textContent = points;
                guessBtn.classList.remove('enabled');
                guessBtn.removeEventListener('click', guessListener);
                document.body.removeEventListener('keydown', keyListener);

                document
                    .querySelector('#copy')
                    .removeEventListener('click', copyListener);
                setTimeout(() => {
                    playGame(word);
                }, 1000);
            } else {
                if (
                    currGuess.some((letter, i) => {
                        return !given.includes(i) && word[i] === letter;
                    })
                ) {
                    totalPoints.style.animation = 'points-correct 1s';
                } else {
                    totalPoints.style.animation = 'points-incorrect 1s';
                }
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
        if (k.ctrlPressed) return;
        if (
            !acceptLetters &&
            'abcdefghijklmnopqrstuvwxyz'.includes(k.key.toLowerCase())
        )
            return;
        switch (k.key) {
            case 'ArrowRight':
                nextNotGiven = getNextNotGiven(nextNotGiven, given);
                letterSpaces.forEach((space) =>
                    space.classList.remove('active')
                );
                letterSpaces[nextNotGiven].classList.add('active');
                break;
            case 'ArrowLeft':
                nextNotGiven = getNextNotGiven(nextNotGiven, given, true);
                letterSpaces.forEach((space) =>
                    space.classList.remove('active')
                );
                letterSpaces[nextNotGiven].classList.add('active');
                break;
            case 'Enter':
                if (guessBtn.classList.contains('enabled')) {
                    guessBtn.click();
                }
                return;
            case 'Backspace':
                if (getNextNotGiven(nextNotGiven, given, true) === undefined)
                    return;
                currGuess[getNextNotGiven(nextNotGiven, given, true)] = '';
                letterSpaces[getNextNotGiven(nextNotGiven, given, true)]
                    .querySelector('.letter')
                    .querySelector('input').value = '';
                nextNotGiven = getNextNotGiven(nextNotGiven, given, true);
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
                    'abcdefghijklmnopqrstuvwxyz'.includes(k.key.toLowerCase())
                ) {
                    currGuess[nextNotGiven] = k.key.toLowerCase();
                    letterSpaces[nextNotGiven]
                        .querySelector('.letter')
                        .querySelector('input').value = k.key.toLowerCase();
                    nextNotGiven = getNextNotGiven(nextNotGiven, given);
                    if (nextNotGiven === -1) nextNotGiven = undefined;
                    letterSpaces.forEach((space) =>
                        space.classList.remove('active')
                    );
                    letterSpaces[nextNotGiven]?.classList.add('active');
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

    const copyListener = () => {
        if (gameOver) {
            navigator.clipboard.writeText(
                `WordAround\nRounds: ${rounds}\nPoints: ${points}`
            );
            alert('Copied to clipboard');
        }
    };

    document.querySelector('#copy').addEventListener('click', copyListener);
};

const newLetter = (word, given, currGuess, nextNotGiven) => {
    guessBtn.classList.remove('enabled');
    // const shuffledPool = Array.from(Array(letterNum).keys())
    //     .filter((i) => !given.includes(i))
    //     .map((val) => ({ val, sort: Math.random() }))
    //     .sort((a, b) => a.sort - b.sort)
    //     .map(({ val }) => val);
    // const added = shuffledPool[0];
    // given.push(added);
    const oldGiven = [...given];
    const added = [
        ...currGuess
            .map((el, i) => ({ val: el, idx: i }))
            .filter(
                (el) => el.val === word[el.idx] && !oldGiven.includes(el.idx)
            )
            .map(({ idx }) => idx),
    ];
    if (!added.length) {
        availPoints--;
        const shuffledPool = Array.from(Array(letterNum).keys())
            .filter((i) => !given.includes(i))
            .map((val) => ({ val, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ val }) => val);
        added.push(shuffledPool[0]);
    }
    if (availPoints <= 0) {
        pointsWorth.style.display = 'none';
        gameOver = true;
        guessBtn.querySelector('.guess-text').textContent = 'Play Again?';
        guessBtn.classList.add('enabled');
        letterSpaces.forEach((space, i) => {
            space.classList.add('preset');
            if (i === wordStartPoint) space.classList.add('first');
            space.querySelector('.letter > input').value = word[i];
        });
        currGuess.length = 0;
        currGuess.push(...word.split(''));
        document.querySelector('#copy').style.display = 'block';
        return;
    }
    given.push(...added);
    given.forEach((added) => {
        currGuess[added] = word.charAt(added);
        letterSpaces[added]
            .querySelector('.letter')
            .querySelector('input').value = word.charAt(added);
        letterSpaces[added].classList.add('preset');
    });
    letterSpaces.forEach((space) => {
        space.classList.remove('active');
    });
    letterSpaces.forEach((letter, i) => {
        if (given.includes(i)) return;
        letter.querySelector('.letter > input').value = '';
        currGuess[i] = '';
    });
    nextNotGiven = !given.includes(nextNotGiven)
        ? nextNotGiven
        : getNextNotGiven(nextNotGiven, given);
    letterSpaces[nextNotGiven].classList.add('active');
    pointsWorth.textContent = `This word is worth ${availPoints} point${
        availPoints !== 1 ? 's' : ''
    }.`;
    return nextNotGiven;
};

const getNextNotGiven = (index, given, back = false) => {
    if (given.length === letterNum) return undefined;
    if (!back && index === letterNum - 1) {
        return getNextNotGiven(-1, given);
    }
    if (back && index === 0) {
        return getNextNotGiven(letterNum, given, true);
    }
    const ret = Array.from(Array(letterNum).keys())
        .filter(
            (num) => !given.includes(num) && (back ? num < index : num > index)
        )
        .sort((a, b) => a - b);
    return ret[back ? ret.length - 1 : 0] === undefined
        ? getNextNotGiven(index + (back ? -1 : 1), given, back)
        : ret[back ? ret.length - 1 : 0];
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
