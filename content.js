console.log("Version: 2.2");
console.log("Chrome extension running");

chrome.runtime.onMessage.addListener(gotMessage)

var mainThread= null
var num_clicks = 0
var stop = true
var mainThreadDelay= 1000
var reservedSlot = false
var parser  = new DOMParser()
var clickCounterValue = 0;

console.log(sessionStorage.getItem('state'))

chrome.storage.local.get("clickCount",(countObj)=>{

    if (isObjectEmpty(countObj)){
        chrome.storage.local.set({"clickCount":0},()=>{
            console.log("click count is 0");
        })
    }
    else{
        clickCounterValue = countObj.clickCount
    }
   
})

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}

if (sessionStorage.getItem('state')==="running"){
    stop = false

    chrome.storage.sync.get("delay",(obj)=>{
        startThread(obj.delay)
    })
    
}
function clearThread(){
    if (mainThread != null){
        console.log("Clearing thread")
        clearInterval(mainThread)
    }

}


function gotMessage(message,sender,sendRespone){
    

    if ("delay" in message && !stop){
        mainThreadDelay = message.delay
        clearThread()
        mainThread = startThread(mainThreadDelay)
        
    }
    else if ("clicked" in message){
        if (message.clicked==true){
            sessionStorage.setItem("state","running")
            stop = false;
        }
        else{
            sessionStorage.setItem("state","false");
            stop = true;
            clearThread()
            
    
        }

    }
    else if ("resetCounter" in message){
        clickCounterValue=0
    }
    
}


function startThread(delay){

    let closeDialog = document.getElementById("backButtonCloseDialog")
    if (closeDialog != null){
        closeDialog.click()
    }

    thread =  setInterval(() => {
        if (!stop){
            clickLink()
            clickCounterValue+=1
            if (clickCounterValue>=9800){
                
                stop=true;
                clearInterval(mainThread)
                sessionStorage.clear()
                chrome.runtime.sendMessage({"stop":"true"},()=>{
                
            })

            }
            chrome.storage.local.set({"clickCount":clickCounterValue},()=>{
                console.log("click count is ",clickCounterValue);
            })
            if (clickCounterValue%5==0){
                chrome.runtime.sendMessage({"clickCount":clickCounterValue},()=>{
                    console.log("sent imp message to popup")
                })
            }
        }
        
    }, delay);
    return thread
}

function clickLink(){
    num_clicks+=1

    let linkEle = document.getElementById("searchForWeeklySlotsPreviousAvailable")
    if (num_clicks==10){
        linkEle.click()
        num_clicks=0
    }

    link  = linkEle.href
    // linkEle.click()
    console.log(link)
    fetch(link)
    .then(response => response.text())
    .then(function (htmlText){
        if (!stop){
            findSlots(htmlText)
        }
        
    })
}

function parseHtml(htmlText){
    return parser.parseFromString(htmlText,'text/html')

}

function findSlots(htmlText){
    console.log(typeof(htmlText))
    let htmlDoc = parseHtml(htmlText)
    
    let table = htmlDoc.getElementById("browseslots")
    try{
        let slots = table.getElementsByClassName("day slotsavailable")
        if (slots.length>0){
            stop=true;
            clearInterval(mainThread)
            sessionStorage.clear()
            chrome.runtime.sendMessage({"stop":"true"},()=>{
            console.log("sent message to popup")
            
    })
            clickGreenBox(slots)
        }

    }
    catch (err){
        console.log("error occured",err)
    }
    

}
function clickGreenBox(slots){
    let numReserveSlots = slots[0].textContent.match(/(\d+)/)[0]
    
    console.log(slots[0])
    slotlink = slots[0].getElementsByTagName('a')[0].href
    console.log(slotlink)
    reserveSlot(slotlink,numReserveSlots)
    // window.open(slotlink,"_blank")

}

  
async function reserveSlot(slotlink,numSlots){
    
    console.log("Tests found:",numSlots)
    console.log("Reserving Tests....")

    for (let i = 0;i<numSlots;i++)
    {   
        await fetch(slotlink)
        .then(response=>response.text())
        .then(htmlDoc=>{
            htmlDoc = parseHtml(htmlDoc)
            let reserve_table = htmlDoc.getElementById("displaySlot")
            let links = reserve_table.getElementsByTagName('a')
            fetch(links[0])
        })
    }

    window.open(slotlink,"_blank")
    
        

}
