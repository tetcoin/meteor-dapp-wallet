var peerCountIntervalId = null;

/**
Observe the latest blocks

@method observeLatestBlocks
*/
observeLatestBlocks = function(){

    // GET the latest blockchain information
    web3.eth.filter('latest').watch(function(e, res){
        if(!e) {

            console.log('Block arrived ', res);

            // UPDATE WALLETS ACCOUNTS balance
            _.each(Wallets.find().fetch(), function(wallet){
                if(wallet.address) {
                    web3.eth.getBalance(wallet.address, function(err, res){
                        if(!err) {
                            Wallets.update(wallet._id, {$set: {
                                balance: res.toString(10)
                            }});
                        }
                    });

                    // update dailylimit spent, etc
                    Meteor.setTimeout(function() {
                        updateContractData(wallet);
                    }, 1000);
                }
            });
        }
    });


    // check peer count
    Session.setDefault('peerCount', 0);
    clearInterval(peerCountIntervalId);
    peerCountIntervalId = setInterval(function() {
        web3.net.getPeerCount(function(e, res) {
            if(!e)
                Session.set('peerCount', res);
        });
    }, 1000);

    // get peercount on start
    web3.net.getPeerCount(function(e, res) {
        if(!e)
            Session.set('peerCount', res);
    });

};