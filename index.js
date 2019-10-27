const contractSource = `
contract LandRegistration =
  
    
  record landDetails = 
    {
    id : int,
    name : string,
    creatorAddress : address,
    image1 : string,
    image2 : string,
    description : string,
    price : int,
    timestamp : int
    }
    
  record state = {
    lands : map(int, landDetails),
    landLength : int}
    
  entrypoint init() = { 
    lands = {},
    landLength = 0}

  
  entrypoint getLand(index : int) = 
    switch(Map.lookup(index, state.lands))
      None => abort("Land does not exist with this index")
      Some(x) => x  
    
    
    //Registers a Land
    
  payable stateful entrypoint createLand( image1' : string, image2' : string, name' : string, description' : string, price' : int) = 
    let timestamp = Chain.timestamp
    let landReg = {
      id = getLandLength()+1,
      name = name', 
      creatorAddress  = Call.caller,
      image1 = image1',
      image2 = image2',
      
      description = description',
      price= price',
      timestamp = timestamp}
    
    let index = getLandLength() + 1
    put(state{lands[index] = landReg, landLength = index})
    
    
    //returns lenght of lands registered
  entrypoint getLandLength() : int = 
    state.landLength
    
  //price of land
    
  entrypoint getPrice(index : int) = 
    state.lands[index].price
    
    
    
  entrypoint getId(index : int) = 
      state.lands[index].id
      

  
    `;


const contractAddress = 'ct_qZUCTGGB3Hij1ZJT42XWSDanR1sUACY4d9CxidLbE17HC6Mnw';
var LandArray = [];
var client = null;
var LandLength = 0;



function renderProduct() {
    LandArray = LandArray.sort(function (a, b) {
        return b.Price - a.Price
    })
    var template = $('#template').html();

    Mustache.parse(template);
    var rendered = Mustache.render(template, {
        LandArray
    });




    $('#body').html(rendered);
    console.log("for loop reached")
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
    //Create a new contract instance that we can interact with
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    //Make a call to get data of smart contract func, with specefied arguments
    console.log("Contract : ", contract)
    const calledGet = await contract.call(func, args, {
        callStatic: true
    }).catch(e => console.error(e));
    //Make another call to decode the data received in first call
    console.log("Called get found: ", calledGet)
    const decodedGet = await calledGet.decode().catch(e => console.error(e));
    console.log("catching errors : ", decodedGet)
    return decodedGet;
}

async function contractCall(func, args, value) {
    const contract = await client.getContractInstance(contractSource, {
        contractAddress
    });
    //Make a call to write smart contract func, with aeon value input
    const calledSet = await contract.call(func, args, {
        amount: value
    }).catch(e => console.error(e));

    return calledSet;
}

window.addEventListener('load', async () => {
    $("#loading-bar-spinner").show();

    client = await Ae.Aepp()

    LandLength = await callStatic('getLandLength', []);


    for (let i = 1; i <= LandLength; i++) {
        const property = await callStatic('getLand', [i]);

        console.log("for loop reached", "pushing to array")

        console.log(property.name)
        console.log(property.description)
        console.log(property.image1)


        LandArray.push({
            id: property.id,
            creatorAddress: property.creatorAddress,
            image1: property.image1,
            image2: property.image2,


            name: property.name,
            description: property.description,
            price: property.price
        })

        // vote
        //   $(function () {
        //     $("i").click(function () {
        //       $("i,span").toggleClass("press", 1000);
        //     });
        //   });
        // }
        renderProduct();
        $("#loading-bar-spinner").hide();
    }
});