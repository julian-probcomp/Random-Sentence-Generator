// Luke Garison
// Theory of Computing: Course Project 1
// Main javascript file where the random sentence generation takes place

var app = angular.module('app', ['ui.bootstrap']);

app.controller("mainController", ["$scope", function($scope) {
	// initialization
	var maxMarkovNumber = 20;
	var maxNumCharToGenerate = 10000;
	$scope.source = "";
	$scope.generateTextClicked = false;
	$scope.generatedText = undefined; // this will be calculated when input text is added
	$scope.markovNumber = 10;
	$scope.markovNumbers = [];
	// display valid selections for markov number
	for (var i = 1; i <= maxMarkovNumber; i++) {
		$scope.markovNumbers.push(i);
	}

	// save dropdown selection
	$scope.saveMarkovNumber = function(num) {
		$scope.markovNumber = num;
	};

	// return T/F on wether or not to display an error message to the user for
	// the source input text
	// returning true indicates an error
	$scope.checkForErrorSource = function() {
		return $scope.markovNumber >= $scope.source.length && $scope.generateTextClicked;
	};

	// return T/F for whether or not to display an error message to user for input field
	// asking for the number of random characters to generate
	// returning true indicates an error
	$scope.checkForErrorNumChar = function() {
		return $scope.generateTextClicked === true && (!isInt($scope.numCharToGenerate) || $scope.numCharToGenerate >= maxNumCharToGenerate);
	};

	$scope.generateText = function() {
		// helps display appropriate error messages
		$scope.generateTextClicked = true;
		// if there is an error, don't try to generate text
		if ($scope.checkForErrorSource() || $scope.checkForErrorNumChar()) {
			$scope.generatedText = "";
			return;
		}

		var markovNumber = $scope.markovNumber;
		var source = $scope.source;

		model = {};
		buildModelRecursively(source, model, markovNumber);

		$scope.generatedText = generateSentences(model, markovNumber, $scope.numCharToGenerate);
	};

	// build up model mapping of seed string to list of characters seen after that seed string
	// the key data structure is a mapping of "seed" strings to a list of 
	// characters that were ever seen immediately after the given seed
	// this mapping is created for seed lengths from 0 to markovNumber
	function buildModelRecursively(source, model, markovNumber) {
		// base case for recursion
		if (markovNumber === 0) {
			return;
		}

		// build up the initial seed (contains markovNumber number of characters)
		var currentSeed = "";
		sourceTextIndex = 0;
		for (var i = 0; i < markovNumber; i++) {
			currentSeed += source[sourceTextIndex];
			sourceTextIndex++;
		}

		// add the character after the current seed to the list found at source[currentSeed]
		// currentSeed will always contain markovNumber characters, but it will shift rightward
		while (sourceTextIndex < source.length) {
			var nextChar = source[sourceTextIndex++];
			if (!(currentSeed in model)) {
				model[currentSeed] = [];  	// create mapping from currentSeed to an empty list

			} 

			// add the character that is after the current seed to the list
			model[currentSeed].push(nextChar); 

			// remove the first character from currentSeed and add on the next char from the source text
			// currentSeed will act as a queue
			currentSeed = currentSeed.substring(1);
			currentSeed = currentSeed + nextChar;
		}

		// continue building the map, but with a slightly smaller seed length
		buildModelRecursively(source, model, markovNumber - 1);
	}

	// returns the most occuring string in the markov model (with length == markovNum)
	function getMostOccuringString(model, markovNumber) {
		var mostOccuringString, count;
		for (var key in model) {
			// only returns the most occuring string of length markovNumber
			if (key.length < markovNumber || key === " ") {
				continue;
			}

			var numOccurences = model[key].length; // number of occurences of key
			// if key occured more times than mostOccuringString or if mostOccuringString
			// is undefined (in the first iteration, the key becomes the most occuring string
			// by default)
			if (numOccurences > count || mostOccuringString === undefined) {
				mostOccuringString = key;
				count = numOccurences;
			}
		}

		return mostOccuringString;
	}

	// returns numCharToGenerate # of char's containing random words that read
	// like sentences together
	function generateSentences(model, markovNumber, numCharToGenerate) {
		var initialSeed = getMostOccuringString(model, markovNumber);
		var curSeed = initialSeed;

		// this function will build up this string using the initial seed
		var randomText = "";

		// build up numCharToGenerate characters of text
		while (randomText.length < numCharToGenerate) {
			var nextChar = getNextChar(model, curSeed);

			if (nextChar === undefined) {
				// confirm("Unfortunately no more letters can be predicted from the current seed");

				// make the nextChar a random character instead of quitting the program
				nextChar = getRandomChar();
			}
			randomText += nextChar;

			// shift curSeed
			curSeed = curSeed.slice(1);
			curSeed += nextChar;
		}

		return randomText;
	}

	// return the next character based on the curSeed
	// this function is recursive - if there are no matches for the current seed,
	// try again after chopping off the first character of the curSeed
	function getNextChar(model, curSeed) {
		if (curSeed === "") {
			// no matches were found based on the current seed
			return undefined;
		}
		else if (!(curSeed in model)) {
			return getNextChar(model, curSeed.slice(1));
		} 

		// curSeed is a key in model
		// randomly select one of the characters that was seen following curSeed in the sample input
		var randomIndex = getRandomInt(0, model[curSeed].length);
		return model[curSeed][randomIndex];
	}

	// returns T/F if n is an integer or not
	function isInt(n) {
		return !isNaN(n) && parseInt(Number(n)) == n && !isNaN(parseInt(n, 10));
	}

	// return a random character
	function getRandomChar() {
		// from ascii table:
		// 	  97 = 'a'
		var randomInt = getRandomInt(0, 26);

		return String.fromCharCode(97 + randomInt);
	}

	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
}]);

