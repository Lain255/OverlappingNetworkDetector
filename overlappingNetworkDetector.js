//Run with 
//  node ./overlappingNetworkDetector.js
//will read cvs file specified in file name, and will write JSON file with same name.

const fs = require("fs")

//change file name to change which file to process
let fileName = "list.csv"

//read file
let netAddrs = fs.readFileSync(fileName, {encoding :"utf-8"})

//split on new lines and removes first and last line
netAddrs = netAddrs.split("\r\n")
netAddrs.shift()
netAddrs.pop()

//format into usable object
netAddrs = netAddrs.map(netAddr => {
    let [addr, mask] = netAddr.split(",")
    mask = parseInt(mask)
    return {addr, mask}
})

//sort by masks
netAddrs = netAddrs.sort( ({mask : mask1}, {mask : mask2}) => mask1 - mask2)

//helper functions
let addrToBin = addr => addr.split(".").map(decimal => parseInt(decimal, 10).toString(2).padStart(8, "0")).join("")
let overlap = (netAddr1, netAddr2) => {
    let minMask = Math.min(netAddr1.mask, netAddr2.mask)
    return addrToBin(netAddr1.addr).slice(0,minMask) == addrToBin(netAddr2.addr).slice(0,minMask) 
}
let netAddrToStr = ({addr, mask}) => addr + "/" + mask

//create overlapping groups
netAddrs = netAddrs.reduce( (acc, cur) => {
    let overlappedList = acc.find(netAddrList => netAddrList.some(netAddr => overlap(netAddr, cur)))
    if (overlappedList) {overlappedList.push(cur)}
    else {acc.push([cur])}
    return acc
},[])

//make it prettier for humans to read. may want to comment this out if previos format is more useful
netAddrs = netAddrs.map(netAddrList => netAddrList.map(netAddrToStr))
netAddrs = netAddrs.map(netAddrList => {
    if (netAddrList.length == 1) {return netAddrList[0]}
    else {return {[netAddrList[0]] : netAddrList.splice(1)}}
})

//write to json with same file name
fs.writeFileSync(fileName.replace(/\.csv$/,"") + ".json", JSON.stringify(netAddrs, null, 4))
