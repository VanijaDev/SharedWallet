const MyWallet = artifacts.require('./MyWallet.sol');
const Asserts = require('./helpers/asserts');

contract('MyWallet', (accounts) => {
    const OWNER = accounts[0];
    const ACC_1 = accounts[1];
    const ACC_2 = accounts[2];
    const InitialBalance = web3.toWei(1, 'ether');

    let wallet;

    afterEach('reset state', () => {
        return MyWallet.new({value: InitialBalance})
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
                .then(bal => assert.equal(bal.toNumber(), InitialBalance, 'initial balance must be ' + InitialBalance));
        });
    });

    describe('spend money', () => {
      let spendAmount = web3.toWei(0.5, 'ether');

        it('should spend if owner and create proposal if another account', () => {
            return Promise.resolve()
                .then(() => wallet.spendMoneyOn.call(ACC_1, spendAmount, "Send to Acc 1"))
                .then(proposalId => {
                    assert.equal(proposalId.toNumber(), 0, "sent from owner, should be 0");
                })
                .then(() => wallet.spendMoneyOn.call(ACC_2, spendAmount, "Send to Acc 2", {from: ACC_1}))
                .then(proposalId => {
                    assert.equal(proposalId.toNumber(), 1, "sent from ACC_1, should be 1");
                });
        });

        it('should confirm proposal', () => {
            let proposalID;
            let prevBalance;

            return Promise.resolve()
              //  1. create proposal
                .then(() => wallet.spendMoneyOn(ACC_2, spendAmount, "Send to Acc 2", {from: ACC_1}))
                .then(tx => {
                  assert.equal(tx.logs.length, 1, 'single event shuold be emitted on spendMoneyOn');
                  
                  let log = tx.logs[0];
                  assert.equal(log.event, 'LogProposalReceived');
                  proposalID = log.args._id.toNumber();
                })
              //  2. get previous balance
                .then(() => web3.eth.getBalance(ACC_2))
                .then(bal => {
                  console.log('prev: ' + bal.toNumber());
                  prevBalance = bal.toNumber();
                })
              //  3. confirm proposal
              // 3.1 - use .call() to simulate transaction. I get true, so everything is OK.
                .then(() => wallet.confirmProposal.call(proposalID))
                .then(res => assert.isTrue(res))
              //  3.2 - send real transaction. There is no successfull event... How can it be? True if I simulate and no event here.
              .then(() => wallet.confirmProposal(proposalID))
              .then(tx => {
                assert.equal(tx.logs.length, 1, 'single event shuold be emitted on confirmProposal');
                assert.equal(tx.logs[0].event, 'LogProposalConfirmed', 'wrong event name');
              })
              //  4. verify balance
               .then(() => web3.eth.getBalance(ACC_2))
               .then(bal => {
                 console.log('new: ' + bal.toNumber());
                 assert.isTrue(bal.toNumber() - prevBalance == spendAmount, 'wrong new balance');
               })
                
        });

    });
});

