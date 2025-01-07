const fs = require('fs');
const colors = require('colors');
const readline = require('readline');

// Load data from JSON file
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Convert percentage strings to float values
data.forEach(item => {
    item['Individual chance'] = parseFloat(item['Individual chance'].replace('%', '')) / 100;
});

function gachaSimulation(data, numDraws = 1) {
    const results = [];
    for (let i = 0; i < numDraws; i++) {
        const draw = weightedRandomChoice(data);
        results.push(draw);
    }
    return results;
}

function weightedRandomChoice(data) {
    const totalWeight = data.reduce((sum, item) => sum + item['Individual chance'], 0);
    let random = Math.random() * totalWeight;
    for (const item of data) {
        if (random < item['Individual chance']) {
            return item;
        }
        random -= item['Individual chance'];
    }
}

function getColorByGrade(grade) {
    switch (grade) {
        case 'Common':
            return 'white';
        case 'Uncommon':
            return 'green';
        case 'Rare':
            return 'blue';
        case 'Epic':
            return 'magenta';
        case 'Legendary':
            return 'yellow';
        default:
            return 'white';
    }
}

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('How many times do you want to gacha (each gacha yields 11 items)? ', (answer) => {
    const numGachas = parseInt(answer);
    if (isNaN(numGachas) || numGachas <= 0) {
        console.log('Please enter a valid number.');
        rl.close();
        return;
    }

    const totalDraws = numGachas * 11;
    const results = gachaSimulation(data, totalDraws);

    // Function to print results with delay
    function printResultsWithDelay(gachaIndex = 0) {
        if (gachaIndex >= numGachas) {
            rl.close();
            return;
        }

        // Clear console
        console.clear();

        // Print 11 items for the current gacha
        const startIndex = gachaIndex * 11;
        const endIndex = startIndex + 11;
        const currentResults = results.slice(startIndex, endIndex);

        console.log(`\nSunset's Mount Summon - Gacha ${gachaIndex + 1} Results:`);
        console.log('----------------------------------------');
        console.log('| Grade     | Item Name                |');
        console.log('----------------------------------------');
        currentResults.forEach(result => {
            const color = getColorByGrade(result['Grade']);
            console.log(colors[color](`| ${result['Grade'].padEnd(9)} | ${result['Item name'].padEnd(24)} |`));
        });
        console.log('----------------------------------------');

        // Print summary for the current gacha
        const currentGradeCounts = currentResults.reduce((counts, result) => {
            counts[result['Grade']] = (counts[result['Grade']] || 0) + 1;
            return counts;
        }, {});
        console.log(`\nSummary for gacha ${gachaIndex + 1}:`);
        Object.keys(currentGradeCounts).forEach(grade => {
            const color = getColorByGrade(grade);
            console.log(colors[color](`${grade}: ${currentGradeCounts[grade]}`));
        });

        // Print final summary up to the current gacha
        const finalGradeCounts = results.slice(0, endIndex).reduce((counts, result) => {
            counts[result['Grade']] = (counts[result['Grade']] || 0) + 1;
            return counts;
        }, {});
        console.log(`\nFinal Summary up to gacha ${gachaIndex + 1}:`);
        console.log(`Total draws: ${endIndex}`);
        Object.keys(finalGradeCounts).forEach(grade => {
            const color = getColorByGrade(grade);
            console.log(colors[color](`${grade}: ${finalGradeCounts[grade]}`));
        });

        // Print items with grade Epic or higher in a table
        console.log('\nItems with grade Epic or higher:');
        console.log('----------------------------------------');
        console.log('| Gacha     | Grade     | Item Name                |');
        console.log('----------------------------------------');
        results.slice(0, endIndex).forEach((result, index) => {
            if (result['Grade'] === 'Epic' || result['Grade'] === 'Legendary') {
                const color = getColorByGrade(result['Grade']);
                console.log(colors[color](`| ${String(Math.floor(index / 11) + 1).padEnd(9)} | ${result['Grade'].padEnd(9)} | ${result['Item name'].padEnd(24)} |`));
            }
        });
        console.log('----------------------------------------');

        // Delay before showing the next gacha results
        setTimeout(() => printResultsWithDelay(gachaIndex + 1), 2000); // 2000ms delay
    }

    // Start printing results with delay
    printResultsWithDelay();
});