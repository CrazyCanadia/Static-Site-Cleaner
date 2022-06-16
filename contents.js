window.onload = function() {
    let host = window.location.host
    let blacklistClasses = []
    let blacklistIds = []
    let el = []
    let foundMatch = false
    let counter = 0

    // chrome.storage.local.clear()

    //Cleaning the DOM objects from the page.
    function cleanUp() {            
        blacklistClasses.forEach(term => {
            const elementList = document.querySelectorAll(`[class*=${term}]`)
            // console.log(elementList); // 👉️ div#box1
            // console.log("printed...")
            
            for(elementListElt of elementList) {
                elementListElt.remove()
                counter++
                // console.log(elementListElt)
            }  
        })
        blacklistIds.forEach(term => {
            const elementList = document.querySelectorAll(`[id*=${term}]`)
            // console.log(elementList); // 👉️ div#box1
            // console.log("printed...")
            
            for(elementListElt of elementList) {
                elementListElt.remove()
                counter++
                // console.log(elementListElt)
            }  
        })

        // if(host=="www.zerohedge.com"){cleanZero()}

        console.log("The Cleaner has removed " + counter + " unwanted items from view. Enjoy! :)")
    }

  //   function cleanZero(){
  //     //This is to clear out the premium content.
  //     let filter = "PremiumBadge_premium___yApF"
  //     console.log("The cleanZero function has fired.")
  //     // get element by ID that CONTAINS `ox`
  //     const elementList = document.querySelectorAll(`[class*=${filter}]`)
  //     // console.log(elementList); // 👉️ div#box1
  //     // console.log("printed...")
      
  //     for(elementListElt of elementList) {
  //         elementListElt.closest(".Article_nonStickyContainer__XQgbr").remove()
  //         counter++
  //     }  
  
  // }

    //Save the Blacklist to local storage
    function saveBlacklist(package) {
        chrome.storage.local.set({"MyBlacklist": package})
        console.log("MyBlacklist has been saved as: ")
        console.log(package)
    }

    //Communicating with background script
    function messageBackground(){
        var port = chrome.runtime.connect({name: "knockknock"})
        console.log("Creating port...")
        port.postMessage({site: host})
        // port.postMessage({count: counter})
        port.onMessage.addListener(function(msg) {
        console.log(msg.done)
        })
        //Sent the site: host to the background script
        //Save the counter to the storage...
        chrome.storage.local.set({"count": counter})
        //Save the site too...
        chrome.storage.local.set({"site": host})
    }

    // function ScanMode() {
    //   el = document.querySelectorAll('div')
    //   for(let i = 0; i < el.length; i++) {
    //     el[i].addEventListener('mouseover', bordering)
    //     el[i].addEventListener('mouseout', unbordering)
    //     el[i].addEventListener('click', click)
    //   }
    // }

    // function bordering() {
    //   this.style.border = "5px solid red"
    // }
    // function unbordering() {
    //   this.style.border = ""
    // }

    // function click() {
    //   console.log(el)
    //   for(let i = 0; i < el.length; i++) {
    //     //DIS-ENGAGE or remove the onmouseover eventListeners... Leaving only the one clicked.
    //     el[i].removeEventListener('mouseover', bordering)
    //     el[i].removeEventListener('mouseout', bordering)
    //     el[i].removeEventListener('click', click)
    //   }
    //   //DISPLAY class and id INFO.- This selectable info will be displayed on the overlay
    // }

    //Message Reciever
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(sender.tab ?
                        "from a content script:" + sender.tab.url :
                        "from the extension")
            if (request.mode === "ScanMode"){
                sendResponse({farewell: "Now initiating ScanMode..."});
                // ScanMode()
            }
            if (request.mode === "Info"){
              sendResponse({farewell: "Now displaying Instructions..."});
              // ScanMode()
          }
        }
    )

    //LOADING BLACKLIST FROM STORAGE...
    //verifying it is an object
    chrome.storage.local.get("MyBlacklist", function(data) {
        if(typeof response === "string"){
            response = JSON.parse(data)
            console.log(response.MyBlacklist)
        }else if(typeof data === "object"){
            //DO NOTHING
            console.log(data.MyBlacklist)
        }
        response = data.MyBlacklist

        // console.log("The counter is currently: ")
        // console.log(counter)


        try {
          // if(response.description===undefined){
          if(!response.description){
              //The object we have in response is basically garbage.
              console.log("It is undefined so we are now defining it...")
              //Create a new structure
              let blStructure = {
                  "description": "This is a blacklist of terms to clear from view.",
                  "blacklist": []
              }
              saveBlacklist(blStructure)
          } else{ //I should check to verify what 'description' is valued as.
              //We have retrieved our blacklist and should check for a match with currentSite
              for(let i=0; i<response.blacklist.length; i++){
                  // console.log("The current host is: " + host)
                  if(response.blacklist[i].site===host){
                      // console.log("The response.blacklist[i].site is: " + response.blacklist[i].site)
                      foundMatch = true
                      //Use the flags to clean the site
                      for(let j=0; j<response.blacklist[i].flags.length; j++){ //blacklist[i].flags[{type, phrase}]
                          if(response.blacklist[i].flags[j].type==="class"){
                              //Add to blacklistClasses[]
                              blacklistClasses.push(response.blacklist[i].flags[j].phrase)
                          }else if(response.blacklist[i].flags[j].type==="id"){
                              //Add to blacklistIds[]
                              blacklistIds.push(response.blacklist[i].flags[j].phrase)
                          }
                      }
                      //CleanUp time with the loaded info... 
                      console.log("The classes and ids have been loaded.")
                      console.log(blacklistClasses)
                      console.log(blacklistIds)
                      cleanUp()
                  }
              }
              if(!foundMatch){
                  console.log("There was no matching site.")
                  //Maybe we just have an empty structure?
                  //We are waiting on the first entry for this site...
                  //There is currently nothing assigned to this site.
                  //So chill and wait for the user to interact through the popup
              }
              console.log("We have finished iterating over the blacklist.length")
          }
          
        } catch (error) {
          console.error(error) 
          //We got a strange error: We will now reset the local storage and initialize TheBlacklist Structure.
          chrome.storage.local.clear()
          let blStructure = {
            "description": "This is a blacklist of terms to clear from view.",
            "blacklist": []
          }
          saveBlacklist(blStructure)
                   
        }

        console.log("We have finished the loading process.")
        messageBackground()
    })

    

    var interval = setInterval(function() {
        if(document.readyState === 'complete') {
            clearInterval(interval)
            cleanUp()
            console.log("We just cleaned up.")
        }    
    }, 1000)

}

