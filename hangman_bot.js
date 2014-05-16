var irc = require('irc');
var fs = require('fs');

var file = process.argv[2];

var config = {
	channels: ["#osuosc-hangman"],
	server: "irc.freenode.net",
	botName: "Hangman-Botman"
};

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

var game = false;
var word = "";
var completedWord = "";
var lettersTried = [];
var manState = 0;

var chooseWord = function() {
	fs.readFile(file, function(err, data) {
		if (err) throw err;
		var lines = data.toString().split('\n');
		index = Math.floor(Math.random() * (lines.length - 1));
		console.log(lines[index]);
		completedWord = "";
		var words = lines[index].split(' ');
		for (var i = 0; i < words.length; i++) {
			completedWord += new Array(words[i].length + 1).join('_');
			if (i < words.length - 1) {
				completedWord += ' ';
			}
		}
		manState = 0;
		drawHangman();

		bot.say(config.channels[0], completedWord.split('').join(' '));
		word = lines[index].toLowerCase();

		game = true;
		lettersTried = [];
	});
};

var drawHangman = function() {
	bot.say(config.channels[0], "_________");
	bot.say(config.channels[0], "|         |");
	if (manState > 0) {
		bot.say(config.channels[0], "|         0");
	} else {
		bot.say(config.channels[0], "|");
	}
	if (manState > 3) {
		bot.say(config.channels[0], "|        /|\\");
	} else if (manState > 2) {
		bot.say(config.channels[0], "|        /|");
	} else if (manState > 1) {
		bot.say(config.channels[0], "|         |");
	} else {
		bot.say(config.channels[0], "|");
	}
	if (manState > 5) {
		bot.say(config.channels[0], "|        / \\");
	} else if (manState > 4) {
		bot.say(config.channels[0], "|        /");
	} else {
		bot.say(config.channels[0], "|");
	}
	bot.say(config.channels[0], "|");
	bot.say(config.channels[0], "|");
}

var wrongGuess = function() {
	manState++;
	drawHangman();
	if (manState == 6) {
		bot.say(config.channels[0], "You lose! The word was " + word);
		game = false;
	} else {
		bot.say(config.channels[0], "WROOOOOOOONNNNNG!!");
	}
}

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 14) == '.start hangman') {
		if (!game) chooseWord();
		else bot.say(config.channels[0], "A game is already occurring!");
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == '.guess ') {
		if (game) {
			var letter = text[7];
			console.log(letter);
			if (lettersTried.indexOf(letter) > -1) {
				bot.say(config.channels[0], "This letter has already been guessed.");
			} else {
				if (word.indexOf(letter) > -1) {
					for (var i = 0; i < word.length; i++) {
						if (word[i] == letter) {
							console.log(i);
							completedWord = setCharAt(completedWord, i, letter);
						}
					}
					if (completedWord == word) {
						bot.say(config.channels[0], "You win! The word is " + word);
						game = false;	
					} else {
						bot.say(config.channels[0], completedWord.split('').join(' '));
					}
				} else {
					wrongGuess();
				}
				lettersTried.push(letter);
			}
		}
		else  {
			bot.say(config.channels[0], "There is no currently active game");
		}
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 10) == ".guessword") {
		if (game) {
			var guess = text.substring(11);
			if (guess == word) {
				bot.say(config.channels[0], "You win! The word is " + word);
				game = false;
			} else {
				wrongGuess();
			}
		} else {
			bot.say(config.channels[0], "There is no currently active game");
		}
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 8) == ".letters") {
		var letterPool = "abcdefghijklmnopqrstuvwxyz";
		for (var i = 0; i < lettersTried.length; i++) {
			if (letterPool.indexOf(lettersTried[i]) > -1) {
				letterPool = setCharAt(letterPool, letterPool.indexOf(lettersTried[i]), '_');
			}
		}
		bot.say(config.channels[0], letterPool);
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == ".status") {
		drawHangman();
		bot.say(config.channels[0], completedWord.split('').join(' '));
	}
});

function setCharAt(str,index,chr) {
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
}
