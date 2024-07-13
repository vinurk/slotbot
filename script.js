startBtn = document.getElementById("startBtn");
stopBtn = document.getElementById("stopBtn")
delayRange = document.getElementById("delayRange")
delayValue = document.getElementById("delayValue")
clickCounter = document.getElementById("counterText")
resetBtn = document.getElementById("counterReset")

const notif_sound = new Audio("notification_sound.mp3");


var tempDelay = 0


var  params={
    active:true,
    currentWindow:true
}


function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function recieveMessage(message, sender, sendRespone){

    if (Object.hasOwn(message,"stop")){

        stopBtn.click()
        notif_sound.play()

    }
    else{
        clickCounter.innerText = `Click Counter: ${message.clickCount}`
    }
    console.log(message)
}

chrome.storage.local.get("clickCount",(countObj)=>{
   
    clickCounter.innerText = `Click Counter: ${countObj.clickCount}`
    
})



console.log("updated")
var state={
    "running":"false"
}
chrome.runtime.onMessage.addListener(recieveMessage)



chrome.storage.sync.get("delay",(obj)=>{
    if (isObjectEmpty(obj)){
        chrome.storage.sync.set({"delay":1000},()=>{
            console.log("default value of delay set as 1000 ms")
            delayRange.value = 1000
            delayValue.innerText = 1000
            tempDelay = 1000
            
        })
    }
    else{
        console.log("here",obj.delay)
        delayRange.value = obj.delay
        tempDelay = obj.delay
        delayValue.innerText = tempDelay

    }
})

chrome.storage.sync.get(state,(result)=>{
    if (result!=null){
        console.log("got",result)

        if (result.running==="true"){
            console.log("hererhehrehrhe")
            startBtn.disabled = true;
            stopBtn.disabled = false;
        
        }
        else{
            console.log("hello")
            startBtn.disabled = false;
            stopBtn.disabled = true;
        
        }
        
    }
    
})


stopBtn.addEventListener('click',e=>{
    state.running="false"
    chrome.storage.sync.set(state,()=>{
        console.log("stopped")
    })
    
    startBtn.disabled = false;
    stopBtn.disabled = true;

    chrome.tabs.query(params,gotTab);


    function gotTab(tabs){
        let message = {
            "clicked":false
        }
        
        console.log("clicked and sent", tabs)
        
        
        chrome.tabs.sendMessage(tabs[0].id,message)

    }

})


startBtn.addEventListener("click",e=>{
    // notif_sound.play()
    
    

    state.running="true"
    chrome.storage.sync.set(state,()=>{
        console.log("started")
    })

    startBtn.disabled = true;
    stopBtn.disabled = false;

    chrome.tabs.query(params,gotTab);

    function gotTab(tabs){

        console.log("clicked and sent", tabs)
        let message = {
            "clicked":true
        }
        chrome.tabs.sendMessage(tabs[0].id,message)
        
    }

    chrome.tabs.query(params,sendDelayMessage);

    function sendDelayMessage(tabs){

        console.log("clicked and sent", tabs)
        let delayMessage = {
            "delay":tempDelay
        }
        chrome.tabs.sendMessage(tabs[0].id,delayMessage)
    }


    function gotTab(tabs){
        let message = {
            "clicked":true
        }
        
        console.log("clicked and sent", tabs)
        chrome.tabs.sendMessage(tabs[0].id,message)

    }
})

resetBtn.addEventListener("click",()=>{
    chrome.storage.sync.set({"clickCount":0},()=>{
        
    })
    
    chrome.tabs.query(params,gotTab);

    function gotTab(tabs){
        let message = {
            "resetCounter":true
        }
        
        console.log("clicked and sent", tabs)
        
        
        chrome.tabs.sendMessage(tabs[0].id,message)

    }
    clickCounter.innerText = `Click Counter: ${0}`

})


delayRange.addEventListener("input",changeDelayText)
delayRange.addEventListener("change",changeDelay)


function changeDelayText(){
    delayValue.innerText = delayRange.value
    console.log(delayRange.value)
}

function changeDelay(){
    tempDelay = delayRange.value
    sendDelay(tempDelay)

}

function sendDelay(delay){
    
    chrome.tabs.query(params,gotTab);

    function gotTab(tabs){
        let message = {
            "delay":delay
        }
        chrome.storage.sync.set({"delay":delay})
        console.log("clicked and sent", tabs)
        chrome.tabs.sendMessage(tabs[0].id,message)

    }
}