// ----------------------------------------------------------------

    // Psudo Code>
/*


For the content script:
    
    We want:
        - to start by loading any saved info (LOADING)
        - we then need to check what we loaded (VERIFICATION)
                    Did we find:    - Nothing                       (data==null)
                                    - An empty list                 blacklist.forEach(site){i++
                                    - A list without a site entry       if(site==currentSite){
                                    - a list with a site entry              cleanUp(data.blacklist[i].flags[])

        - determine the case above and act accordingly
                Respective actions: - Create an intial file structure ({blacklist[],description})
                                    - Create an initial entry for the new site (blacklist.push({site,flags[]}))
                                    - (same as above  -  this is because they both have not found a match to the currentSite)
                                    - Add to the existing site with a new flag (blacklist[i].flags.push({type, phrase}))

        - operations to be undertaken to complete actions above:
            Our functional journey: - load() -> case1(Nothing) -> case2(noMatch) -> case3(We have info)
                                            (create structure)   (new site entry)   (enact info: clean())






---ScanMode---

I'm looking to 

    - use elementList = querySelectorAll('<div>') to find all elements 
    - iterate over the list elementList.forEach(el) {
        el.addEventListener('onmouseover', function(e) {
            // console.log(e)
            //DISPLAY FILLING BOX
            el.style.border = 5px solid red;
        })
        el.addEventListener('click', function(e) {
            // console.log(e)
            //DIS-ENGAGE or remove the onmouseover eventListeners... Leaving only the one clicked.
            //DISPLAY class and id INFO.- This selectable info will be displayed on the overlay
        })
}




.... wow... we already have the list of elements in elementList... so...




  switch (noteType){

    // /* --- Notices at the top of the card --- 
    case "winner":
      notify("clear");
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("winner_notice").innerHTML = "Congratulations! You won!<br>" + extra;
      $("#winner_notice").fadeIn();
      setTimeout(function () {
        $("#winner_notice").fadeOut();
      }, 5000);
    break;

    case "loser":
      notify("clear");
      document.getElementById("loser_notice").innerHTML = "Sorry, you lost. Please, try again.";
      $("#loser_notice").fadeIn();
      setTimeout(function () {
        $("#loser_notice").fadeOut();
      }, 5000);
    break;

    case "destroy":
      $("#betting_section").hide();
      $("#adding_section").hide();
      $("#withdraw_section").hide();
      $("#owner_section").hide();

      $("#place_bet").hide();
      $("#input_heads_tails").hide();
      $("#bet_amount").hide();
      $("#input_denomination").hide();
      $("#game_title").hide();
      $("#contract_balance_eth").hide();

      $("#betMessage").hide();
      $("#deletedMessage").show();

      document.getElementById("destroy_notice").innerHTML = "The contract no longer exists. Goodbye!";
      $("#destroy_notice").fadeIn();
      setTimeout(function () {
        $("#destroy_notice").fadeOut();
      }, 5000);
    break;

    case "deposit":
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("deposit_notice").innerHTML = "You successfully provided liquidity!<br>" + extra;
      $("#deposit_notice").fadeIn();
      setTimeout(function () {
        $("#deposit_notice").fadeOut();
      }, 5000);
    break;

    case "withdraw":
      notify("clear");
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("withdraw_notice").innerHTML = "You successfully withdrew funds!<br>" + extra;
      $("#withdraw_notice").fadeIn();
      setTimeout(function () {
        $("#withdraw_notice").fadeOut();
      }, 5000);
    break;

    case "refund":
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("refund_notice").innerHTML = "Please try again.<br>Your bet was refunded.<br>" + extra;
      $("#refund_notice").fadeIn();
      setTimeout(function () {
        $("#refund_notice").fadeOut();
      }, 5000);
    break;

    case "error":
      document.getElementById("error_notice").innerHTML = "There was an error... no transaction happened.<br> Please try again.";
      $("#error_notice").fadeIn();
      setTimeout(function () {
        $("#error_notice").fadeOut();
      }, 5000);
    break;

    case "upgrade":
      document.getElementById("upgrade_notice").innerHTML = "You have successfully upgraded this contract.";
      $("#upgrade_notice").fadeIn();
      setTimeout(function () {
        $("#upgrade_notice").fadeOut();
      }, 5000);
    break;

    case "owner":
      document.getElementById("owner_notice").innerHTML = "Owner, welcome!";
      $("#owner_notice").fadeIn();
      $("#owner_section").show();
      setTimeout(function () {
        $("#owner_notice").fadeOut();
      }, 3000);
    break;

    case "provider":
      document.getElementById("provider_notice").innerHTML = "Provider, welcome!";
      $("#provider_notice").fadeIn();
      $("#withdraw_section").show();
      setTimeout(function () {
        $("#provider_notice").fadeOut();
      }, 3000);
    break;

    case "hello":
      document.getElementById("hello_notice").innerHTML = "Welcome. Click the coin.";
      $("#hello_notice").fadeIn();
      setTimeout(function () {
        $("#hello_notice").fadeOut();
      }, 5000);
    break;

    case "waiting":
    document.getElementById("waiting_notice").innerHTML = "Waiting for a response...";
    $("#waiting_notice").fadeIn();
    waitNotice = setInterval(function () {
      $("#waiting_notice").animate({opacity: "1"}, "slow");
      setTimeout(function () {
        $("#waiting_notice").animate({opacity: ".1"}, "slow");
      }, 3000);
    }, 4000);
    break;

    case "closingDown":
      document.getElementById("closingDown_notice").innerHTML = "We are closing but it is still too early.";
      $("#closingDown_notice").fadeIn();
      setTimeout(function () {
        $("#closingDown_notice").fadeOut();
      }, 3000);
    break;

    case "waitingForProviders":
      document.getElementById("waitingForProviders_notice").innerHTML = "We are still waiting on other providers.";
      $("#waitingForProviders_notice").fadeIn();
      setTimeout(function () {
        $("#waitingForProviders_notice").fadeOut();
      }, 3000);
    break;


    // /* --- Animation of the coin and coms area updating --- 
    case "animateGo":
      $("#coinAnimate").show();
      $("#coinImage").hide();
      notify("clearMsg");
      $("#spinner").show();
      $("#sendingMessage").show();
    break;

    case "animateStop":
    $("#coinImage").show();
      $("#coinAnimate").hide();
      notify("clearMsg");
      $("#betMessage").show();
    break;

    case "updateComs":
    setTimeout(function () {
      $("#sendingMessage").hide();
      $("#sentMessage").show();
    }, 1000);
    setTimeout(function () {
      $("#sentMessage").hide();
      $("#waitingMessage").show();
      progressBar();
      $("#betMessage").hide();
      // $("#place_bet").hide();
      // $("#refund_bet").show();
    }, 3000);
    break;

    case "rulesOn":
      $("#myModal").modal();
    break;

    case "rulesOff":
    document.getElementById("rulesMessage").style.display = "none";
    break;

    case "clear":
      $("#winner_notice").fadeOut();
      $("#loser_notice").fadeOut();
      $("#destroy_notice").fadeOut();
      $("#deposit_notice").fadeOut();
      $("#withdraw_notice").fadeOut();
      $("#error_notice").fadeOut();
      $("#owner_notice").fadeOut();
      $("#provider_notice").fadeOut();
      $("#waiting_notice").fadeOut();
      $("#upgrade_notice").fadeOut();
    break;

    case "clearMsg":
      $("#sendingMessage").hide();
      $("#sentMessage").hide();
      $("#waitingMessage").hide();
      $("#closingMessage").hide();
      $("#deletedMessage").hide();
      $("#spinner").hide();
      $("#betMessage").hide();
    break;
  }
}



*/

