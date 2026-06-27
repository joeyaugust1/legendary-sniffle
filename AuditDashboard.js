/**
 * Developer Audit Dashboard
 * Automated playtesting and registry validation
 * Mobile-optimized version with enhanced statistics
 */

class AuditDashboard {
    constructor() {
        this.isVisible = false;
        this.playtestResults = [];
        this.playtestInProgress = false;
        this.isMobile = this.detectMobile();
        this.createAuditButton();
        this.createDashboardUI();
        this.attachEventListeners();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    createAuditButton() {
        // Create container for floating button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'auditButtonContainer';
        buttonContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            width: 60px;
            height: 60px;
        `;

        // Create the button
        const button = document.createElement('button');
        button.id = 'auditActivateBtn';
        button.className = 'audit-activate-btn';
        button.innerHTML = '🔧';
        button.title = 'Open Audit Dashboard';
        button.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff00ff 0%, #00d4ff 100%);
            border: 2px solid #fff;
            color: #000;
            font-size: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(255, 0, 255, 0.5);
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.3s ease;
        `;

        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 20px rgba(255, 0, 255, 0.7)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(255, 0, 255, 0.5)';
        });

        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1.1)';
        });

        buttonContainer.appendChild(button);
        document.body.appendChild(buttonContainer);
    }

    createDashboardUI() {
        const dashboard = document.createElement('div');
        dashboard.id = 'auditDashboard';
        dashboard.className = 'audit-dashboard hidden';
        dashboard.innerHTML = `
            <div class="audit-header">
                <h2>🔧 Audit Dashboard</h2>
                <button id="closeAuditBtn" class="close-btn">✕</button>
            </div>

            <div class="audit-tabs">
                <button class="audit-tab active" data-tab="playtest">Playtest</button>
                <button class="audit-tab" data-tab="registry">Registry</button>
                <button class="audit-tab" data-tab="statistics">Stats</button>
                <button class="audit-tab" data-tab="conditions">Win/Loss</button>
            </div>

            <!-- Playtest Tab -->
            <div class="audit-content" id="playtestTab">
                <h3>Automated Playtesting</h3>
                <div class="playtest-controls">
                    <label for="playtestSlider">Simulations: <span id="playtestValue">5</span></label>
                    <input type="range" id="playtestSlider" class="playtest-slider" min="1" max="100" value="5">
                    <button id="startPlaytestBtn" class="btn btn-audit">▶ Start</button>
                    <button id="stopPlaytestBtn" class="btn btn-audit" disabled>⏹ Stop</button>
                </div>
                <div id="playtestProgress" class="progress-display"></div>
                <div id="playtestResults" class="results-display"></div>
            </div>

            <!-- Registry Tab -->
            <div class="audit-content hidden" id="registryTab">
                <h3>Registry Validation</h3>
                <div id="registryValidation" class="validation-display"></div>
                <button id="validateRegistryBtn" class="btn btn-audit">✓ Validate</button>
                <button id="exportRegistryBtn" class="btn btn-audit">⬇ Export</button>
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
        // Activation button
        const auditBtn = document.getElementById('auditActivateBtn');
        if (auditBtn) {
            auditBtn.addEventListener('click', () => this.toggleVisibility());
        }

        // Toggle dashboard with keyboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                this.toggleVisibility();
            }
        });

        // Close button
        const closeBtn = document.getElementById('closeAuditBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleVisibility());
        }

        // Tab switching
        document.querySelectorAll('.audit-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Playtest slider
        const slider = document.getElementById('playtestSlider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                const valueDisplay = document.getElementById('playtestValue');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        }

        // Registry validation
        const validateBtn = document.getElementById('validateRegistryBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.validateRegistry());
        }

        const exportBtn = document.getElementById('exportRegistryBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportRegistry());
        }

        // Playtest
        const startBtn = document.getElementById('startPlaytestBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPlaytest());
        }

        const stopBtn = document.getElementById('stopPlaytestBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopPlaytest());
        }
    }

    toggleVisibility() {
        const dashboard = document.getElementById('auditDashboard');
        if (!dashboard) return;
        
        this.isVisible = !this.isVisible;
        dashboard.classList.toggle('hidden');
        
        if (this.isVisible) {
            this.updateAllDisplays();
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.audit-content').forEach(tab => tab.classList.add('hidden'));
        document.querySelectorAll('.audit-tab').forEach(tab => tab.classList.remove('active'));
        
        const contentTab = document.getElementById(`${tabName}Tab`);
        if (contentTab) {
            contentTab.classList.remove('hidden');
        }
        
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        if (tabName === 'statistics') {
            this.displayStatistics();
        } else if (tabName === 'conditions') {
            this.displayConditions();
        } else if (tabName === 'registry') {
            this.validateRegistry();
        }
    }

    validateRegistry() {
        if (typeof gameRegistry === 'undefined') {
            console.error('GameRegistry not loaded');
            return;
        }

        const validation = gameRegistry.validateRegistry();
        const display = document.getElementById('registryValidation');
        if (!display) return;

        let html = `
            <div class="validation-result ${validation.isValid ? 'valid' : 'invalid'}">
                <h4>${validation.isValid ? '✅ Registry Valid' : '⚠️ Registry Issues'}</h4>
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
            html += `<p><strong>Issues Found:</strong></p><ul>`;
            validation.issues.forEach(issue => {
                html += `<li class="error-item">⚠️ ${issue}</li>`;
            });
            html += `</ul>`;
        } else {
            html += `<p style="color: #00ff88; margin-top: 10px;">✓ All systems registered correctly!</p>`;
        }

        html += `</div>`;
        display.innerHTML = html;
    }

    exportRegistry() {
        if (typeof gameRegistry === 'undefined') {
            alert('GameRegistry not loaded');
            return;
        }

        const dump = gameRegistry.getFullRegistryDump();
        const json = JSON.stringify(dump, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registry-dump-${Date.now()}.json`;
        a.click();
        alert('✓ Registry exported successfully!');
    }

    async startPlaytest() {
        const slider = document.getElementById('playtestSlider');
        if (!slider) return;
        
        const count = parseInt(slider.value);
        this.playtestInProgress = true;
        
        const startBtn = document.getElementById('startPlaytestBtn');
        const stopBtn = document.getElementById('stopPlaytestBtn');
        
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        if (slider) slider.disabled = true;

        const progressDisplay = document.getElementById('playtestProgress');
        const resultsDisplay = document.getElementById('playtestResults');

        if (progressDisplay) progressDisplay.innerHTML = '<p>Starting playtests...</p>';
        if (resultsDisplay) resultsDisplay.innerHTML = '';

        const results = {
            totalTests: count,
            completed: 0,
            wins: 0,
            losses: 0,
            avgTurns: 0,
            totalTurns: 0,
            minTurns: Infinity,
            maxTurns: 0,
            gameDetails: [],
            gdpStats: { min: Infinity, max: -Infinity, avg: 0, total: 0 },
            inflationStats: { min: Infinity, max: -Infinity, avg: 0, total: 0 },
            unemploymentStats: { min: Infinity, max: -Infinity, avg: 0, total: 0 },
            debtStats: { min: Infinity, max: -Infinity, avg: 0, total: 0 },
            choiceUsage: {},
            endConditions: {}
        };

        for (let i = 0; i < count && this.playtestInProgress; i++) {
            const progress = ((i + 1) / count) * 100;
            if (progressDisplay) {
                progressDisplay.innerHTML = `<p>Game ${i + 1}/${count} (${Math.round(progress)}%)</p><div class="progress-bar" style="width: ${progress}%"></div>`;
            }

            const result = await this.runSinglePlaytest();
            results.gameDetails.push(result);
            results.completed++;

            if (result.won) results.wins++;
            else results.losses++;

            results.totalTurns += result.turns;
            results.minTurns = Math.min(results.minTurns, result.turns);
            results.maxTurns = Math.max(results.maxTurns, result.turns);

            results.gdpStats.total += result.finalGdp;
            results.gdpStats.min = Math.min(results.gdpStats.min, result.finalGdp);
            results.gdpStats.max = Math.max(results.gdpStats.max, result.finalGdp);

            results.inflationStats.total += result.finalInflation;
            results.inflationStats.min = Math.min(results.inflationStats.min, result.finalInflation);
            results.inflationStats.max = Math.max(results.inflationStats.max, result.finalInflation);

            results.unemploymentStats.total += result.finalUnemployment;
            results.unemploymentStats.min = Math.min(results.unemploymentStats.min, result.finalUnemployment);
            results.unemploymentStats.max = Math.max(results.unemploymentStats.max, result.finalUnemployment);

            results.debtStats.total += result.debtToGdp;
            results.debtStats.min = Math.min(results.debtStats.min, result.debtToGdp);
            results.debtStats.max = Math.max(results.debtStats.max, result.debtToGdp);

            result.choicesMade.forEach(choice => {
                results.choiceUsage[choice] = (results.choiceUsage[choice] || 0) + 1;
            });

            result.endCondition.forEach(cond => {
                results.endConditions[cond] = (results.endConditions[cond] || 0) + 1;
            });

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        results.avgTurns = results.totalTurns / results.completed;
        results.gdpStats.avg = results.gdpStats.total / results.completed;
        results.inflationStats.avg = results.inflationStats.total / results.completed;
        results.unemploymentStats.avg = results.unemploymentStats.total / results.completed;
        results.debtStats.avg = results.debtStats.total / results.completed;

        this.playtestResults = results;
        this.displayPlaytestResults(results);

        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        if (slider) slider.disabled = false;
        this.playtestInProgress = false;
    }

    stopPlaytest() {
        this.playtestInProgress = false;
        const startBtn = document.getElementById('startPlaytestBtn');
        const stopBtn = document.getElementById('stopPlaytestBtn');
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
    }

    async runSinglePlaytest() {
        if (typeof gameRegistry === 'undefined' || typeof EconomyGame === 'undefined') {
            return {
                turns: 0,
                won: false,
                finalGdp: 10,
                finalInflation: 2,
                finalUnemployment: 4.5,
                debtToGdp: 65,
                choicesMade: [],
                endCondition: ['Error']
            };
        }

        gameRegistry.resetStatistics();

        const game = new EconomyGame();
        let turns = 0;
        const maxTurns = 100;
        const choicesMade = [];
        const endConditions = [];

        while (game.gameActive && turns < maxTurns) {
            const choices = gameRegistry.getAllChoices();
            if (choices.length > 0) {
                const randomChoice = choices[Math.floor(Math.random() * choices.length)];
                game.selectedDecisions = [randomChoice.key];
                choicesMade.push(randomChoice.key);
            }

            game.nextTurn();
            turns++;
        }

        const losses = gameRegistry.checkLossConditions();
        const wins = gameRegistry.checkWinConditions();
        
        if (losses.length > 0) {
            endConditions.push(gameRegistry.statistics.lossConditionsMet.get(losses[0]).name);
        }
        wins.forEach(win => {
            endConditions.push(gameRegistry.statistics.winConditionsMet.get(win).name);
        });

        return {
            turns,
            won: game.gameWon,
            finalGdp: gameRegistry.getVariableValue('gdp'),
            finalInflation: gameRegistry.getVariableValue('inflation'),
            finalUnemployment: gameRegistry.getVariableValue('unemployment'),
            debtToGdp: gameRegistry.getVariableValue('debtToGdp'),
            choicesMade,
            endCondition: endConditions.length > 0 ? endConditions : ['Timeout']
        };
    }

    displayPlaytestResults(results) {
        const display = document.getElementById('playtestResults');
        if (!display) return;

        const winRate = ((results.wins / results.completed) * 100).toFixed(1);

        let html = `
            <div class="playtest-summary">
                <h4>📊 Outcome Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Completed</span>
                        <span class="value">${results.completed}/${results.totalTests}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Wins</span>
                        <span class="value success">🏁 ${results.wins}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Losses</span>
                        <span class="value error">💥 ${results.losses}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Win Rate</span>
                        <span class="value">${winRate}%</span>
                    </div>
                </div>
            </div>

            <div class="playtest-stats">
                <h4>📈 Turn Statistics</h4>
                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-title">Avg</span>
                        <span class="stat-val">${results.avgTurns.toFixed(1)}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Min</span>
                        <span class="stat-val">${results.minTurns}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Max</span>
                        <span class="stat-val">${results.maxTurns}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Total</span>
                        <span class="stat-val">${results.totalTurns}</span>
                    </div>
                </div>
            </div>

            <div class="playtest-stats">
                <h4>💰 Final GDP Ranges</h4>
                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-title">Avg</span>
                        <span class="stat-val">$${results.gdpStats.avg.toFixed(1)}T</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Min</span>
                        <span class="stat-val">$${results.gdpStats.min.toFixed(1)}T</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Max</span>
                        <span class="stat-val">$${results.gdpStats.max.toFixed(1)}T</span>
                    </div>
                </div>
            </div>

            <div class="playtest-stats">
                <h4>📉 Inflation Outcomes</h4>
                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-title">Avg</span>
                        <span class="stat-val">${results.inflationStats.avg.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Min</span>
                        <span class="stat-val">${results.inflationStats.min.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Max</span>
                        <span class="stat-val">${results.inflationStats.max.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div class="playtest-stats">
                <h4>👥 Unemployment Outcomes</h4>
                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-title">Avg</span>
                        <span class="stat-val">${results.unemploymentStats.avg.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Min</span>
                        <span class="stat-val">${results.unemploymentStats.min.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Max</span>
                        <span class="stat-val">${results.unemploymentStats.max.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div class="playtest-stats">
                <h4>📊 Debt-to-GDP Outcomes</h4>
                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-title">Avg</span>
                        <span class="stat-val">${results.debtStats.avg.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Min</span>
                        <span class="stat-val">${results.debtStats.min.toFixed(1)}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-title">Max</span>
                        <span class="stat-val">${results.debtStats.max.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;

        if (Object.keys(results.choiceUsage).length > 0) {
            html += `<div class="playtest-stats">
                <h4>🏛️ Top Choices Used</h4>
                <div class="choice-list">`;
            
            const sortedChoices = Object.entries(results.choiceUsage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);
            
            sortedChoices.forEach(([choice, count]) => {
                const avgPerGame = (count / results.completed).toFixed(2);
                html += `<div class="choice-item">
                    <span>${choice}</span>
                    <span>${count}x (${avgPerGame}/game)</span>
                </div>`;
            });
            
            html += `</div></div>`;
        }

        if (Object.keys(results.endConditions).length > 0) {
            html += `<div class="playtest-stats">
                <h4>🏁 End Conditions Triggered</h4>
                <div class="condition-list">`;
            
            const sortedConditions = Object.entries(results.endConditions)
                .sort((a, b) => b[1] - a[1]);
            
            sortedConditions.forEach(([cond, count]) => {
                const percentage = ((count / results.completed) * 100).toFixed(1);
                html += `<div class="condition-row">
                    <span>${cond}</span>
                    <span>${count}x (${percentage}%)</span>
                </div>`;
            });
            
            html += `</div></div>`;
        }

        display.innerHTML = html;
    }

    displayStatistics() {
        if (typeof gameRegistry === 'undefined') return;

        const stats = gameRegistry.getStatistics();
        const display = document.getElementById('statisticsDisplay');
        if (!display) return;

        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>📊 Overall Stats</h4>
                    <ul>
                        <li>Total Games: ${stats.totalGamesPlayed}</li>
                        <li>Won: ${stats.gamesWon}</li>
                        <li>Lost: ${stats.gamesLost}</li>
                        <li>Win Rate: ${stats.winRate}%</li>
                        <li>Avg Length: ${stats.averageGameLength} turns</li>
                    </ul>
                </div>

                <div class="stat-card">
                    <h4>🏛️ Top 5 Choices</h4>
                    <ul>
        `;

        const topChoices = Object.entries(stats.choiceFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        topChoices.forEach(([choice, count]) => {
            html += `<li>${choice}: ${count}x</li>`;
        });

        html += `
                    </ul>
                </div>
            </div>
        `;

        display.innerHTML = html;
    }

    displayConditions() {
        if (typeof gameRegistry === 'undefined') return;

        const stats = gameRegistry.getStatistics();
        const display = document.getElementById('conditionsDisplay');
        if (!display) return;

        let html = `
            <div class="conditions-grid">
                <div class="conditions-section">
                    <h4>🏁 Win Conditions</h4>
        `;

        Object.entries(stats.winConditions).forEach(([key, cond]) => {
            const triggered = cond.triggerCount > 0;
            html += `
                <div class="condition-item ${triggered ? 'triggered' : ''}">
                    <strong>${cond.name}</strong>
                    <p>${cond.description}</p>
                    <p>Triggered: ${cond.triggerCount}x ${triggered ? '✅' : '⭕'}</p>
                </div>
            `;
        });

        html += `
                </div>

                <div class="conditions-section">
                    <h4>💀 Loss Conditions</h4>
        `;

        Object.entries(stats.lossConditions).forEach(([key, cond]) => {
            const triggered = cond.triggerCount > 0;
            html += `
                <div class="condition-item ${triggered ? 'triggered' : ''}">
                    <strong>${cond.name}</strong>
                    <p>${cond.description}</p>
                    <p>Triggered: ${cond.triggerCount}x ${triggered ? '❌' : '⭕'}</p>
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
    setTimeout(() => {
        new AuditDashboard();
    }, 500);
});