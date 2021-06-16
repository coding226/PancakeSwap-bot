const Store = require('electron-store')

class TradeStore extends Store {
    constructor (settings) {
        super(settings)

        this.trades = this.get('trades') || []
    }

    saveTrades() {
        this.set('trades', this.trades)

        return this
    }

    getTrades() {
        this.trades = this.get('trades') || []

        return this
    }

    addTrade (trade) {
        this.trades = [ ...this.trades, trade ]

        return this.saveTrades()
    }

    deleteTrade (trade) {
        this.trades = this.trades.filter(t => t !== trades)

        return this.saveTrades()
    }

}

module.exports = TradeStore