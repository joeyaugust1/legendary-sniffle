/**
 * Central Game Registry
 * Manages all game variables, events, effects, choices, systems, and statistics
 * Enables developer audit dashboard and automated playtesting
 */

class GameRegistry {
    constructor() {
        this.variables = new Map();
        this.events = new Map();
        this.effects = new Map();
        this.choices = new Map();
        this.systems = new Map();
        this.statistics = {
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalChoicesMade: 0,
            choiceFrequency: new Map(),
            eventFrequency: new Map(),
            variableRanges: new Map(),
            averageGameLength: 0,
            winConditionsMet: new Map(),
            lossConditionsMet: new Map()
        };
        this.sessionHistory = [];
    }

    // ==================== VARIABLE REGISTRY ====================
    registerVariable(key, config) {
        if (this.variables.has(key)) {
            console.warn(`Variable "${key}" already registered. Overwriting.`);
        }
        
        this.variables.set(key, {
            key,
            name: config.name || key,
            description: config.description || '',
            initialValue: config.initialValue,
            currentValue: config.initialValue,
            min: config.min !== undefined ? config.min : -Infinity,
            max: config.max !== undefined ? config.max : Infinity,
            category: config.category || 'general',
            unit: config.unit || '',
            displayFormat: config.displayFormat || (v => v.toFixed(2)),
            history: [config.initialValue]
        });

        // Initialize range tracking
        if (!this.statistics.variableRanges.has(key)) {
            this.statistics.variableRanges.set(key, {
                min: config.initialValue,
                max: config.initialValue,
                average: config.initialValue,
                samples: 1
            });
        }

        return this.variables.get(key);
    }

    getVariable(key) {
        return this.variables.get(key);
    }

    setVariableValue(key, value) {
        const variable = this.variables.get(key);
        if (!variable) {
            console.error(`Variable "${key}" not found in registry`);
            return null;
        }

        const clampedValue = Math.max(variable.min, Math.min(variable.max, value));
        variable.currentValue = clampedValue;
        variable.history.push(clampedValue);

        // Update statistics
        const range = this.statistics.variableRanges.get(key);
        range.min = Math.min(range.min, clampedValue);
        range.max = Math.max(range.max, clampedValue);
        range.samples++;
        range.average = (range.average * (range.samples - 1) + clampedValue) / range.samples;

        return clampedValue;
    }

    getVariableValue(key) {
        const variable = this.variables.get(key);
        return variable ? variable.currentValue : null;
    }

    getAllVariables() {
        return Array.from(this.variables.values());
    }

    // ==================== EVENT REGISTRY ====================
    registerEvent(key, config) {
        if (this.events.has(key)) {
            console.warn(`Event "${key}" already registered. Overwriting.`);
        }

        this.events.set(key, {
            key,
            name: config.name || key,
            description: config.description || '',
            probability: config.probability || 0,
            category: config.category || 'general',
            triggerCondition: config.triggerCondition || (() => true),
            effects: config.effects || {},
            message: config.message || '',
            icon: config.icon || '•',
            tags: config.tags || []
        });

        if (!this.statistics.eventFrequency.has(key)) {
            this.statistics.eventFrequency.set(key, 0);
        }

        return this.events.get(key);
    }

    getEvent(key) {
        return this.events.get(key);
    }

    getAllEvents() {
        return Array.from(this.events.values());
    }

    recordEventTriggered(key) {
        const count = this.statistics.eventFrequency.get(key) || 0;
        this.statistics.eventFrequency.set(key, count + 1);
    }

    // ==================== EFFECT REGISTRY ====================
    registerEffect(key, config) {
        if (this.effects.has(key)) {
            console.warn(`Effect "${key}" already registered. Overwriting.`);
        }

        this.effects.set(key, {
            key,
            name: config.name || key,
            description: config.description || '',
            category: config.category || 'general',
            applicableVariables: config.applicableVariables || [],
            calculateEffect: config.calculateEffect || ((context) => ({})),
            priority: config.priority || 0,
            tags: config.tags || []
        });

        return this.effects.get(key);
    }

