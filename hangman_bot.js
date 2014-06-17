var irc = require('irc');
var fs = require('fs');

var file = process.argv[2];

var config = {
channels: ["#osuosc-hangman", " #bayareainterns"],
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

var chooseWord = function(channel) {
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
			drawHangman(channel);

			bot.say(channel, completedWord.split('').join(' '));
			word = lines[index].toLowerCase();

			game = true;
			lettersTried = [];
	});
};

var drawHangman = function(channel) {
	bot.say(channel, "_________");
	bot.say(channel, "|         |");
	if (manState > 0) {
		bot.say(channel, "|         0");
	} else {
		bot.say(channel, "|");
	}
	if (manState > 3) {
		bot.say(channel, "|        /|\\");
	} else if (manState > 2) {
		bot.say(channel, "|        /|");
	} else if (manState > 1) {
		bot.say(channel, "|         |");
	} else {
		bot.say(channel, "|");
	}
	if (manState > 5) {
		bot.say(channel, "|        / \\");
	} else if (manState > 4) {
		bot.say(channel, "|        /");
	} else {
		bot.say(channel, "|");
	}
}

var wrongGuess = function(channel) {
	manState++;
	drawHangman(channel);
	if (manState == 6) {
		bot.say(channel, "You lose! The word was " + word);
		game = false;
	}
};

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 14) == '.start hangman') {
		if (!game) chooseWord(to);
		else bot.say(to, "A game is already occurring!");
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == '.guess ') {
		if (game) {
			var letter = text[7];
			console.log(letter);
			if (lettersTried.indexOf(letter) > -1) {
				bot.say(to, "This letter has already been guessed.");
			} else {
				if (word.indexOf(letter) > -1) {
					for (var i = 0; i < word.length; i++) {
						if (word[i] == letter) {
							console.log(i);
							completedWord = setCharAt(completedWord, i, letter);
						}
					}
					if (completedWord == word) {
						bot.say(to, "You win! The word is " + word);
						game = false;	
					} else {
						bot.say(to, completedWord.split('').join(' '));
					}
				} else {
					wrongGuess(to);
				}
				lettersTried.push(letter);
			}
		}
		else  {
			bot.say(to, "There is no currently active game");
		}
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 10) == ".guessword") {
		if (game) {
			var guess = text.substring(11);
			if (guess == word) {
				bot.say(to, "You win! The word is " + word);
				game = false;
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
		for (var i = 0; i < lettersTried.length; i++) {
			if (letterPool.indexOf(lettersTried[i]) > -1) {
				letterPool = setCharAt(letterPool, letterPool.indexOf(lettersTried[i]), '_');
			}
		}
		bot.say(to, letterPool);
	}
});

bot.addListener("message", function(from, to, text, message) {
	if (text.toLowerCase().substring(0, 7) == ".status") {
		drawHangman(to);
		bot.say(to, completedWord.split('').join(' '));
	}
});

function setCharAt(str,index,chr) {
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
};
