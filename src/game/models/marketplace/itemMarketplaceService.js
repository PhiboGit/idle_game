const mongoose = require('mongoose');
const ItemMarketplace = require("./itemMarketplace");
const ItemOrder = require("./itemOrder");
const Character = require("./../character");

const {senderMediator} = require("./../../../routes/websocket/mediator");
const Item = require('../item');


async function cancelOrder(characterName, orderId){
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await ItemOrder.findOneAndUpdate(
      {_id: orderId, sellerCharacter: characterName, status: 'active'},
      {$set : {status: 'canceled'}}, {session: session}).populate('item');
    if(!order){
      throw new Error("Character does not own the order!");
    }
    const item = order.item
    const itemMarketplace = await ItemMarketplace.findOneAndUpdate(
      {itemName: item.name},
      {$pull: {orderBook: order._id}},
      {session: session})
    if(!itemMarketplace){
      throw new Error("Order not on marketplace!");
    }
    await session.commitTransaction();
    session.endSession();
    
    
    const leanOrder = await ItemOrder.findById(orderId).lean();
    senderMediator.publish('item_order', {character: characterName, msg: {order: leanOrder}})
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("Cancelling order failed! does not own order or is an active order!")
    senderMediator.publish('error', {character: characterName,
      msg: {message: "Cancelling order failed! does not own order or is an active order!",
            info: {
             orderId: orderId
           }}})
  }
}

async function collectOrder(characterName, orderId) {
  const order = await ItemOrder.findOne(
    { _id: orderId },
    { session } 
    );
  if (!order) {
    console.log("Order not found");
    return
  }
  const item = await Item.findOne(
    { _id: order.item },
    { session } 
    ).lean();
  if (!item) {
    console.log("Item not found");
    return
  }
  if(!(order.sellerCharacter == characterName || order.buyerCharacter == characterName)){
    console.log("This is not your Order!!");
    return
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let charUpdate
    // seller can collected the item if he canceled the order!
    if(order.sellerCharacter == characterName && order.status == 'canceled' && !order.itemCollected){
      charUpdate = { $push: { items: order.item}}
      const char = await Character.findOneAndUpdate(
        { characterName: characterName },
        charUpdate,
        { session }
      );
      const orderUpdated = await ItemOrder.findOneAndUpdate( {_id: order._id}, { $set: {itemCollected: true}})
      if (!char || orderUpdated) {
        // Character not found
        throw new Error("Character not found");
      }
    }

    // seller can collect the gold if the order is complete
    if(order.sellerCharacter == characterName && order.status == 'complete' && !order.goldCollected){
      charUpdate = { $inc: { ['currency.gold']: order.price}}
      const char = await Character.findOneAndUpdate(
        { characterName: characterName },
        charUpdate,
        { session }
      );
      const orderUpdated = await ItemOrder.findOneAndUpdate( {_id: order._id}, { $set: {goldCollected: true}})
      if (!char || orderUpdated) {
        // Character not found
        throw new Error("Character not found");
      }
    }

    // buyer can collect the item if the order is complete
    if(order.buyerCharacter == characterName && order.status == 'complete' && !order.itemCollected){
      charUpdate = { $push: { items: order.item}}
      const char = await Character.findOneAndUpdate(
        { characterName: characterName },
        charUpdate,
        { session }
      );
      const orderUpdated = await ItemOrder.findOneAndUpdate( {_id: order._id}, { $set: {itemCollected: true}})
      if (!char || orderUpdated) {
        // Character not found
        throw new Error("Character not found");
      }
    }
    
    
    // If everything is successful, commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    const leanOrder = await ItemOrder.findOne( {_id: order._id}).lean()
    // only send the item info, if collected it
    if((order.sellerCharacter == characterName && order.status == 'complete' && !order.goldCollected) ||
      (order.buyerCharacter == characterName && order.status == 'complete' && !order.itemCollected)){
      senderMediator.publish('items', {character: characterName, msg: {items: [item]} })
    }
    senderMediator.publish('order', {character: characterName, msg: {order: leanOrder}})
    senderMediator.publish('update_char', {character: characterName, msg: charUpdate})
  } catch (error) {
    // If there's an error, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.error("collectOrder: Transaction aborted:", error.message);

    senderMediator.publish('error', {character: characterName,
      msg: {message: "Collect order failed!",
            info: {
             
           }}})
  }
}

async function sellOrder(characterName, itemId, price, days) {
  console.log("posting order: ...");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const char = await Character.findOne({characterName: characterName, items: itemId})
    if(!char){
      throw new Error("character does not own item!")
    }

    // Create a new order instance
    const orderCreate = await ItemOrder.create([{
      sellerCharacter: characterName,
      item: itemId,
      price,
      expireDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      status: 'init'
    }], {session: session, new: true});

    // Check if the order was created successfully
    if (!orderCreate || orderCreate.length == 0) {
      console.log("Error: Order creation failed.");
      throw new Error("Order creation failed.");
    }
    const order = orderCreate[0]
    console.log("posting order: order created!", order);
    

    const charUpdate = { $pull: { items: itemId } }

    // Update the character with the newly created Order's document id
    const character = await Character.findOneAndUpdate(
      { characterName },
      charUpdate,
      { session: session}); 
    if (!character) {
      // Character not found or doesn't have enough resources or gold
      throw new Error("Character not found or doesn't have enough resources or gold");
    }
    console.log("posting order: character updated");
    // If everything is successful, commit the transaction
    console.log("Order posted successfully and character updated! Transaction successful!");
    await session.commitTransaction();
    session.endSession();
    // Fetch the updated order as a lean object
    const leanOrder = await ItemOrder.findById(order._id).lean();
    senderMediator.publish('order', {character: characterName, msg: {order: leanOrder}})
    senderMediator.publish('update_char', {character: characterName, msg: charUpdate})
  } catch (error) {
    // on error abbort the transaction
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction aborted");
    console.error("Error posting order:", error.message);
    senderMediator.publish('error', {character: characterName,
      msg: {message: "Post order failed!",
            info: {
             
           }}})
  }
}

async function buyOrder(characterName, orderId){
  console.log("buying order: ...");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ItemOrder.findOne({_id: orderId}).lean()
    if(!order){
      throw new Error('order does not exist')
    }
    
    const charUpdate = {$inc: { ["currency.gold"]: -price }, $push: {items: order.item}}
    const char = Character.findOneAndUpdate(
      {characterName: characterName, ["currency.gold"]: { $gte: price}},
      charUpdate,
      {session: session}
      )

    const orderUpdated = await ItemOrder.findOneAndUpdate({_id: orderId}, {$set: {status: 'complete', buyerCharacter: characterName}})

    await session.commitTransaction();
    session.endSession();
    // Fetch the updated order as a lean object
    const leanOrder = await ItemOrder.findById(order._id).lean();
    senderMediator.publish('order', {character: leanOrder.buyerCharacter, msg: {order: leanOrder}})
    senderMediator.publish('order', {character: leanOrder.sellerCharacter, msg: {order: leanOrder}})
    if(!char || !orderUpdated){
      throw new Error("Failed to update order")
    }

  } catch (error) {
    // on error abbort the transaction
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction aborted");
    console.error("Error buy order:", error.message);
    senderMediator.publish('error', {character: characterName,
      msg: {message: "Buy order failed!",
            info: {
             
           }}})
  }
}

module.exports = {sellOrder, buyOrder, cancelOrder, collectOrder}
