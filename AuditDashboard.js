/**
 * Developer Audit Dashboard
 * Automated playtesting and registry validation
 */

class AuditDashboard {
    constructor() {
        this.isVisible = false;
        this.playtestResults = [];
        this.playtestInProgress = false;
        this.createDashboardUI();
        this.attachEventListeners();
    }

    createDashboardUI() {
        const dashboard = document.createElement('div');
        dashboard.id = 'auditDashboard';
        dashboard.className = 'audit-dashboard hidden';
        dashboard.innerHTML = `
            <div class="audit-header">
                <h2>🔧 Developer Audit Dashboard</h2>
                <button id="closeAuditBtn" class="close-btn">✕</button>
            </div>

            <div class="audit-tabs">
                <button class="audit-tab active" data-tab="registry">Registry</button>
                <button class="audit-tab" data-tab="playtest">Playtesting</button>
                <button class="audit-tab" data-tab="statistics">Statistics</button>
                <button class="audit-tab" data-tab="conditions">Win/Loss</button>
            </div>

            <!-- Registry Tab -->
            <div class="audit-content" id="registryTab">
                <h3>Registry Validation</h3>
                <div id="registryValidation" class="validation-display"></div>
                <button id="validateRegistryBtn" class="btn btn-audit">Validate Registry</button>
                <button id="exportRegistryBtn" class="btn btn-audit">Export JSON</button>
            </div>

            <!-- Playtest Tab -->
            <div class="audit-content hidden" id="playtestTab">
                <h3>Automated Playtesting</h3>
                <div class="playtest-controls">
                    <label>Number of simulations:</label>
                    <input type="number" id="playtestCount" value="5" min="1" max="100">
                    <button id="startPlaytestBtn" class="btn btn-audit">Start Playtest</button>
                    <button id="stopPlaytestBtn" class="btn btn-audit" disabled>Stop</button>
                </div>
                <div id="playtestProgress" class="progress-display"></div>
                <div id="playtestResults" class="results-display"></div>
            </div>

            <!-- Statistics Tab -->
            <div class="audit-content hidden" id="statisticsTab">
                <h3>Game Statistics</h3>
                <div id="statisticsDisplay" class="statistics-display"></div>
            </div>

            <!-- Conditions Tab -->
            <div class="audit-content hidden" id="conditionsTab">
                <h3>Win/Loss Conditions</h3>
                <div id="conditionsDisplay" class="conditions-display"></div>
            </div>
        `;

        document.body.appendChild(dashboard);
    }

