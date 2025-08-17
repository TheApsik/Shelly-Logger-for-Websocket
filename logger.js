const MAX_NUMBER_OF_CHARS_IN_ROW = 128; // websocked has limit for size of the line don't change it
const ENABLE_LOGER = true;
const LOG_BUFFER = 10; //max limit of queued messages
const LOG_PRINT_SPEED = 10; //delay between msges queued

const logs = [];
let printedLogs = 0;
let skippedLogs = 0;
let logTimer = undefined;

function loggerPrinter(){
   if(skippedLogs != 0){
    print("#:\t[SKIPPED] " + skippedLogs + " LAST LOGS" );
    skippedLogs = 0;
  }
  
  if(logs.length == 0){
    if(logTimer != undefined){
      Timer.clear(logTimer);
	  logTimer = undefined;
    }
    return;
  }
    
  print(logs[0].msg[0]);
  
  logs[0].msg.splice(0, 1);
  if(logs[0].msg.length == 0){
    logs.splice(0, 1) 
    return;
  }
}

function indentation(index){
  let ind = " ";
  for(let i = 0; i< index; i++){
    ind += "\t";
  }
  return ind;
}

function prettyJSON(index, topic, text){
  let js = [];
  let line = ""+index;
  line += topic != undefined ? ":\t [" + topic + "] JSON" : ":\t JSON";
  js.push(line);
  line = " ";
  let ind = [];
  for(let i = 0; i < text.length; i++){
    let c = text[i];
    switch(c){
      case '{':
      case '[':
        ind.push(c);
        break;
      case ']':
      case '}':
        ind.splice(ind.length - 1);
        break;
    }
    if(line[line.length-1] == '}' && c == '}'){
      js.push(line);
      line = indentation(ind.length);
    }
    line += c;
    
    if(c == '{' || c == ","){
      if(ind.length != 0 && ind[ind.length-1] == '[')
          continue;
      js.push(line);
      line = indentation(ind.length);
    }
  }
  js.push(line);
  return js;
}

function prettyText(index, topic, text){
  let pText = [];
  let line = ""+index;
  line += topic != undefined ? ":\t [" + topic + "] " : ":\t ";
  let ind = Math.floor(line.length/3);
  let word = "";
  if(line.length + text.length <= MAX_NUMBER_OF_CHARS_IN_ROW){
    return [line + text];
  }
  for(let i = 0; i < text.length; i++){
    let c = text[i];
    
    if(c == ' '){
      if(line.length + word.length <= MAX_NUMBER_OF_CHARS_IN_ROW){
        line += word;
      }
      else{
        pText.push(line);
        line = indentation(ind);
      }
      word = "";
    }
    word += c;
  }
  pText.push(line);
  return pText;
}

function prettyLog(index, topic, text){
  if(text.slice(0,2) == "{\""){
    return prettyJSON(index, topic, text);
  }
  return prettyText(index, topic, text);
}

function log(topic, msg){
  if(!ENABLE_LOGER)
    return;

  if(logTimer == undefined){
	logTimer = Timer.set(LOG_PRINT_SPEED, true, loggerPrinter);
  }

  if(msg == undefined){
	msg = topic;
	topic = undefined;
  }
  
  if(typeof msg != "string")
    msg += '';
    
  if(logs.length > LOG_BUFFER){
    ++skippedLogs;
	++printedLogs;
    return;
  }
  let log = {
	  msg: prettyLog(printedLogs++, topic, msg)
  };
  logs.push(log);
}

Shelly.addStatusHandler(handleStatusEvent);
