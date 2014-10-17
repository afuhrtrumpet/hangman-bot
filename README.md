hangman-bot
===========

Simple bot that plays Hangman in IRC using a text file of words

Installation/Usage
==========
* Change config variables in hangman-bot.js to desired channel and nick
* Get dictionary file (list of words, or use one of the provided ones)

Run as follows:

```
node hangman-bot.js [DICTIONARY FILE NAME]
```

Commands
===========
* Start game (bot chooses word)

```
.start hangman 0
```

* Start game (user must message bot word)

```
.start hangman 1
```

* Guess a letter

```
.guess [LETTER]
```

* Guess a word

```
.guessword [WORD]
```

* View available letters

```
.letters
```

* See current hangman and word progress

```
.status
```
