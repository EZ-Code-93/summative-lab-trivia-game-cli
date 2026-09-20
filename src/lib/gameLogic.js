import chalk from 'chalk';
import { select } from '@inquirer/prompts';

// Private state file-scope variable to hold the reference to the users answers array
let userResultsArray = [];

export async function showMainMenu(data) {
    // 1. Detect if this is the first call from index.js passing the empty results array
    if (Array.isArray(data) && (data.length === 0 || (data.length > 0 && !data[0].question))) {
        userResultsArray = data;
        return; // Keep reference and return to allow index.js to proceed to the next call
    }

    // 2. This is the second call from index.js passing the active questions array
    const triviaDB = data;

    console.clear();
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.hex('#ca1237').bold("        I WANT TO PLAY A GAME.....       "));
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.hex('#ca1237').bold("       30 SECONDS PER QUESTION!           "));
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.gray.bold("========================================="));

    // Track total game duration
    const gameStartTime = Date.now();
    let score = 0;
    let totalPointsPossible = 0;

    // View quiz questions sequentially using loops
    for (let i = 0; i < triviaDB.length; i++) {
        const currentQuestion = triviaDB[i];
        totalPointsPossible += currentQuestion.points;

        console.log(chalk.hex('#800080').bold(`\nQUESTION ${i + 1} OF ${triviaDB.length}`));
        console.log(chalk.gray(`-----------------------------------`));
        console.log(chalk.hex('#8b8b22').bold(currentQuestion.question));

        // Format options for @inquirer/prompts choice mapping array list
        const choices = currentQuestion.options.map(option => ({
            name: option,
            value: option
        }));

        // Set up asynchronous JavaScript feature: AbortController timer for 30s timeout
        const controller = new AbortController();
        const timeoutDuration = 30000; // 30 seconds
        let isTimedOut = false;

        const timer = setTimeout(() => {
            isTimedOut = true;
            controller.abort(); // Cancel the prompt programmatically
        }, timeoutDuration);

        let userSelection = null;

        try {
            // Await user interactions or timing signals
            userSelection = await select({
                message: chalk.hex('#800080')("CHOOSE WISELY:"),
                choices: choices
            }, { signal: controller.signal });
            
            clearTimeout(timer); // Clear timeout if user answered in time
        } catch (error) {
            // Handle prompt cancelation if time expired
            if (isTimedOut) {
                console.log(chalk.hex('#ca1237').bold(`\nTIME'S UP! NEXT QUESTION.`));
                userSelection = "TIMED OUT";
            } else {
                // Handle user exit (Ctrl+C)
                console.log(chalk.hex('#ca1237')("\nGame exited by user."));
                process.exit(0);
            }
        }

        // Evaluate user answer and provide feedback
        let isCorrect = false;
        if (!isTimedOut && userSelection !== "TIMED OUT") {
            if (userSelection === currentQuestion.answer) {
                console.log(chalk.hex('#228b22').bold(`CORRECT! You earned ${currentQuestion.points} points.`));
                score += currentQuestion.points;
                isCorrect = true;
            } else {
                console.log(chalk.hex('#ca1237').bold(`INCORRECT. The correct answer was: ${currentQuestion.answer}`));
            }
        }

        // Store data details to testResult array
        userResultsArray.push({
            questionId: currentQuestion.id,
            userChoice: userSelection,
            isCorrect: isCorrect
        });

        console.log(chalk.gray(`-----------------------------------`));
    }

    // Keep track of total game duration time
    const totalDurationSecs = Math.floor((Date.now() - gameStartTime) / 1000);

    // Get feedback when the game is over
    console.log("\n" + chalk.gray.bold("========================================="));
    console.log(chalk.hex('#ca1237').bold("             GAME     OVER!              "));
    console.log(chalk.gray.bold("========================================="));
    console.log(chalk.hex('#800080')(`YOUR FINAL SCORE: `) + chalk.hex('#228b22').bold(`${score} / ${totalPointsPossible} POINTS`));
    console.log(chalk.hex('#800080')(`TOTAL TIME TAKEN: `) + chalk.hex('#228b22').bold(`${totalDurationSecs} SECONDS`));
    console.log(chalk.gray.bold("=========================================\n"));

    
    // Required array iteration method (.map) to summarize performance items
    const summary = userResultsArray.map((res, idx) => {
        const status = res.isCorrect ? chalk.green("PASSED") : chalk.red("FAILED");
        return `  ${idx + 1}. [${status}] YOUR SELECTION: "${chalk.hex('#800080')(res.userChoice)}"`;
    });

    // Output detailed log lines to stream console
    summary.forEach(line => console.log(line));
    console.log(chalk.red("\nTHANK YOU FOR PLAYING!"));
}
