/**
Template Controllers

@module Templates
*/

/**
The dashboard template

@class [template] views_dashboard
@constructor
*/


Template['views_dashboard'].helpers({
    /**
    Get all current wallets

    @method (wallets)
    */
    'wallets': function(){
        var wallets = Wallets.find({}, {sort: {disabled: 1, creationBlock: 1}}).fetch();

        // sort wallets by balance
        wallets.sort(function(a, b) {
          return new BigNumber(b.balance, 10).gt(new BigNumber(a.balance, 10));
        });

        return wallets;
    },
    /**
    Get all current accounts

    @method (accounts)
    */
    'accounts': function(){
        // balance need to be present, to show only full inserted accounts (not ones added by mist.requestAccount)
        var accounts = EthAccounts.find({name: {$exists: true}}, {sort: {name: 1}}).fetch();

        accounts.sort(function(a, b) {
          return new BigNumber(b.balance, 10).gt(new BigNumber(a.balance, 10));
        });

        return accounts;
    },
    /** 
    Are there any accounts?

    @method (hasAccounts)
    */
    'hasAccounts' : function() {
        return (EthAccounts.find().count() > 0 )
    },

    /**
    Get all transactions

    @method (allTransactions)
    */
    'allTransactions': function(){
        return Transactions.find({}, {sort: {timestamp: -1}}).count();
    },
    /**
    Returns an array of pending confirmations, from all accounts
    
    @method (pendingConfirmations)
    @return {Array}
    */
    'pendingConfirmations': function(){
        return _.pluck(PendingConfirmations.find({operation: {$exists: true}, confirmedOwners: {$ne: []}}).fetch(), '_id');
    }
});


Template['views_dashboard'].events({
    /**
    Request to create an account in mist
    
    @event click a.create.account
    */
    'click a.create.account': function(e){
        e.preventDefault();

        mist.requestAccount(function(e, account) {
            if(!e) {
                EthAccounts.upsert({address: account}, {$set: {
                    address: account,
                    new: true
                }});
            }
        });
    },
});