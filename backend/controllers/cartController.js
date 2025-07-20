import userModel from '../models/userModel.js';

//add products to user cart
const addToCart = async(req,res)=>{
     try{
        const { userId, itemId, size} = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1; // Increment quantity if item already exists
            }else{
                cartData[itemId][size] = 1; // Initialize quantity if item is new
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1; // Add new item with size and quantity
        }
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.status(200).json({ success: true, message: "Item added to cart successfully" });

     }catch(error){
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
     }
}

//update user cart
const updateCart = async(req,res)=>{
    try{
        const { userId, itemId, size, quantity } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity;
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.status(200).json({ success: true, message: "Cart Updated"});


    }catch(error){
console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
    
}

//get user cart
const getUserCart = async(req,res)=>{
    try {
        const [userId] = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        res.status(200).json({success:true, cartData});

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
}

export {addToCart, updateCart, getUserCart};