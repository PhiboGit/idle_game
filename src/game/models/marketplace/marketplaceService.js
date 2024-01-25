const {senderMediator} = require("./../../../routes/websocket/mediator")

const Marketplace = require("./marketplace");
const Order = require("./order");
const Character = require("./../character");

async function cancelOrder(character, orderId){
  const order = await Order.findOneAndUpdate({_id: orderId, character: character}, {status: 'canceled'});
  if(!order){
    console.log("Cancelling order failed! does not own order.")
  }
  updateMarketplace(order.resource)
}

async function postOrder(characterName, orderType, resource, price, units, days) {
  try {
    // Create a new order instance
    const order = new Order({
      orderType,
      character: characterName,
      resource,
      price,
      units,
      unitsInit: units,
      expireDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      status: 'init'
    });
    // Save the order document
    await order.save();
    
    
    // Check if the character has enough resources or gold
    const conditionPayment = () => {
      if(orderType === 'sellOrders') return { [`resources.${resource}`]: { $gte: units } } 
      if(orderType === 'buyOrders') return { ["currency.gold"]: { $gte: price * units } };
    }
    
    // decrement the value of resources or gold
    const updatePayment = () => {
      if(orderType === 'sellOrder') return { $inc: { [`resources.${resource}`]: -units } } 
      if(orderType === 'buyOrder') return { $inc: { ["currency.gold"]: -price * units } } ;
    }

    // Update the character with the newly created Order's document id
    const character = await Character.findOneAndUpdate(
      { characterName, ...conditionPayment() },
      { $push: { orders: order._id }, ...updatePayment() },
      { new: true }); // To get the updated document

    if (!character) {
      // Character not found or doesn't have enough resources or gold
      await Order.deleteOne({_id: order._id})
      throw new Error("Character not found or doesn't have enough resources or gold");
    }
    console.log("Order posted successfully:", order);
    
    // update the marketplace with the new Order
    await processOrder(order._id)
  } catch (error) {
    console.error("Error posting order:", error.message);
  }
}

async function processOrder(orderId){
  console.log("processOrder: ...");
  const order = await Order.findById(orderId);
  const orderType = order.orderType

  // Find or create the Marketplace document for the specified resource
  const marketplace = await Marketplace.findOne(
    { resource: order.resource },
  )
  if(!marketplace){
    addOrderToMarketplace(orderId)
    return
  }

  
  let unitsProcessed = 0
  // if we have a sellOrder, this gold is earned by selling on the marketplace immediately
  let goldEarned = 0
  // if we have a buyOrder, the gold is payed with the post of the order.
  // if there is currently a better deal on the market, you get payback on the price difference
  let goldPayback = 0

  const oppositeOrderBook = (orderType === 'sellOrder') ? marketplace.orderBookBuying : marketplace.orderBookSelling


  // process the the opositeOrderBook
  for (let i = 0; i < oppositeOrderBook.length; i++) {
    console.log("processOrder: checking price tier ", oppositeOrderBook[i].price);
    // you do not sell to order with lower price
    // you do not buy from roder with higher price
    if ((orderType === 'sellOrder' && order.price > oppositeOrderBook[i].price) || 
      (orderType === 'buyOrder' && order.price < oppositeOrderBook[i].price)) {
      console.log("processOrder: no orders in orderBook left to carry out!");
      break
    }
    const oppositeOrders = oppositeOrderBook[i].orders
    for (let j = 0; j < oppositeOrders.length; j++){
      // break, when the order is completed
      if (order.units - unitsProcessed === 0){
        console.log("processOrder: order completed!", unitsProcessed, order);
        break
      }

      // this is a oppositeOrder in the marketplace orderbook.
      const oppositeOrderMarketplace = oppositeOrders[j]

      const oppositeOrder = await Order.findById(oppositeOrderMarketplace.id)
      console.log("processOrder: oppositeOrder ", oppositeOrder);

      // this should normally not be in ther oderBook, since all units are already sold!
      if(oppositeOrder.units <= 0) {
        continue
      }
      
      // can only process as many items as there are left in the oppositeOrder,
      // or how many are still needed for the order
      const unitsToProcess = Math.min(order.units - unitsProcessed, oppositeOrder.units)
      
      // the opposite order always sets the price! These are the orders in the marketplace.
      // That way you always get the best deal from the market.
      const gold = unitsToProcess * oppositeOrder.price
      // Update the oppositeOrder document
      const oppositeOrderType = orderType === 'sellOrder' ? 'buyOrder' : 'sellOrder'
      const updateOppositeOrder = () => {
        // the oppositeOrder is still active if not all units were grapped
        const newStatus = unitsToProcess < oppositeOrder.units ? 'active' : 'complete'
        // the buyOrder can now collect the units we sold to it
        if (oppositeOrderType === 'buyOrder') return {
          $inc: {units: -unitsToProcess, unitsToCollect: unitsToProcess },
          $set: {status: newStatus}
        }
        // the sellOrder can now collect the gold
        if (oppositeOrderType === 'sellOrder') {
          return {
            $inc: {units: -unitsToProcess, goldToCollect: gold },
            $set: {status: newStatus}
          }
        }
      }
      const updatedOppositeOrder = await Order.findOneAndUpdate( 
        {_id: oppositeOrder.id, units: {$gte : unitsToProcess} },
        updateOppositeOrder(),
        {new: true}
      )
      
      // the oppositeOrder was carried out successfully
      if (updatedOppositeOrder){
        console.log("processOrder: oppositeOrder updated!", updatedOppositeOrder);
        // Update the order we still want to carry out
        unitsProcessed += unitsToProcess
        // for a sellOrder you earn gold
        goldEarned += gold
        // the gold that was aldeady payed for the post minus the gold we now payed on the market
      // we might have found a better deal now
      goldPayback += (unitsToProcess * order.price) - gold
      } else {
        console.log("processOrder: order updated FAILED!");
      }

    }
  }

  // an early break left the sellOrder with units left to be sold
  // If sellOrder is not completed, update the sellOrder document
  // and add the sellOrder to the marketplace
  const newStatus = unitsProcessed < order.units ? 'active' : 'complete'
  
  const newOrderUpdate = () => {
    if (orderType === 'buyOrder') return { 
      $inc: {
        unitsToCollect: unitsProcessed,
        goldToCollect: goldPayback,
        units: -unitsProcessed,
      },
      $set: {
        status: newStatus
      }
    }
    // the sellOrder can now collect the gold
    if (orderType === 'sellOrder') return { 
      $inc: {
        goldToCollect: goldEarned,
        units: -unitsProcessed,
      },
      $set: {
        status: newStatus
      }
    }
  } 
  const newOrder = await Order.findByIdAndUpdate(
    orderId, 
    newOrderUpdate(),
    {new: true}
  )

  if (newStatus == 'active') {
    console.log("processSellOrder: sellOrder not completed. Add to market!", newOrder);
    await addOrderToMarketplace(newOrder._id)
  } else {
    console.log("processSellOrder: sellOrder completed. Not added to market.", newOrder);
  }
  console.log("processSellOrder: completed!");
  await updateMarketplace(newOrder.resource)
} 