    getEffect(key) {
        return this.effects.get(key);
    }

    getAllEffects() {
        return Array.from(this.effects.values());
    }

    applyEffect(effectKey, context = {}) {
        const effect = this.effects.get(effectKey);
        if (!effect) {
            console.error(`Effect "${effectKey}" not found in registry`);
            return null;
        }

        return effect.calculateEffect(context);
    }

    // ==================== CHOICE REGISTRY ====================
    registerChoice(key, config) {
        if (this.choices.has(key)) {
            console.warn(`Choice "${key}" already registered. Overwriting.`);
        }

        this.choices.set(key, {
            key,
            name: config.name || key,
            description: config.description || '',
            category: config.category || 'policy',
            effects: config.effects || {},
            icon: config.icon || '→',
            tags: config.tags || [],
            availableWhen: config.availableWhen || (() => true),
            riskLevel: config.riskLevel || 'medium'
        });

        if (!this.statistics.choiceFrequency.has(key)) {
            this.statistics.choiceFrequency.set(key, 0);
        }

        return this.choices.get(key);
    }

    getChoice(key) {
        return this.choices.get(key);
    }

    getAllChoices() {
        return Array.from(this.choices.values());
    }

    recordChoiceMade(key) {
        this.statistics.totalChoicesMade++;
        const count = this.statistics.choiceFrequency.get(key) || 0;
        this.statistics.choiceFrequency.set(key, count + 1);
    }

    // ==================== SYSTEM REGISTRY ====================
    registerSystem(key, config) {
        if (this.systems.has(key)) {
            console.warn(`System "${key}" already registered. Overwriting.`);
        }

        this.systems.set(key, {
            key,
            name: config.name || key,
            description: config.description || '',
            category: config.category || 'economic',
            dependencies: config.dependencies || [],
            update: config.update || (() => ({})),
            priority: config.priority || 0,
            enabled: config.enabled !== false
        });

        return this.systems.get(key);
    }

    getSystem(key) {
        return this.systems.get(key);
    }

    getAllSystems() {
        return Array.from(this.systems.values());
    }

    // ==================== WIN/LOSS CONDITIONS ====================
    registerWinCondition(key, config) {
        if (!this.statistics.winConditionsMet.has(key)) {
            this.statistics.winConditionsMet.set(key, {
                name: config.name || key,
                description: config.description || '',
                condition: config.condition || (() => false),
                triggered: false,
                triggerCount: 0
            });
        }
        return this.statistics.winConditionsMet.get(key);
    }

    registerLossCondition(key, config) {
        if (!this.statistics.lossConditionsMet.has(key)) {
            this.statistics.lossConditionsMet.set(key, {
                name: config.name || key,
                description: config.description || '',
                condition: config.condition || (() => false),
                triggered: false,
                triggerCount: 0
            });
        }
        return this.statistics.lossConditionsMet.get(key);
    }

    checkWinConditions() {
        const wins = [];
        for (const [key, condition] of this.statistics.winConditionsMet) {
            if (condition.condition()) {
                condition.triggered = true;
                condition.triggerCount++;
                wins.push(key);
            }
        }
        return wins;
    }

    checkLossConditions() {
        const losses = [];
        for (const [key, condition] of this.statistics.lossConditionsMet) {
            if (condition.condition()) {
                condition.triggered = true;
                condition.triggerCount++;
                losses.push(key);
            }
        }
        return losses;
    }

    // ==================== STATISTICS ====================
    recordGameResult(won, turns, finalStats) {
        this.statistics.totalGamesPlayed++;
        
        if (won) {
            this.statistics.gamesWon++;
        } else {
            this.statistics.gamesLost++;
        }

        const gameLength = turns;
        this.statistics.averageGameLength = 
            (this.statistics.averageGameLength * (this.statistics.totalGamesPlayed - 1) + gameLength) / 
            this.statistics.totalGamesPlayed;

        this.sessionHistory.push({
            gameNumber: this.statistics.totalGamesPlayed,
            won,
            turns,
            timestamp: new Date(),
            finalStats,
            choicesMade: this.statistics.totalChoicesMade
        });
    }

