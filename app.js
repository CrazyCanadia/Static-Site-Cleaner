window.onload = function() {
    
    //Get DOM elements
    const siteHeading_div = document.getElementById('siteHeading')
    const mainHeader_div = document.getElementById('mainHeader')
    const display_div = document.getElementById('display')
    const chooseTerm_selected = document.getElementById('chooseTerm')
    const newTerm_input = document.getElementById('newTerm')
    const myModal = document.getElementById('myModal')
    const wipe_btn = document.getElementById('wipe')
    const import_btn = document.getElementById('import')
    const export_btn = document.getElementById('export')
    // const scan_btn = document.getElementById('comms')

    const removeTerm_btn = document.getElementById('removeTerm')
    const addTerm_btn = document.getElementById('addTerm')
    let blacklistClasses = []
    let blacklistIds = []
    let foundMatch = false
    let counter
    let currentSite
    let data

    //ADDING a new flag to MyBlacklist
    function addTerm(){
        // console.log("We entered addTerm() and data is:")
        // console.log(data)
        // console.log("and foundMatch is: " + foundMatch)
        //Where in MyBlacklist is this site entry?
        for(i=0; i<data.blacklist.length; i++){
            if(data.blacklist[i].site === currentSite){
                foundMatch = true
                //Take the inputs
                let newTerm = newTerm_input.value
                let choice = chooseTerm_selected.value
                newTerm_input.value = ""
                //Create the flag
                let flag = {
                    "type": choice,
                    "phrase": newTerm
                }
                //Push to array
                data.blacklist[i].flags.push(flag)
                //Update Display
                updateDisplay()
                //**Save**
                save()
            }
        }
        if(!foundMatch){
            //It's our first entry for this site... let's create the site structure...
            let initialEntry = {
                "site": currentSite,
                "flags": []
            }
            data.blacklist.push(initialEntry)
            foundMatch = true
            addTerm()
        }
    }

    //REMOVING a flag from MyBlacklist
    function removeTerm(){
        // console.log("We are removing a term...")
        //Selecting the terms from the multi-select list.
        const select = document.querySelectorAll('#display option:checked');
        const selectedValues = Array.from(select).map(el => el.value);
        //storing the values in selectedValues []
        //loop through the Blacklist and remove the matches
        // console.log(selectedValues)
        for(let i = 0; i < data.blacklist.length; i++){
            if(data.blacklist[i].site === currentSite){
                //then focus on the entry to remove...
                for(let j = 0; j < data.blacklist[i].flags.length; j++){
                    let temp = `${data.blacklist[i].flags[j].type}: ${data.blacklist[i].flags[j].phrase}`
                    // console.log(temp)
                    // console.log(selectedValues)
                    for(let k = 0; k < selectedValues.length; k++){
                        if(temp==selectedValues[k]){
                            // console.log("We've got a match...")
                            //remove the entry from the MyBlacklist
                            data.blacklist[i].flags.splice(j,1)
                        }
                    }
                }
            }
        }
        updateDisplay()
        save()
    }

    //UPDATING DISPLAY - part 1
    function updateDisplay() {
        //UPDATING DISPLAY - part 2
        function displayFlags({type, phrase}){
            const entry = `<option>${type}: ${phrase}</option>`
            display_div.innerHTML += entry
        }
        foundMatch = false
        //populating the display with the blacklistClasses[] and blacklistIds[].
        display_div.innerHTML = ""
        // console.log(data)
        //Updating the website heading
        // mainHeader_div.innerText = currentSite
        mainHeader_div.innerHTML = `${currentSite} <span title="Items removed" data-bs-toggle="popover" data-bs-trigger="hover" class="badge rounded-pill mx-2 bg-danger">${counter}</span>`
        for(let i = 0; i < data.blacklist.length; i++){
            if(data.blacklist[i].site===currentSite){
                // console.log("We have matched a site...")
                //This means there is a matching entry
                for(let j = 0; j < data.blacklist[i].flags.length; j++){
                    displayFlags(data.blacklist[i].flags[j])
                    foundMatch = true
                }
            }
        }
        if(!foundMatch){
            foundMatch = true
            // console.log("We haven't matched any site.")
            //If there is no matching entry... we need to add a new entry for this site.
            let none = {
                "type":"None",
                "phrase":"Yet"
            }
            displayFlags(none)
        }
    }

    //SAVING
    function save() {
        //We can try our various options... starting with Secret Option 3:
        chrome.storage.local.set({"MyBlacklist": data}, function(){
            // console.log("We have saved.")
        })
    }

    //SCAN MODE
    function scan() {
        // window.addEventListener('mouseover', function(e) {
        //     console.log(e)
        // })
        console.log("This is the scan function...")
        // window.addEventListener('keydown', (e) => {
        //     console.log(e)
        //     if(e.keyCode === 67 && e.ctrlKey && e.shiftKey){
        //         console.log("Ctrl + Shift + C has been simulated.")
        //     }
        //   })
          
        //   window.dispatchEvent(new KeyboardEvent('keydown', {
        //       key: "c",
        //       keyCode: 67,
        //       code: "KeyC",
        //       which: 67,
        //       shiftKey: true,
        //       ctrlKey: true,
        //       metaKey: false
        //   }));
    }

    //First Entry for this site:
    function initialEntry(){
        let initialEntry = {
            "site": currentSite,
            "flags": []
        }
        data.blacklist.push(initialEntry)
    }

    function wipe(){
        data.blacklist.splice(0, data.blacklist.length)
        chrome.storage.local.set({"MyBlacklist": data})
        chrome.storage.local.get("MyBlacklist", function(response){
            data = response.MyBlacklist
        })
        updateDisplay()
    }

    //IMPORTING
    async function importFile(){
        //Import
        const [fileHandle] = await showOpenFilePicker()
        const file = await fileHandle.getFile()
        const contents = await file.text()
        //Loading
        if(typeof contents === "string"){
            let temp = JSON.parse(contents)
            console.log(temp)
            data = temp
        }else if(typeof contents === "object"){
            //DO NOTHING
            data = contents
        }
        notify("import")
        save()
        updateDisplay()
    }

    //EXPORTING
    async function exportFile() {
        // console.log("We are in saveFileButton")
        const fileHandle = await window.showSaveFilePicker()
        const contents = JSON.stringify(data)
        
        //Starting writing contents...
        async function writeFile(fileHandle, contents) {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(contents);
            // Close the file and write the contents to disk.
            await writable.close();
            // console.log("File Written!")                
        }
        
        notify("export")
        writeFile(fileHandle, contents)
    }

    //Add Button
    addTerm_btn.onclick = function(){
        addTerm()
        notify("add")
    }

    //Remove Button
    removeTerm_btn.onclick = function(){
        removeTerm()
        notify("remove")
    }    

    import_btn.onclick = function(){
        importFile()
    }

    export_btn.onclick = function(){
        exportFile()
    }

    wipe_btn.onclick = function(){
        if(confirm("Are you sure you want to PEREMANENTLY delete all Blacklist data?")){
            // console.log("Wiped!")
            wipe()
            notify("wipe")
        }else{
            // console.log("You have decided not to wipe the memory.")
        }
    }

    //LOADING BLACKLIST FROM STORAGE...

    function loadTheList() {
        chrome.storage.local.get("site", function(response) {
            currentSite = response.site
        })
        chrome.storage.local.get("count", function(response) {
            // console.log(response.count)
            counter = response.count
        })
        chrome.storage.local.get("MyBlacklist", function(response) {
            //verifying it is an object
            if(typeof response === "string"){
                response = JSON.parse(response)
            }else if(typeof response === "object"){
                //DO NOTHING
            }
            response = response.MyBlacklist
            
            try {
                
                if(!response.description){
                        //The object we have in response is basically garbage.
                        console.log("It is undefined so we are now defining it...")
                    //Create a new structure
                    console.log("This should not be happening!") //The content script should have made it... something's up!
                    updateDisplay()
                } else{ //I should check to verify what 'description' is valued as.
                    //We have retrieved our blacklist and should check for a match with currentSite
                    
                    
                    data = response
                    for(let i=0; i<response.blacklist.length; i++){
                        if(response.blacklist[i].site===currentSite){
                            //Use the flags to clean the site
                            foundMatch = true
                            for(let j=0; j<response.blacklist[i].flags.length; j++){ //blacklist[i].flags[{type, phrase}]
                                if(response.blacklist[i].flags[j].type==="class"){
                                    //Add to blacklistClasses[]
                                    blacklistClasses.push(response.blacklist[i].flags[j].phrase)
                                }else if(response.blacklist[i].flags[j].type==="id"){
                                    //Add to blacklistIds[]
                                    blacklistIds.push(response.blacklist[i].flags[j.phrase])
                                }
                            }
                            //CleanUp time with the loaded info... 
                            // console.log("The classes and ids have been loaded.")
                            updateDisplay()
                        }
                    }
                    if(!foundMatch){
                        //Should we create the initial entry here?
                        initialEntry()
                        updateDisplay()
                    }
                    // console.log("We have finished the loading process.")
                }
            } catch (error) {
                console.error(error)
                // expected output: ReferenceError: nonExistentFunction is not defined
                // Note - error messages will vary depending on browser
            }
            
        })
    }
    
    notify("welcome")
    $('#myModal').on('hidden.bs.modal', function (e) {
        // do something...
        notify("instructions")
      })
    loadTheList()
}


