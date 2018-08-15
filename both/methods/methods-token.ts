import { Users, Tokens, SubPools }  from '../collections';
import { check }  from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { UserRole } from '../models';

import TokenLoyalty from 'imports/ethereum/TokenLoyalty';
const ownerAddress = "0x2952920b5813447f86D6c30Ad1e5C0975Fe563dd";

let tokenLoyalty;

if (Meteor.isServer) {

  tokenLoyalty = new TokenLoyalty();

  tokenLoyalty.setWatch(Meteor.bindEnvironment((data) => {
    
    if(data.event === "Created" && ! Tokens.collection.findOne({ user_id: data.clientId })) {
      
      Tokens.collection.insert({
        owner_address: data.member,
        nft_id: data.tokenId,
        user_id: data.clientId,
        issued: true,
        activated: false,
        _createdBy: data.partner,
        value: 500,
        tx: data.tx,
        subPoolId: data.supPoolId,
        inprogress: false
      });

      if( ! SubPools.collection.findOne({ subPoolId: data.supPoolId }) ) {
        SubPools.collection.insert({
          subPoolId: data.supPoolId,
          inprogress: false,
          created: data.subPool.created,
          closed: data.subPool.closed,
          numberOfMembers: data.subPool.numberOfMembers,
          numberOfActivated: data.subPool.numberOfActivated,
          debitValue: data.subPool.debitValue,
          paymentAmount: data.subPool.paymentAmount,
          value: data.subPool.value
        });
      }
      else {
        SubPools.collection.update({ subPoolId: data.supPoolId },{ $set: {
          numberOfMembers: data.subPool.numberOfMembers,
          value: data.subPool.value
        }})
      }
    }
    else if(data.event === "Activated" && Tokens.collection.findOne({ nft_id: data.tokenId })) {
      Tokens.collection.update({ nft_id: data.tokenId }, { $set: { activated:true, inprogress:false } });

      if( ! SubPools.collection.findOne({ subPoolId: data.supPoolId }) ) {
        SubPools.collection.insert({
          subPoolId: data.supPoolId,
          inprogress: false,
          created: data.subPool.created,
          closed: data.subPool.closed,
          numberOfMembers: data.subPool.numberOfMembers,
          numberOfActivated: data.subPool.numberOfActivated,
          debitValue: data.subPool.debitValue,
          paymentAmount: data.subPool.paymentAmount,
          value: data.subPool.value
        });
      }
      else {
        SubPools.collection.update({ subPoolId: data.supPoolId },{ $set: {
          numberOfActivated: data.subPool.numberOfActivated
        }})
      }
    }
    else {
      console.error(`methods-token: Can't process event ${data.event} `);
    }
  }));
}

Meteor.methods({

  createToken: function (clientId:string) {
    check(clientId, String);

    const user = Users.collection.findOne(this.userId);
    const role = user && user.profile && user.profile.role;

    if (role !== UserRole.PARTNER)
      throw new Meteor.Error('405', 'Not authorized!');
 
    const token = Tokens.collection.findOne({ user_id: clientId });

    if (token)
      throw new Meteor.Error('404', 'Token already created!');

    const client = Users.collection.findOne(clientId);

    if (! client) 
      throw new Meteor.Error('404', 'No such user!');
  
    if (! client.profile || client.profile.role != UserRole.CLIENT)
      throw new Meteor.Error('400', 'That user is not client...');
  
    if (! client.profile || client.profile._createdBy != this.userId)
      throw new Meteor.Error('403', 'No permissions!');

    if (Meteor.isServer) {
      tokenLoyalty.setData({member:ownerAddress, clientId:clientId, partner:this.userId}, (result) => {
        console.log(`methods-token: createToken TX: ${result.tx}`);
      }); 
    }
  },

  activateToken: function (tokenId:string) {
    check(tokenId, String);

    const user = Users.collection.findOne(this.userId);
    const role = user && user.profile && user.profile.role;

    if (role !== UserRole.PARTNER)
      throw new Meteor.Error('405', 'Not authorized!');
 
    const token = Tokens.collection.findOne({ nft_id: tokenId });

    if (!token)
      throw new Meteor.Error('404', 'Token does not created!');

    if (Meteor.isServer) {
      tokenLoyalty.activate({tokenId:tokenId}, (result) => {
        console.log(`methods-token: activateToken TX: ${result.tx}`);
      }); 
    }
  },

  changeToken: function (tokenId:string) {
    check(tokenId, String);

    const user = Users.collection.findOne(this.userId);
    const role = user && user.profile && user.profile.role;

    if (role !== UserRole.PARTNER)
      throw new Meteor.Error('405', 'Not authorized!');
 
    const token = Tokens.collection.findOne({ nft_id: tokenId });

    if (!token)
      throw new Meteor.Error('404', 'Token does not created!');
    
    Tokens.collection.update({ nft_id: tokenId }, { $set: { inprogress:true } });
    
  }
  
});