    getStatistics() {
        return {
            totalGamesPlayed: this.statistics.totalGamesPlayed,
            gamesWon: this.statistics.gamesWon,
            gamesLost: this.statistics.gamesLost,
            winRate: this.statistics.totalGamesPlayed > 0 
                ? ((this.statistics.gamesWon / this.statistics.totalGamesPlayed) * 100).toFixed(1) 
                : 0,
            averageGameLength: this.statistics.averageGameLength.toFixed(1),
            totalChoicesMade: this.statistics.totalChoicesMade,
            choiceFrequency: Object.fromEntries(this.statistics.choiceFrequency),
            eventFrequency: Object.fromEntries(this.statistics.eventFrequency),
            variableRanges: Object.fromEntries(
                Array.from(this.statistics.variableRanges.entries()).map(([key, val]) => [
                    key,
                    {
                        min: val.min.toFixed(2),
                        max: val.max.toFixed(2),
                        average: val.average.toFixed(2),
                        samples: val.samples
                    }
                ])
            ),
            winConditions: Object.fromEntries(
                Array.from(this.statistics.winConditionsMet.entries()).map(([key, cond]) => [
                    key,
                    {
                        name: cond.name,
                        description: cond.description,
                        triggered: cond.triggered,
                        triggerCount: cond.triggerCount
                    }
                ])
            ),
            lossConditions: Object.fromEntries(
                Array.from(this.statistics.lossConditionsMet.entries()).map(([key, cond]) => [
                    key,
                    {
                        name: cond.name,
                        description: cond.description,
                        triggered: cond.triggered,
                        triggerCount: cond.triggerCount
                    }
                ])
            )
        };
    }

    resetStatistics() {
        this.statistics = {
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalChoicesMade: 0,
            choiceFrequency: new Map(),
            eventFrequency: new Map(),
            variableRanges: new Map(),
            averageGameLength: 0,
            winConditionsMet: new Map(),
            lossConditionsMet: new Map()
        };
        this.sessionHistory = [];
    }

    getSessionHistory() {
        return this.sessionHistory;
    }

    // ==================== DEBUG/AUDIT ====================
    getFullRegistryDump() {
        return {
            variables: Array.from(this.variables.entries()).map(([key, var_]) => ({
                key,
                ...var_,
                history: var_.history.slice(-10)
            })),
            events: Array.from(this.events.entries()).map(([key, evt]) => ({ key, ...evt })),
            effects: Array.from(this.effects.entries()).map(([key, eff]) => ({ key, ...eff })),
            choices: Array.from(this.choices.entries()).map(([key, choice]) => ({ key, ...choice })),
            systems: Array.from(this.systems.entries()).map(([key, sys]) => ({ key, ...sys })),
            statistics: this.getStatistics()
        };
    }

    validateRegistry() {
        const issues = [];

        for (const [effectKey, effect] of this.effects) {
            for (const varKey of effect.applicableVariables) {
                if (!this.variables.has(varKey)) {
                    issues.push(`Effect "${effectKey}" references non-existent variable "${varKey}"`);
                }
            }
        }

        for (const [systemKey, system] of this.systems) {
            for (const depKey of system.dependencies) {
                if (!this.systems.has(depKey)) {
                    issues.push(`System "${systemKey}" depends on non-existent system "${depKey}"`);
                }
            }
        }

        for (const [choiceKey] of this.choices) {
            if (this.statistics.choiceFrequency.get(choiceKey) === 0) {
                issues.push(`Choice "${choiceKey}" has never been used`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            summary: {
                totalVariables: this.variables.size,
                totalEvents: this.events.size,
                totalEffects: this.effects.size,
                totalChoices: this.choices.size,
                totalSystems: this.systems.size
            }
        };
    }
}

const gameRegistry = new GameRegistry();