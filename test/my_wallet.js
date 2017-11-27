const MyWallet = artifacts.require('./MyWallet.sol');
const Asserts = require('./helpers/asserts');

contract('MyWallet', (accounts) => {
    const OWNER = accounts[0];
    const ACC_1 = accounts[1];
    const ACC_2 = accounts[2];

    let wallet;

    afterEach('reset state', () => {
        return MyWallet.new({value: 10})
            .then(inst => wallet = inst);
    });

    before('setup', () => {
        return MyWallet.deployed()
            .then(inst => wallet = inst);
    });

    describe('initial values', () => {
        it('balance', () => {
            return Promise.resolve()
                .then(() => web3.eth.getBalance(wallet.address))
                .then(bal => assert.equal(bal.toNumber(), 10, 'initial balance must be 10'));
        });
    });

    describe('spend money', () => {
        it('should spend if owner and create proposal if another account', () => {
            return Promise.resolve()
                .then(() => wallet.spendMoneyOn.call(ACC_1, 5, "Send to Acc 1"))
                .then(proposalId => {
                    assert.equal(proposalId.toNumber(), 0, "sent from owner, should be 0");
                })
                .then(() => wallet.spendMoneyOn.call(ACC_2, 5, "Send to Acc 2", {from: ACC_1}))
                .then(proposalId => {
                    assert.equal(proposalId.toNumber(), 1, "sent from ACC_1, should be 1");
                });
        });

        it('should confirm proposal', () => {
            let proposalID;
            return Promise.resolve()
            //  1
                // .then(() => wallet.spendMoneyOn(ACC_2, 5, "Send to Acc 2", {from: ACC_1}))
                // .then(tx => {
                //     console.log("name: " + tx.logs[0].event)
                //     console.log("from: " + tx.logs[0].args._from)
                //     console.log("tp: " + tx.logs[0].args._to)
                // })
                // .then(() => wallet.confirmProposal(1))
                // .then(tx => {
                //     console.log("")
                //     console.log("id: " + tx.logs[0].args._proposalId)
                //     console.log("Log count: " + tx.logs.length)
                    
                //     // console.log("id: " + tx.logs[0].args._proposalId)
                //     // console.log("name: " + tx.logs[0].event)
                //     // console.log("from: " + tx.logs[0].args._from)
                //     // console.log("to: " + tx.logs[0].args._to)
                // })


            //  2
                // .then(() => wallet.spendMoneyOn.call(ACC_2, 5, "Send to Acc 2", {from: ACC_1}))
                // .then(id => {
                //     assert.equal(id.toNumber(), 1, "sent from ACC_1, should be 1");
                //     proposalID = id;
                // })
                // .then(() => wallet.confirmProposal.call(proposalID))
                // .then(res => assert.isTrue(res))

            //  3
                .then(() => wallet.spendMoneyOn.call(ACC_2, 5, "Send to Acc 2", {from: ACC_1}))
                .then(id => {
                    assert.equal(id.toNumber(), 1, "sent from ACC_1, should be 1");
                    proposalID = id;
                })
                .then(() => web3.eth.getBalance(ACC_2))
                .then(bal => prevBalance = bal.toNumber())
                .then(() => wallet.confirmProposal(proposalID))
                .then(() => web3.eth.getBalance(ACC_2))
                .then(bal => assert.isAbove(bal.toNumber(), prevBalance, "balance should be increased."))
        });

    });
});