// ----------------------------------------------------------------

    // Psudo Code>
/*


For the popup app.js we want it to be a user-friendly interface for simple tasks:
        - Add and Remove flags to websites.

We want to:

    - start by loading MyBlacklist which has been saved by the content script.
        - validate the info retrieved or what was loaded.
                Did we find:    - Nothing                       (data==null)
                                    - An empty list                 blacklist.forEach(site){i++
                                    - A list without a site entry       if(site==currentSite){
                                    - a list with a site entry              cleanUp(data.blacklist[i].flags[])
        - perform actions based upon the above.
                Respective actions: - found nothing -> update display
                                    - found no matches -> update display
                                    - found a match -> update display

    - After loading and displaying, the app should be ready for offered functionaity.
        - allow for functions:
                addTerm(){
                    We want:
                        - a function which takes two user inputs: a type and a phrase
                        - it creates the flag object ({type, phrase})
                        - then pushes it => data.blacklist[i].flags.push(flag)
                        - update display
                        - get content script to save
                                OPTION 1: use sendMessage to send the updated blacklist
                                OPTION 2: get the content script to run code:{} to save it.
                                    OR
                                Secret Option 3: chrome.storage.local.set from the app
                                                    (It may allow that save... try it.)
                }
                removeTerm(){
                    we want:
                        - a function which takes user inputs: flagsArray[]
                        - find the blacklist entry for this matching site
                            for(let i=0; i<data.blacklist.length; i++) {
                                if(data.blacklist[i].site===currentSite){
                                    matchedUp = true
                                    //Then we matched and can continue
                                }
                            }
                        - Then we can iterate over the flags to check for matches. 
                            for(let j=0; j<data.blacklist[i].flags.length; j++) {
                                for(let k=0; k<flagsArray.length; k++) {
                                    if(data.blacklist[i].flags[j]===flagsArray[k]){
                                        //We have found a match and can continue
                                    }
                                }
                            }

                        - Then we can remove it from the data.blacklist[i].flags[j]
                            data.blacklist[i].flags[j].splice(j,1)
                        
                        - Then we should update the display
                        - Then **Save**
                }


                import(){
                    we want:
                        - to open the window picker to choose the file to import
                        - read the file contents and load the data
                        - then save to local storage as an overwrite of any existing info.
                        - update the display
                }

                export(){
                    we want:
                        - to open the window picker to choose the file and location to export
                        - write the data out to file
                        - update the display
                }











*/