async function addOrderToMarketplace(orderId) {
  try {

    const order = await Order.findById(orderId);
    const orderType = order.orderType
    // Find or create the Marketplace document for the specified resource
    const marketplace = await Marketplace.findOneAndUpdate(
      { resource: order.resource },
      { $setOnInsert: { resource: order.resource } },
      { upsert: true, new: true }
    );

    const orderBook = (orderType === 'sellOrder') ? marketplace.orderBookSelling : marketplace.orderBookBuying
    // Find the corresponding price tier or create a new one if not exists
    const priceTierIndex = orderBook.findIndex(
      (tier) => tier.price === order.price
    );

    // create a new price tier
    if (priceTierIndex === -1) {
      orderBook.push({
        price: order.price,
        totalUnits: order.units,
        orders: [{ id: order._id, units: order.units }],
      });
    } else {
      // Update existing price tier
      orderBook[priceTierIndex].totalUnits += order.units;
      orderBook[priceTierIndex].orders.push({
        id: order._id,
        units: order.units,
      })
    }

    // Sort the order book by lowest price first for sellOrders, highest for buyOrders
    orderBook.sort((a, b) => (orderType === 'sellOrder' ? a.price - b.price : b.price - a.price))

    // Save the updated marketplace document
    await marketplace.save()

    console.log("Order added to the Marketplace:", marketplace)
  } catch (error) {
    console.error("Error adding Order to Marketplace:", error.message)
  }
}


async function updateMarketplace(resource) {
  console.log("Updating Marketplace ...");
  const marketplace = await Marketplace.findOne({ resource: resource });
  if (!marketplace) {
    console.log("Updating Marketplace: marketplace not found!");
    return;
  }

  for (let priceTier of marketplace.orderBookSelling) {
    priceTier.totalUnits = 0;

    const newSellOrders = [];

    for (let sellOrder of priceTier.orders) {
      const foundSellOrder = await Order.findById(sellOrder.id);

      if (foundSellOrder && foundSellOrder.status === 'active' && foundSellOrder.units > 0) {
        console.log("Updating Marketplace: sellOrder is still active. units: ", foundSellOrder.units);
        priceTier.totalUnits += foundSellOrder.units;
        newSellOrders.push({ id: foundSellOrder._id, units: foundSellOrder.units });
      } else {
        console.log("Updating Marketplace: sellOrder is not active, does not have units.", foundSellOrder.status, foundSellOrder.units);
      }
    }

    console.log("Updating Marketplace: filter sellOrders ...", priceTier.orders);

    // Filter out null values (removed sellOrders)
    priceTier.orders = newSellOrders

    console.log("Updating Marketplace: filtered sellOrders", priceTier.orders);
  }
  marketplace.orderBookSelling = marketplace.orderBookSelling.filter((tier) => tier.totalUnits > 0);


  for (let priceTier of marketplace.orderBookBuying) {
    priceTier.totalUnits = 0;

    const newBuyOrders = [];

    for (let buyOrder of priceTier.orders) {
      const foundBuyOrder = await Order.findById(buyOrder.id);

      if (foundBuyOrder && foundBuyOrder.status === 'active' && foundBuyOrder.units > 0) {
        console.log("Updating Marketplace: buyOrder is still active. units: ", foundBuyOrder.units);
        priceTier.totalUnits += foundBuyOrder.units;
        newBuyOrders.push({ id: foundBuyOrder._id, units: foundBuyOrder.units });
      } else {
        console.log("Updating Marketplace: buyOrder is not active, does not have units.", foundBuyOrder.status, foundBuyOrder.units);
      }
    }

    console.log("Updating Marketplace: filter buyOrders ...", priceTier.orders);

    // Filter out null values (removed buyOrders)
    priceTier.orders = newBuyOrders

    console.log("Updating Marketplace: filtered buyOrders", priceTier.orders);
  }
  marketplace.orderBookBuying = marketplace.orderBookBuying.filter((tier) => tier.totalUnits > 0);

  await marketplace.save();

  console.log("Updating Marketplace complete!");
}


module.exports = {postOrder, cancelOrder}
