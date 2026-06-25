/**
 * Developer Audit Dashboard
 * Automated playtesting and registry validation
 * Mobile-optimized version
 */

class AuditDashboard {
    constructor() {
        this.isVisible = false;
        this.playtestResults = [];
        this.playtestInProgress = false;
        this.isMobile = this.detectMobile();
        this.createDashboardUI();
        this.attachEventListeners();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    createDashboardUI() {
        const dashboard = document.createElement('div');
        dashboard.id = 'auditDashboard';
        dashboard.className = 'audit-dashboard hidden';
        dashboard.innerHTML = `
            <div class="audit-header">
                <h2>\ud83d\udd27 Audit</h2>
                <button id="closeAuditBtn" class="close-btn">\u2715</button>
            </div>

            <div class="audit-tabs">
                <button class="audit-tab active" data-tab="registry">Registry</button>
                <button class="audit-tab" data-tab="playtest">Playtest</button>
                <button class="audit-tab" data-tab="statistics">Stats</button>
                <button class="audit-tab" data-tab="conditions">Win/Loss</button>
            </div>

            <!-- Registry Tab -->
            <div class="audit-content" id="registryTab">
                <h3>Registry Validation</h3>
                <div id="registryValidation" class="validation-display"></div>
                <button id="validateRegistryBtn" class="btn btn-audit">Validate</button>
                <button id="exportRegistryBtn" class="btn btn-audit">Export</button>
            </div>

            <!-- Playtest Tab -->
            <div class="audit-content hidden" id="playtestTab">
                <h3>Automated Playtesting</h3>
                <div class="playtest-controls">
                    <label>Simulations:</label>
                    <input type="number" id="playtestCount" value="5" min="1" max="50">
                    <button id="startPlaytestBtn" class="btn btn-audit">Start</button>
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
        // Toggle dashboard with keyboard or gesture
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                this.toggleVisibility();
            }
        });

        // Mobile menu toggle
        if (this.isMobile) {
            // Add swipe support
            let touchStartX = 0;
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            });

            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                // Swipe from right edge to open
                if (window.innerWidth - touchStartX < 50 && touchEndX > window.innerWidth - 50) {
                    if (!this.isVisible) this.toggleVisibility();
                }
            });
        }

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
                <h4>${validation.isValid ? '✅ Valid' : '⚠️ Issues'}</h4>
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
                html += `<li class="error-item">⚠️ ${issue}</li>`;
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
        alert('Registry exported successfully!');
    }

    async startPlaytest() {
        const count = Math.min(parseInt(document.getElementById('playtestCount').value), 50);
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
            const progress = ((i + 1) / count) * 100;
            progressDisplay.innerHTML = `<p>Game ${i + 1}/${count}</p><div class="progress-bar" style="width: ${progress}%"></div>`;

            const result = await this.runSinglePlaytest();
            results.gameDetails.push(result);
            results.completed++;

            if (result.won) results.wins++;
            else results.losses++;

            results.avgTurns = (results.avgTurns * i + result.turns) / (i + 1);

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.playtestResults = results;
        this.displayPlaytestResults(results);

        document.getElementById('startPlaytestBtn').disabled = false;
        document.getElementById('stopPlaytestBtn').disabled = true;
        this.playtestInProgress = false;
    }

    stopPlaytest() {
        this.playtestInProgress = false;
        document.getElementById('startPlaytestBtn').disabled = false;
        document.getElementById('stopPlaytestBtn').disabled = true;
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
                <h4>Results Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Completed:</span>
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
                <h4>Details</h4>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>R</th>
                            <th>Turns</th>
                            <th>GDP</th>
                            <th>Inf</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        results.gameDetails.slice(0, 15).forEach((game, idx) => {
            const resultEmoji = game.won ? '✅' : '❌';
            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${resultEmoji}</td>
                    <td>${game.turns}</td>
                    <td>$${game.finalGdp.toFixed(1)}</td>
                    <td>${game.finalInflation.toFixed(1)}%</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                ${results.completed > 15 ? `<p style="text-align: center; font-size: 0.8em; margin-top: 5px;">Showing 15 of ${results.completed} games</p>` : ''}
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
                    <h4>Overall</h4>
                    <ul>
                        <li>Games: ${stats.totalGamesPlayed}</li>
                        <li>Won: ${stats.gamesWon}</li>
                        <li>Lost: ${stats.gamesLost}</li>
                        <li>Win Rate: ${stats.winRate}%</li>
                        <li>Avg Length: ${stats.averageGameLength} turns</li>
                    </ul>
                </div>

                <div class="stat-card">
                    <h4>Choices</h4>
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

        Object.entries(stats.variableRanges).slice(0, 5).forEach(([varKey, range]) => {
            const varObj = gameRegistry.getVariable(varKey);
            html += `<li><strong>${varObj.name}</strong><br>A: ${range.average}</li>`;
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