var irc = require('irc');
var fs = require('fs');

var file = process.argv[2];

var config = {
channels: ["#osuosc-hangman", " #cwdg", "#hangman"],
					server: "irc.freenode.net",
					botName: "Hangman-Botman"
};

var bot = new irc.Client(config.server, config.botName, {
channels: config.channels
});

var game = {};
var word = {};
var completedWord = {}; 
var lettersTried = {};
var manState = {};

for (var i = 0; i < config.channels.length; i++) {
	var channel = config.channels[i];
	game[channel] = false;
	word[channel] = "";
	completedWord[channel] = "";
	lettersTried[channel] = [];
	manState[channel] = 0;
}

var chooseWord = function(channel) {
	fs.readFile(file, function(err, data) {
			if (err) throw err;
			var lines = data.toString().split('\n');
			index = Math.floor(Math.random() * (lines.length - 1));
			console.log(lines[index]);
			completedWord[channel] = "";
			var words = lines[index].split(' ');
			for (var i = 0; i < words.length; i++) {
				completedWord[channel] += new Array(words[i].length + 1).join('_');
				if (i < words.length - 1) {
					completedWord[channel] += ' ';
				}
			}
			manState[channel] = 0;
			drawHangman(channel);

			bot.say(channel, completedWord[channel].split('').join(' '));
			word[channel] = lines[index].toLowerCase();

			game[channel] = true;
			lettersTried[channel] = [];
	});
};

var drawHangman = function(channel) {
	bot.say(channel, "_________");
	bot.say(channel, "|         |");
	if (manState[channel] > 0) {
		bot.say(channel, "|         0");
	} else {
		bot.say(channel, "|");
	}
	if (manState[channel] > 3) {
		bot.say(channel, "|        /|\\");
	} else if (manState[channel] > 2) {
		bot.say(channel, "|        /|");
	} else if (manState[channel] > 1) {
		bot.say(channel, "|         |");
	} else {
		bot.say(channel, "|");
	}
	if (manState[channel] > 5) {
		bot.say(channel, "|        / \\");
	} else if (manState[channel] > 4) {
		bot.say(channel, "|        /");
	} else {
		bot.say(channel, "|");
	}
}

var wrongGuess = function(channel) {
	manState[channel]++;
	drawHangman(channel);
	if (manState[channel] == 6) {
		bot.say(channel, "You lose! The word was " + word[channel]);
		game[channel] = false;
	}
};

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 14) == '.start hangman') {
		if (!game[to]) chooseWord(to);
		else bot.say(to, "A game is already occurring!");
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == '.guess ') {
		if (game[to]) {
			var letter = text[7];
			if (lettersTried[to].indexOf(letter) > -1) {
				bot.say(to, "This letter has already been guessed.");
			} else if (!letter.match(/[a-z]/)) {
				bot.say(to, "That is not a valid character");
			} else {
				if (word[to].indexOf(letter) > -1) {
					for (var i = 0; i < word[to].length; i++) {
						if (word[to][i] == letter) {
							console.log(i);
							console.log(completedWord[to]);
							completedWord[to] = setCharAt(completedWord[to], i, letter);
							console.log(completedWord[to]);
						}
					}
					if (completedWord[to] == word[to]) {
						bot.say(to, "You win! The word is " + word[to]);
						game[to] = false;	
					} else {
						console.log(completedWord[to]);
						bot.say(to, completedWord[to].split('').join(' '));
					}
				} else {
					wrongGuess(to);
				}
				lettersTried[to].push(letter);
			}
		}
		else  {
			bot.say(to, "There is no currently active game");
		}
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 10) == ".guessword") {
		if (game[to]) {
			var guess = text.substring(11);
			if (guess == word[to]) {
				bot.say(to, "You win! The word is " + word[to]);
				game[to] = false;
			} else {
				wrongGuess(to);
			}
		} else {
		bot.say(to, "There is no currently active game");
		}
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 8) == ".letters") {
		var letterPool = "abcdefghijklmnopqrstuvwxyz";
		for (var i = 0; i < lettersTried[to].length; i++) {
			if (letterPool.indexOf(lettersTried[to][i]) > -1) {
				letterPool = setCharAt(letterPool, letterPool.indexOf(lettersTried[to][i]), '_');
			}
		}
		bot.say(to, letterPool);
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == ".status") {
		drawHangman(to);
		bot.say(to, completedWord[to].split('').join(' '));
	}
});

function setCharAt(str,index,chr) {
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
};
