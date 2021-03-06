/**
Template Controllers

@module Templates
*/

var a=[];
for(i=0; i<50000; i++){

    // a.push(web3.sha3((i).toString()));

    var word = "";
    // for (n=0; n<5; n++) {
    var word = (0000000000000000+i).toString(16);
    // }
    a.push(word);
}

console.log(a[3]);

Template['views_account'].rendered = function() {

    TemplateVar.set("someArray", a);
    
    
/*
    // Run this code on the console to detect collisions

    var arr = document.getElementsByClassName("dapp-identicon");
    var arrCheck = {};

    var l =0, t = 0, c=0;

    for (i=0;i<arr.length;i++) {
        arrCheck[arr[i].style.backgroundImage.toString()] =  arrCheck[arr[i].style.backgroundImage.toString()]+1 || 1;
    }

    var c = 0, t = 0;
    _.each(arrCheck, function(e, i) { 
       t++;
       if (e > 1) {
          c++;
          console.log(i);
       }
    })

    console.log("found " + c + " out of " + t + " totalling " + 100*c/t + "%");



*/
}
   

Template['views_account'].helpers({
    /**
    Get the current selected account

    @method (account)
    */
    'account': function() {
          return Helpers.getAccountByAddress(FlowRouter.getParam('address'));
    },
    /**
    Get the pending confirmations of this account.

    @method (pendingConfirmations)
    */
    'pendingConfirmations': function(){
        return _.pluck(PendingConfirmations.find({operation: {$exists: true}, confirmedOwners: {$ne: []}, from: this.address}).fetch(), '_id');
    },
    /**
    Return the daily limit available today.

    @method (availableToday)
    */
    'availableToday': function() {
        return new BigNumber(this.dailyLimit || '0', 10).minus(new BigNumber(this.dailyLimitSpent || '0', '10')).toString(10);  
    },
    /**
    Show dailyLimit section

    @method (showDailyLimit)
    */
    'showDailyLimit': function(){
        return (this.dailyLimit && this.dailyLimit !== ethereumConfig.dailyLimitDefault);
    },
    /**
    Show requiredSignatures section

    @method (showRequiredSignatures)
    */
    'showRequiredSignatures': function(){
        return (this.requiredSignatures && this.requiredSignatures > 1);
    },
    /**
    Link the owner either to send or to the account itself.

    @method (ownerLink)
    */
    'ownerLink': function(){
        var owner = String(this);
        if(Helpers.getAccountByAddress(owner))
            return FlowRouter.path('account', {address: owner});
        else
            return FlowRouter.path('sendTo', {address: owner});
    }
});

Template['views_account'].events({
    /**
    Clicking the delete button will show delete modal

    @event click button.delete
    */
    'click button.delete': function(e, template){
        var data = this;

        EthElements.Modal.question({
            text: new Spacebars.SafeString(TAPi18n.__('wallet.accounts.modal.deleteText') + 
                '<br><input type="text" class="deletionConfirmation" autofocus="true">'),
            ok: function(){
                if(data.name === $('input.deletionConfirmation').val()) {
                    Wallets.remove(data._id);
                    FlowRouter.go('dashboard');
                    return true;
                }
            },
            cancel: true
        });
    },
    /**
    Clicking the name, will make it editable

    @event click .edit-name
    */
    'click .edit-name': function(e){
        // make it editable
        $(e.currentTarget).attr('contenteditable','true');
    },
    /**
    Prevent enter

    @event keypress .edit-name
    */
    'keypress .edit-name': function(e){
        if(e.keyCode === 13)
            e.preventDefault();
    },
    /**
    Bluring the name, will save it

    @event blur .edit-name, keyup .edit-name
    */
    'blur .edit-name, keyup .edit-name': function(e){
        if(!e.keyCode || e.keyCode === 13) {
            var $el = $(e.currentTarget);
            var text = $el.text();


            if(_.isEmpty(text)) {
                text = TAPi18n.__('wallet.accounts.defaultName');
            }

            // Save new name
            Wallets.update(this._id, {$set: {
                name: text
            }});
            EthAccounts.update(this._id, {$set: {
                name: text
            }});

            Tracker.afterFlush(function(argument) {
                $el.text(text);
            });

            // make it non-editable
            $el.attr('contenteditable', null);
        }
    },
    /**
    Click to copy the code to the clipboard
    
    @event click a.create.account
    */
    'click .copy-to-clipboard-button': function(e){
        e.preventDefault();
        
        var copyTextarea = document.querySelector('.copyable-address span');
        
        var selection = window.getSelection();            
        var range = document.createRange();
        range.selectNodeContents(copyTextarea);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        selection.removeAllRanges();
        
        GlobalNotification.info({
           content: 'i18n:wallet.accounts.addressCopiedToClipboard',
           duration: 2
        });
        
    },
    /**
    Click to reveal QR Code
    
    @event click a.create.account
    */
    'click .qrcode-button': function(e){
        e.preventDefault();
        
        // Open a modal showing the QR Code
        EthElements.Modal.show('views_modals_qrCode');

        
    }
});
