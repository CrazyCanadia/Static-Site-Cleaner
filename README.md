# Static Site Cleaner

This is a simple chrome extension to help remove unwanted items from the browsing experience. 


## Installation:

Clone the repository:
```
git clone https://github.com/CrazyCanadia/Static-Site-Cleaner.git
```
OR download the zip from:
```
https://github.com/CrazyCanadia/Static-Site-Cleaner
```


After downloading the files you need to navigate to chrome's extension manager - located in the top right: 

1. Extensions -> Manage Extensions

2. Ensure "Developer mode" is enabled

3. Click "Load upacked"

4. Choose the file you just downloaded

5. You are ready to start de-cluttering your browsing experience.



## How to use it?
The extension is triggered when a page has finished loading. The last loaded page, not necessarily the 'tab' you're on. The last loaded site is displayed.

1. Using **"Ctrl+Shft+C"** we start using the browser's in-built inspection tools.

2. This allows us to single click the DOM element we want to remove.

3. After selecting, this will be highlighted in the Element's window for closer inspection.

4. This will allow the user to accurately choose a term or partial term as a flag to remove from view. This term should be the most specific term for the most inclusive containing DOM element. This extension search is case-sensitive and partial strings can be used. 
**For example, if we have the flag {'class': 'adv'}, the extension will remove any DOM element with a class that contains the string 'adv' (advert,advertising,etc.). This partial search allows this extension to be powerful and remove everything including 'ad', but potentially too powerful as it would then remove 'additional-content' or any other DOM element containing that particular string.**

5. If that term is a class name, then save it as 'Class', for an id save it as 'ID'. Once it has been added to the Blacklist, they will be removed once the page has loaded.

6. Export your "Blacklist.json" file as a backup of your list if you wish, or if you want to share your list.

7. Import a "Blacklist.json" file from a backup or a friend.

8. After adding/importing the extension is just waiting for a page to refresh. 




This is just a simple tool I wanted to make. I hope it helps to take control of your surfing experience. Enjoy!