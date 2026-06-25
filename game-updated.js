/**
 * Updated Economy Simulator Game Engine with Registry Integration
 */

class EconomyGame {
    constructor() {
        this.turn = 0;
        this.year = 1;
        this.quarter = 1;
        this.gameActive = true;
        this.gameWon = false;
        this.gameLost = false;
        this.endGameReason = '';
        
        this.selectedDecisions = [];
        this.eventMessages = [];
        this.pastEvents = [];
        
        this.init();
    }
    
    init() {
        this.registerAllGameEntities();
        this.renderDashboard();
        this.renderDecisions();
        this.attachEventListeners();
        this.generateRandomEvent();
    }

    // ==================== REGISTRY SETUP ====================
    registerAllGameEntities() {
        // Register Variables
        gameRegistry.registerVariable('gdp', {
            name: 'Gross Domestic Product',
            description: 'Total economic output',
            initialValue: 10.0,
            min: 0.1,
            max: 50,
            category: 'economic',
            unit: 'Trillion $',
            displayFormat: v => `$${v.toFixed(1)}T`
        });

        gameRegistry.registerVariable('inflation', {
            name: 'Inflation Rate',
            description: 'Yearly price increase',
            initialValue: 2.0,
            min: -5,
            max: 20,
            category: 'economic',
            unit: '%',
            displayFormat: v => `${v.toFixed(1)}%`
        });

        gameRegistry.registerVariable('unemployment', {
            name: 'Unemployment Rate',
            description: 'Percentage of population without work',
            initialValue: 4.5,
            min: 2.5,
            max: 15,
            category: 'social',
            unit: '%',
            displayFormat: v => `${v.toFixed(1)}%`
        });

        gameRegistry.registerVariable('interestRate', {
            name: 'Interest Rate',
            description: 'Central bank policy rate',
            initialValue: 3.5,
            min: 0.25,
            max: 10,
            category: 'monetary',
            unit: '%',
            displayFormat: v => `${v.toFixed(2)}%`
        });

        gameRegistry.registerVariable('debtToGdp', {
            name: 'Debt-to-GDP Ratio',
            description: 'National debt as percentage of GDP',
            initialValue: 65,
            min: 10,
            max: 150,
            category: 'fiscal',
            unit: '%',
            displayFormat: v => `${v.toFixed(0)}%`
        });

        gameRegistry.registerVariable('consumerConfidence', {
            name: 'Consumer Confidence',
            description: 'Sentiment index for consumers',
            initialValue: 75,
            min: 0,
            max: 100,
            category: 'social',
            unit: 'points',
            displayFormat: v => `${Math.round(v)}`
        });

        gameRegistry.registerVariable('stockMarket', {
            name: 'Stock Market Index',
            description: 'Main equity market index',
            initialValue: 12500,
            min: 1000,
            max: 50000,
            category: 'financial',
            unit: 'points',
            displayFormat: v => `${Math.round(v)}`
        });

        gameRegistry.registerVariable('budgetDeficit', {
            name: 'Budget Deficit',
            description: 'Government spending vs revenue',
            initialValue: -5.2,
            min: -20,
            max: 5,
            category: 'fiscal',
            unit: '% of GDP',
            displayFormat: v => `${v.toFixed(1)}%`
        });

        gameRegistry.registerVariable('gdpGrowth', {
            name: 'GDP Growth Rate',
            description: 'Quarterly GDP growth rate',
            initialValue: 2.5,
            min: -10,
            max: 10,
            category: 'economic',
            unit: '%',
            displayFormat: v => `${v.toFixed(1)}%`
        });

        // Register Choices/Decisions
        gameRegistry.registerChoice('stimulus', {
            name: 'Stimulus Spending',
            description: 'Inject money into economy through government spending',
            category: 'policy',
            effects: {
                gdpGrowth: 1.5,
                inflation: 0.5,
                debtToGdp: 3,
                consumerConfidence: 10,
                budgetDeficit: -2.0
            },
            riskLevel: 'medium'
        });

        gameRegistry.registerChoice('taxIncrease', {
            name: 'Tax Increase',
            description: 'Raise tax rates to reduce budget deficit',
            category: 'policy',
            effects: {
                gdpGrowth: -0.8,
                inflation: -0.2,
                debtToGdp: -2,
                consumerConfidence: -15,
                budgetDeficit: 2.5
            },
            riskLevel: 'high'
        });

        gameRegistry.registerChoice('rateHike', {
            name: 'Interest Rate Hike',
            description: 'Raise rates to combat inflation',
            category: 'policy',
            effects: {
                interestRate: 0.75,
                inflation: -0.8,
                gdpGrowth: -1.2,
                unemployment: 0.5,
                consumerConfidence: -10,
                stockMarket: -5
            },
            riskLevel: 'high'
        });

        gameRegistry.registerChoice('qe', {
            name: 'Quantitative Easing',
            description: 'Inject liquidity by purchasing government bonds',
            category: 'policy',
            effects: {
                gdpGrowth: 0.8,
                inflation: 0.8,
                interestRate: -0.5,
                stockMarket: 8,
                consumerConfidence: 5,
                debtToGdp: 2
            },
            riskLevel: 'medium'
        });

        gameRegistry.registerChoice('laborReform', {
            name: 'Labor Market Reform',
            description: 'Reduce labor regulations to boost employment',
            category: 'policy',
            effects: {
                unemployment: -1.2,
                gdpGrowth: 0.6,
                inflation: 0.3,
                consumerConfidence: 8,
                budgetDeficit: -0.5
            },
            riskLevel: 'low'
        });

        gameRegistry.registerChoice('trade', {
            name: 'Trade Agreement',
            description: 'Reduce tariffs and increase exports',
            category: 'policy',
            effects: {
                gdpGrowth: 1.0,
                inflation: -0.3,
                stockMarket: 4,
                consumerConfidence: 6,
                unemployment: -0.3
            },
            riskLevel: 'low'
        });

        // Register Systems
        gameRegistry.registerSystem('inflationSystem', {
            name: 'Inflation Control System',
            description: 'Manages inflation based on demand and monetary policy',
            category: 'economic',
            priority: 1
        });

        gameRegistry.registerSystem('employmentSystem', {
            name: 'Employment System',
            description: 'Manages unemployment based on growth and rates',
            category: 'social',
            priority: 2
        });

        gameRegistry.registerSystem('debtSystem', {
            name: 'Debt Management System',
            description: 'Tracks and constrains national debt',
            category: 'fiscal',
            priority: 3
        });

        // Register Win Conditions
        gameRegistry.registerWinCondition('economicStability', {
            name: 'Economic Stability',
            description: 'Maintain inflation 1-3%, unemployment <5%, GDP growing',
            condition: () => {
                const inflation = gameRegistry.getVariableValue('inflation');
                const unemployment = gameRegistry.getVariableValue('unemployment');
                const gdpGrowth = gameRegistry.getVariableValue('gdpGrowth');
                return inflation >= 1 && inflation <= 3 && unemployment < 5 && gdpGrowth > 0;
            }
        });

        gameRegistry.registerWinCondition('surplusAchieved', {
            name: 'Budget Surplus',
            description: 'Achieve positive budget surplus',
            condition: () => gameRegistry.getVariableValue('budgetDeficit') > 0
        });

        gameRegistry.registerWinCondition('debtReduction', {
            name: 'Debt Reduction',
            description: 'Reduce debt-to-GDP below 60%',
            condition: () => gameRegistry.getVariableValue('debtToGdp') < 60
        });

        gameRegistry.registerWinCondition('goldilocks', {
            name: 'Goldilocks Economy',
            description: 'All indicators in optimal ranges simultaneously',
            condition: () => {
                const inflation = gameRegistry.getVariableValue('inflation');
                const unemployment = gameRegistry.getVariableValue('unemployment');
                const gdpGrowth = gameRegistry.getVariableValue('gdpGrowth');
                const debtToGdp = gameRegistry.getVariableValue('debtToGdp');
                return inflation >= 1.5 && inflation <= 2.5 && 
                       unemployment >= 3.5 && unemployment <= 4.5 &&
                       gdpGrowth >= 2 && gdpGrowth <= 3.5 &&
                       debtToGdp >= 55 && debtToGdp <= 70;
            }
        });

        // Register Loss Conditions
        gameRegistry.registerLossCondition('severRecession', {
            name: 'Severe Recession',
            description: 'Unemployment exceeds 8%',
            condition: () => gameRegistry.getVariableValue('unemployment') > 8
        });

        gameRegistry.registerLossCondition('hyperinflation', {
            name: 'Hyperinflation',
            description: 'Inflation exceeds 15%',
            condition: () => gameRegistry.getVariableValue('inflation') > 15
        });

        gameRegistry.registerLossCondition('debtCrisis', {
            name: 'Debt Crisis',
            description: 'Debt-to-GDP exceeds 130%',
            condition: () => gameRegistry.getVariableValue('debtToGdp') > 130
        });

        gameRegistry.registerLossCondition('marketCrash', {
            name: 'Market Crash',
            description: 'Stock market drops 50%+',
            condition: () => gameRegistry.getVariableValue('stockMarket') < 6250
        });

        gameRegistry.registerLossCondition('civilUnrest', {
            name: 'Civil Unrest',
            description: 'Consumer confidence drops below 20',
            condition: () => gameRegistry.getVariableValue('consumerConfidence') < 20
        });
    }

