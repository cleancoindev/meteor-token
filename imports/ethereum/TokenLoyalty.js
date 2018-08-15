import Web3             from 'web3';
import contract         from 'truffle-contract';
import HDWalletProvider from 'truffle-hdwallet-provider';

import TokenLoyaltyArtifact from './build/contracts/TokenLoyalty.json';
import { moment } from 'meteor/momentjs:moment';

const mnemonic = "first mix any adult deal sand brand about window will casual second";
const rinkeby = "https://rinkeby.infura.io/fyE6fpwJWFc6fBYSet1w";
const localhost = "http://localhost:8545";

export default class TokenLoyalty {

  constructor() {

    this.instance = undefined;
    this.data = undefined;    
    this.web3Provider = new HDWalletProvider(mnemonic, rinkeby);
    this.address = this.web3Provider.addresses[0];
    console.log(`Set provider with address: ${this.address}`);
    
    this.web3 = new Web3(this.web3Provider);

    this.contract = contract(TokenLoyaltyArtifact);
    this.contract.setProvider(this.web3.currentProvider);
    this.watch = undefined;
    this.partner = undefined;

    const that = this;

    this.contract.deployed()
    .then(function(instance) {
      console.log('TokenLoyalty: instance is ready');
      that._setInstance(instance);
      that._refreshData();

      instance.Created()
      .watch((err, responce) => {
        if(err) {
          console.error(err)
        }
        else {
          console.log(`Loyalty Token TX: ${responce.transactionHash}`);
          console.log(`Loyalty Token ID ${responce.args.tokenId.toString()} is created. Sub Pool ID ${responce.args.supPoolId.toString()}. Address ${responce.args.member}. Client ID ${responce.args.clientId}`);
          
          that.getSubPoolInfo(responce.args.supPoolId.toString(), (result) => {
            const timestamp = moment.unix(result[0].toString()).format("MMMM Do YYYY, h:mm:ss a");
            const closure = moment.unix(result[1].toString()).format("MMMM Do YYYY, h:mm:ss a");
            const subPool = {
              created:timestamp,
              closed:closure,
              numberOfMembers:result[2].toString(),
              numberOfActivated:result[3].toString(),
              debitValue:result[4].toString(),
              paymentAmount:result[5].toString(),
              value:result[6].toString()
            };
            that._setData({ event:responce.event, partner:that.partner, tx:responce.transactionHash, tokenId:responce.args.tokenId.toString(), supPoolId:responce.args.supPoolId.toString(), member:responce.args.member, clientId:responce.args.clientId, subPool:subPool });
          });
        }
      });

      instance.Activated()
      .watch((err, responce) => {
        if(err) {
          console.error(err)
        }
        else {
          console.log(`Loyalty Token TX: ${responce.transactionHash}`);
          console.log(`Loyalty Token ID ${responce.args.tokenId.toString()} is activated. Sub Pool ID ${responce.args.subPoolId.toString()}`);

          that.getSubPoolInfo(responce.args.subPoolId.toString(), (result) => {
            const timestamp = moment.unix(result[0].toString()).format("MMMM Do YYYY, h:mm:ss a");
            const closure = moment.unix(result[1].toString()).format("MMMM Do YYYY, h:mm:ss a");
            const subPool = {
              created:timestamp,
              closed:closure,
              numberOfMembers:result[2].toString(),
              numberOfActivated:result[3].toString(),
              debitValue:result[4].toString(),
              paymentAmount:result[5].toString(),
              value:result[6].toString()
            };
            that._setData({ event:responce.event ,tx:responce.transactionHash, tokenId:responce.args.tokenId.toString(), supPoolId:responce.args.subPoolId.toString(), subPool:subPool});
          });
        }
      });
    });
  }

  getData() {
    return this.data;
  }

  setWatch(cb) {
    this.watch = cb;
  }

  resetWatch() {
    this.watch = undefined;
  }

  _setData(data) {
    if(this.data !== data) {
      this.data = data;

      if(this.watch !== undefined) {
        this.watch(data);
      }

    }
  }

  _getInstance() {
    return this.instance;
  }

  _setInstance(instance) {
    if(this.instance !== instance) {
      this.instance = instance;
    }
  }

  _refreshData() {
    return;
  }

  setData(data, cb) {

    const that = this;

    console.log(`TokenLoyalty:setData data.member:${data.member} data.clientId:${data.clientId} from:${that.address} partner:${data.partner}`);
    this.partner = data.partner;

    if(this.instance === undefined) {

      this.contract.deployed()
      .then(function(instance) {

        console.error("1-1");

        instance.create(data.member, data.clientId, {from: that.address, gas:500000, gasPrice:"20000000000"})
        .then(result => cb(result))
        .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
    }
    else {
      console.error("1-2");

      this.instance.create(data.member, data.clientId, {from: that.address, gas:500000, gasPrice:"20000000000"})
        .then(result => cb(result))
        .catch(error => console.error(error));
    }
  }

  activate(data, cb) {

    const that = this;
    console.log(`TokenLoyalty:activate data.tokenId:${data.tokenId}`);
    if(this.instance === undefined) {

      this.contract.deployed()
      .then(function(instance) {

        console.error("2-1");

        instance.activate(data.tokenId, {from: that.address, gas:500000, gasPrice:"20000000000"})
        .then(result => cb(result))
        .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
    }
    else {
      console.error("2-2");

      this.instance.activate(data.tokenId, {from: that.address, gas:500000, gasPrice:"20000000000"})
        .then(result => cb(result))
        .catch(error => console.error(error));
    }
  }

  getSubPoolInfo(subPoolId, cb) {

    const that = this;
    console.log(`TokenLoyalty:getSubPoolInfo data.subPoolId:${subPoolId}`);
    if(this.instance === undefined) {

      this.contract.deployed()
      .then(function(instance) {

        console.error("3-1");

        instance.getSubPoolExtension.call(subPoolId)
        .then(result => cb(result))
        .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
    }
    else {
      console.error("3-2");

      this.instance.getSubPoolExtension.call(subPoolId)
        .then(result => cb(result))
        .catch(error => console.error(error));
    }
  }

};