    attachEventListeners() {
        // Toggle dashboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                this.toggleVisibility();
            }
        });

        // Close button
        document.getElementById('closeAuditBtn').addEventListener('click', () => this.toggleVisibility());

        // Tab switching
        document.querySelectorAll('.audit-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Registry validation
        document.getElementById('validateRegistryBtn').addEventListener('click', () => this.validateRegistry());
        document.getElementById('exportRegistryBtn').addEventListener('click', () => this.exportRegistry());

        // Playtest
        document.getElementById('startPlaytestBtn').addEventListener('click', () => this.startPlaytest());
        document.getElementById('stopPlaytestBtn').addEventListener('click', () => this.stopPlaytest());
    }

    toggleVisibility() {
        const dashboard = document.getElementById('auditDashboard');
        this.isVisible = !this.isVisible;
        dashboard.classList.toggle('hidden');
        if (this.isVisible) {
            this.updateAllDisplays();
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.audit-content').forEach(tab => tab.classList.add('hidden'));
        document.querySelectorAll('.audit-tab').forEach(tab => tab.classList.remove('active'));
        
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');
        event.target.classList.add('active');
        
        if (tabName === 'statistics') {
            this.displayStatistics();
        } else if (tabName === 'conditions') {
            this.displayConditions();
        }
    }

    validateRegistry() {
        const validation = gameRegistry.validateRegistry();
        const display = document.getElementById('registryValidation');

        let html = `
            <div class="validation-result ${validation.isValid ? 'valid' : 'invalid'}">
                <h4>${validation.isValid ? '✅ Registry Valid' : '⚠️ Registry Issues Found'}</h4>
                <p><strong>Summary:</strong></p>
                <ul>
                    <li>Variables: ${validation.summary.totalVariables}</li>
                    <li>Events: ${validation.summary.totalEvents}</li>
                    <li>Effects: ${validation.summary.totalEffects}</li>
                    <li>Choices: ${validation.summary.totalChoices}</li>
                    <li>Systems: ${validation.summary.totalSystems}</li>
                </ul>
        `;

        if (validation.issues.length > 0) {
            html += `<p><strong>Issues:</strong></p><ul>`;
            validation.issues.forEach(issue => {
                html += `<li class="error-item">${issue}</li>`;
            });
            html += `</ul>`;
        }

        html += `</div>`;
        display.innerHTML = html;
    }

    exportRegistry() {
        const dump = gameRegistry.getFullRegistryDump();
        const json = JSON.stringify(dump, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registry-dump-${Date.now()}.json`;
        a.click();
    }

    async startPlaytest() {
        const count = parseInt(document.getElementById('playtestCount').value);
        this.playtestInProgress = true;
        document.getElementById('startPlaytestBtn').disabled = true;
        document.getElementById('stopPlaytestBtn').disabled = false;

        const progressDisplay = document.getElementById('playtestProgress');
        const resultsDisplay = document.getElementById('playtestResults');

        progressDisplay.innerHTML = '<p>Starting playtests...</p>';
        resultsDisplay.innerHTML = '';

        const results = {
            totalTests: count,
            completed: 0,
            wins: 0,
            losses: 0,
            avgTurns: 0,
            gameDetails: []
        };

        for (let i = 0; i < count && this.playtestInProgress; i++) {
            progressDisplay.innerHTML = `<p>Playtest ${i + 1}/${count}...</p><div class="progress-bar" style="width: ${((i + 1) / count) * 100}%"></div>`;

            const result = await this.runSinglePlaytest();
            results.gameDetails.push(result);
            results.completed++;

            if (result.won) results.wins++;
            else results.losses++;

            results.avgTurns = (results.avgTurns * (i) + result.turns) / (i + 1);

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.playtestResults = results;
        this.displayPlaytestResults(results);

        document.getElementById('startPlaytestBtn').disabled = false;
        document.getElementById('stopPlaytestBtn').disabled = true;
        this.playtestInProgress = false;
    }

    stopPlaytest() {
        this.playtestInProgress = false;
    }

    async runSinglePlaytest() {
        gameRegistry.resetStatistics();

        const game = new EconomyGame();
        let turns = 0;
        const maxTurns = 100;

        while (game.gameActive && turns < maxTurns) {
            const choices = gameRegistry.getAllChoices();
            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            game.selectedDecisions = [randomChoice.key];

            game.nextTurn();
            turns++;
        }

        const stats = gameRegistry.getStatistics();
        return {
            turns,
            won: game.gameWon,
            finalGdp: gameRegistry.getVariableValue('gdp'),
            finalInflation: gameRegistry.getVariableValue('inflation'),
            finalUnemployment: gameRegistry.getVariableValue('unemployment'),
            debtToGdp: gameRegistry.getVariableValue('debtToGdp'),
            choicesUsed: stats.totalChoicesMade
        };
    }

    displayPlaytestResults(results) {
        const display = document.getElementById('playtestResults');
        const winRate = ((results.wins / results.completed) * 100).toFixed(1);

        let html = `
            <div class="playtest-summary">
                <h4>Playtest Results</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Total Tests:</span>
                        <span class="value">${results.completed}/${results.totalTests}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Wins:</span>
                        <span class="value success">${results.wins}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Losses:</span>
                        <span class="value error">${results.losses}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Win Rate:</span>
                        <span class="value">${winRate}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Avg Turns:</span>
                        <span class="value">${results.avgTurns.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div class="playtest-details">
                <h4>Game Details</h4>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Game #</th>
                            <th>Result</th>
                            <th>Turns</th>
                            <th>Final GDP</th>
                            <th>Inflation</th>
                            <th>Unemployment</th>
                            <th>Debt-to-GDP</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        results.gameDetails.forEach((game, idx) => {
            const resultEmoji = game.won ? '✅' : '❌';
            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${resultEmoji}</td>
                    <td>${game.turns}</td>
                    <td>$${game.finalGdp.toFixed(1)}T</td>
                    <td>${game.finalInflation.toFixed(1)}%</td>
                    <td>${game.finalUnemployment.toFixed(1)}%</td>
                    <td>${game.debtToGdp.toFixed(0)}%</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        display.innerHTML = html;
    }

    displayStatistics() {
        const stats = gameRegistry.getStatistics();
        const display = document.getElementById('statisticsDisplay');

        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Overall Statistics</h4>
                    <ul>
                        <li>Total Games: ${stats.totalGamesPlayed}</li>
                        <li>Games Won: ${stats.gamesWon}</li>
                        <li>Games Lost: ${stats.gamesLost}</li>
                        <li>Win Rate: ${stats.winRate}%</li>
                        <li>Avg Game Length: ${stats.averageGameLength} turns</li>
                    </ul>
                </div>

                <div class="stat-card">
                    <h4>Choice Frequency</h4>
                    <ul>
        `;

        Object.entries(stats.choiceFrequency).forEach(([choice, count]) => {
            const choiceObj = gameRegistry.getChoice(choice);
            html += `<li>${choiceObj.name}: ${count}x</li>`;
        });

        html += `
                    </ul>
                </div>

                <div class="stat-card">
                    <h4>Variable Ranges</h4>
                    <ul>
        `;

        Object.entries(stats.variableRanges).forEach(([varKey, range]) => {
            const varObj = gameRegistry.getVariable(varKey);
            html += `<li><strong>${varObj.name}</strong><br>Min: ${range.min} | Max: ${range.max} | Avg: ${range.average}</li>`;
        });

        html += `
                    </ul>
                </div>
            </div>
        `;

        display.innerHTML = html;
    }

    displayConditions() {
        const stats = gameRegistry.getStatistics();
        const display = document.getElementById('conditionsDisplay');

        let html = `
            <div class="conditions-grid">
                <div class="conditions-section">
                    <h4>🎯 Win Conditions</h4>
        `;

        Object.entries(stats.winConditions).forEach(([key, cond]) => {
            html += `
                <div class="condition-item">
                    <strong>${cond.name}</strong>
                    <p>${cond.description}</p>
                    <p>Triggered: ${cond.triggerCount}x ${cond.triggered ? '✅' : '⭕'}</p>
                </div>
            `;
        });

        html += `
                </div>

                <div class="conditions-section">
                    <h4>💀 Loss Conditions</h4>
        `;

        Object.entries(stats.lossConditions).forEach(([key, cond]) => {
            html += `
                <div class="condition-item">
                    <strong>${cond.name}</strong>
                    <p>${cond.description}</p>
                    <p>Triggered: ${cond.triggerCount}x ${cond.triggered ? '❌' : '⭕'}</p>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        display.innerHTML = html;
    }

    updateAllDisplays() {
        this.validateRegistry();
        this.displayStatistics();
        this.displayConditions();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuditDashboard();
});