    renderDashboard() {
        document.getElementById('year').textContent = this.year;

        const vars = [
            'gdp', 'inflation', 'unemployment', 'interestRate',
            'debtToGdp', 'consumerConfidence', 'stockMarket', 'budgetDeficit'
        ];

        const baselines = {
            gdp: 10.0, inflation: 2.0, unemployment: 4.5, interestRate: 3.5,
            debtToGdp: 65, consumerConfidence: 75, stockMarket: 12500, budgetDeficit: -5.2
        };

        vars.forEach(key => {
            const variable = gameRegistry.getVariable(key);
            const current = gameRegistry.getVariableValue(key);
            const change = current - baselines[key];
            
            const valueStr = variable.displayFormat(current);
            this.updateStat(key, valueStr, change, key);
        });
    }

    updateStat(id, value, change, key) {
        const element = document.getElementById(id);
        const changeElement = document.getElementById(id + 'Change');
        
        if (element) element.textContent = value;
        
        if (changeElement) {
            const decreaseIsBetter = ['unemployment', 'inflation', 'budgetDeficit', 'debtToGdp'].includes(key);
            const sign = change >= 0 ? '+' : '';
            const changeDisplay = key === 'consumerConfidence' ? `${sign}${Math.round(change)}` : `${sign}${Math.abs(change).toFixed(1)}`;
            
            changeElement.textContent = changeDisplay + (key !== 'consumerConfidence' ? '%' : '');
            
            if (decreaseIsBetter) {
                changeElement.className = 'stat-change ' + (change <= 0 ? 'positive' : 'negative');
            } else {
                changeElement.className = 'stat-change ' + (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral');
            }
        }
    }

    renderDecisions() {
        const grid = document.getElementById('decisionGrid');
        grid.innerHTML = '';
        
        const choices = gameRegistry.getAllChoices();
        choices.forEach((choice) => {
            const card = document.createElement('div');
            card.className = 'decision-card';
            card.dataset.key = choice.key;
            
            let effectsHtml = '<div class="decision-effects">';
            Object.entries(choice.effects).forEach(([key, value]) => {
                const variable = gameRegistry.getVariable(key);
                const label = variable ? variable.name : this.formatLabel(key);
                const isNegative = value < 0;
                const sign = value > 0 ? '+' : '';
                effectsHtml += `<div class="effect-item">
                    <span class="effect-label">${label}</span>
                    <span class="effect-value ${isNegative ? 'negative' : 'positive'}">${sign}${value.toFixed(1)}</span>
                </div>`;
            });
            effectsHtml += '</div>';
            
            card.innerHTML = `
                <div class="decision-title">${choice.name}</div>
                <div class="decision-desc">${choice.description}</div>
                <div class="risk-level" style="color: ${choice.riskLevel === 'low' ? '#00ff88' : choice.riskLevel === 'medium' ? '#ffaa00' : '#ff4444'}">Risk: ${choice.riskLevel.toUpperCase()}</div>
                ${effectsHtml}
            `;
            
            card.addEventListener('click', () => this.selectDecision(choice.key, card));
            grid.appendChild(card);
        });
    }

    formatLabel(key) {
        const labels = {
            gdpGrowth: 'GDP Growth', inflation: 'Inflation', unemployment: 'Unemployment',
            interestRate: 'Interest Rate', debtToGdp: 'Debt-to-GDP', consumerConfidence: 'Confidence',
            stockMarket: 'Stock Market', budgetDeficit: 'Budget Deficit'
        };
        return labels[key] || key;
    }

    selectDecision(key, cardElement) {
        document.querySelectorAll('.decision-card').forEach(card => card.classList.remove('selected'));
        cardElement.classList.add('selected');
        this.selectedDecisions = [key];
    }

    attachEventListeners() {
        document.getElementById('nextTurnBtn').addEventListener('click', () => this.nextTurn());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    nextTurn() {
        if (!this.gameActive) {
            alert(this.endGameReason);
            return;
        }

        if (this.selectedDecisions.length === 0) {
            alert('Please select a policy decision before proceeding');
            return;
        }

        this.applyDecisionEffects();
        this.applyRandomEffects();
        this.calculateEconomicInteractions();
        this.checkGameOver();

        this.turn++;
        this.quarter++;
        if (this.quarter > 4) {
            this.quarter = 1;
            this.year++;
        }

        this.renderDashboard();
        this.renderDecisions();
        this.updateEventDisplay();
    }

    applyDecisionEffects() {
        const choiceKey = this.selectedDecisions[0];
        const choice = gameRegistry.getChoice(choiceKey);
        gameRegistry.recordChoiceMade(choiceKey);

        Object.entries(choice.effects).forEach(([varKey, value]) => {
            const current = gameRegistry.getVariableValue(varKey);
            gameRegistry.setVariableValue(varKey, current + value);
        });

        this.eventMessages.push(`📋 Policy: ${choice.name}`);
        this.selectedDecisions = [];
    }

    applyRandomEffects() {
        if (Math.random() < 0.2) {
            const events = [
                { name: 'Oil Crisis', inflation: 1.5, gdpGrowth: -1.0 },
                { name: 'Tech Boom', gdpGrowth: 2.0, stockMarket: 10 },
                { name: 'Trade War', gdpGrowth: -0.8, inflation: 0.5 },
                { name: 'Productivity Surge', gdpGrowth: 1.5, inflation: -0.3 }
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            Object.entries(event).forEach(([key, value]) => {
                if (key !== 'name') {
                    const current = gameRegistry.getVariableValue(key);
                    if (current !== null) {
                        gameRegistry.setVariableValue(key, current + value);
                    }
                }
            });

            gameRegistry.recordEventTriggered(event.name);
            this.eventMessages.push(`⚠️ ${event.name}`);
        }
    }

    calculateEconomicInteractions() {
        const inflation = gameRegistry.getVariableValue('inflation');
        const unemployment = gameRegistry.getVariableValue('unemployment');
        const consumerConfidence = gameRegistry.getVariableValue('consumerConfidence');
        const gdpGrowth = gameRegistry.getVariableValue('gdpGrowth');
        const debtToGdp = gameRegistry.getVariableValue('debtToGdp');
        const interestRate = gameRegistry.getVariableValue('interestRate');

        if (inflation > 4) {
            gameRegistry.setVariableValue('consumerConfidence', consumerConfidence - (inflation - 4) * 2);
        }

        if (unemployment > 6) {
            gameRegistry.setVariableValue('consumerConfidence', consumerConfidence - (unemployment - 6) * 3);
        }

        const newGdpGrowth = gdpGrowth + (consumerConfidence - 75) * 0.02;
        gameRegistry.setVariableValue('gdpGrowth', newGdpGrowth);

        if (debtToGdp > 90) {
            gameRegistry.setVariableValue('gdpGrowth', gameRegistry.getVariableValue('gdpGrowth') - 0.5);
        }

        const newUnemployment = unemployment + (interestRate - 3.5) * 0.3;
        gameRegistry.setVariableValue('unemployment', newUnemployment);

        const newInflation = inflation + unemployment * 0.1 - 0.5;
        gameRegistry.setVariableValue('inflation', newInflation);

        const finalUnemployment = gameRegistry.getVariableValue('unemployment') - gdpGrowth * 0.4;
        gameRegistry.setVariableValue('unemployment', finalUnemployment);

        const gdp = gameRegistry.getVariableValue('gdp');
        const budgetDeficit = gameRegistry.getVariableValue('budgetDeficit');
        gameRegistry.setVariableValue('gdp', gdp * (1 + gameRegistry.getVariableValue('gdpGrowth') / 400));
        gameRegistry.setVariableValue('debtToGdp', debtToGdp + budgetDeficit * 0.5);

        let stockMarket = gameRegistry.getVariableValue('stockMarket');
        stockMarket += (gameRegistry.getVariableValue('gdpGrowth') * 100 - interestRate * 50 + consumerConfidence);
        gameRegistry.setVariableValue('stockMarket', stockMarket);
    }

    checkGameOver() {
        const losses = gameRegistry.checkLossConditions();
        const wins = gameRegistry.checkWinConditions();

        if (losses.length > 0) {
            this.gameActive = false;
            this.gameLost = true;
            const lossCondition = gameRegistry.statistics.lossConditionsMet.get(losses[0]);
            this.endGameReason = `🔴 GAME OVER - Loss Condition: ${lossCondition.name}\n${lossCondition.description}`;
            this.finishGame(false);
        } else if (wins.length >= 2 && this.turn >= 20) {
            this.gameActive = false;
            this.gameWon = true;
            this.endGameReason = `🎉 GAME WON!\nYou achieved ${wins.length} win conditions!`;
            this.finishGame(true);
        }
    }

    finishGame(won) {
        gameRegistry.recordGameResult(won, this.turn, {
            gdp: gameRegistry.getVariableValue('gdp'),
            inflation: gameRegistry.getVariableValue('inflation'),
            unemployment: gameRegistry.getVariableValue('unemployment'),
            year: this.year
        });

        document.getElementById('nextTurnBtn').textContent = won ? '✅ Victory!' : '❌ Defeat';
        document.getElementById('nextTurnBtn').disabled = true;
    }

    updateEventDisplay() {
        const eventDisplay = document.getElementById('eventDisplay');
        const recentEvents = this.eventMessages.slice(-3).join(' • ');
        eventDisplay.textContent = recentEvents || 'Awaiting first decision...';
        this.updateTrends();
    }

    updateTrends() {
        const gdpGrowth = gameRegistry.getVariableValue('gdpGrowth');
        const inflation = gameRegistry.getVariableValue('inflation');
        const unemployment = gameRegistry.getVariableValue('unemployment');

        let gdpStatus = gdpGrowth > 2.5 ? '📈 Strong' : gdpGrowth < 0 ? '📉 Shrinking' : 'Stable';
        let inflationStatus = inflation > 4 ? '🔥 High' : inflation < 0 ? '❄️ Deflation' : 'Controlled';
        let employmentStatus = unemployment > 6 ? '⚠️ Elevated' : unemployment < 3.5 ? '✓ Tight' : 'Good';

        document.getElementById('trendChart').innerHTML = `
            <div class="trend-line gdp-trend">GDP Growth: ${gdpStatus} (${gdpGrowth.toFixed(1)}%)</div>
            <div class="trend-line inflation-trend">Inflation: ${inflationStatus} (${inflation.toFixed(1)}%)</div>
            <div class="trend-line unemployment-trend">Unemployment: ${employmentStatus} (${unemployment.toFixed(1)}%)</div>
        `;
    }

    reset() {
        if (confirm('Reset the game?')) {
            location.reload();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EconomyGame();
});