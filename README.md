# Shelly-Logger-for-Websocket
This Script implement logger for websocket that should be alternative option for function print() that has problem with buffer size.

## How to use
Logger has to overloads. You can use ```log(msg)```:
```javascript
log("Hello World!");

// Print
// 0:   Hello World!
```
Or you can use ```log(topic, msg)```:
```javascript
log("Start up", "Hello World!");

// Print
// 0:   [Start up] Hello World!
```

## The problem
Example:
```javascript
for(let i = 0; i<10; i++){
  print(i);
}
```

Get output:
```
4
5
6
7
8
9
```
Console is missing <ins>**first 4 numbers**</ins> due to buffer limitations.

When you use ```log()```:

```javascript
for(let i = 0; i<10; i++){
  log(i);
}
```
You will get correct output:
```
0:	 0
1:	 1
2:	 2
3:	 3
4:	 4
5:	 5
6:	 6
7:	 7
8:	 8
9:	 9
```
## JSON format
Logger also support JSON format. You can use it like this:
```javascript

function handleStatusEvent(event){
  log("Event", JSON.stringify(event));
}

Shelly.addStatusHandler(handleStatusEvent);
```

For example you will receive this output:
```
0:	 [Event] JSON
 {
 	"component":"script:1",
 	"name":"script",
 	"id":1,
 	"delta":{
 		"error_msg":null,
 		"errors":[],
 		"running":true}
 }
```
## Limitations
Logger also has it limitations. For example by default logger buffer is set to 10 msges:
```javascript
const LOG_BUFFER = 10;
```
You can change it, but remember that Shelly smart plug has limited ram.

### Skiping logs
If buffer for logs is overflowed then additonal logs will not be printed and you will see msg how many of them where skipped.

Example for skipping logs:
```javascript
for(let i = 0; i<20; i++){
  log("logger", i);
}
```
Output:
```
#:	 [SKIPPED] 9 LAST LOGS
0:	 [logger] 0
1:	 [logger] 1
2:	 [logger] 2
3:	 [logger] 3
4:	 [logger] 4
5:	 [logger] 5
6:	 [logger] 6
7:	 [logger] 7
8:	 [logger] 8
9:	 [logger] 9
10:	 [logger] 10
```
