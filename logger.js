const MAX_NUMBER_OF_CHARS_IN_ROW = 128; // websocked has limit for size of the line don't change it
const ENABLE_LOGER = true;
const logs = [];
const LOG_BUFFER = 10; //max limit of queued messages
const QUICK_MODE = 10; //delay between msges queued
const SLOW_MODE = 200; //when queue is empty checking for msges is slower

let printedLogs = 0;
let skippedLogs = 0;
let quickMode = true;

function loggerPrinter(){
  if(logs.length == 0){
    if(quickMode){
      quickMode = false;
      Timer.clear(timer);
      timer = Timer.set(SLOW_MODE, true, loggerPrinter);
    }
    return;
  }
  if(logs.length != 0 && !quickMode){
    quickMode = true;
    Timer.clear(timer);
    timer = Timer.set(QUICK_MODE, true, loggerPrinter);
  }
    
  print(logs[0].msg[0]);
  if(skippedLogs != 0){
    print("[SKIPPED] " + skippedLogs + " LOGS" );
    skippedLogs = 0;
  }
  logs[0].msg.splice(0, 1);
  if(logs[0].msg.length == 0){
    logs.splice(0, 1) 
    return;
  }
}

let timer = ENABLE_LOGER ? Timer.set(QUICK_MODE, true, loggerPrinter) : undefined;

function indentation(index){
  let ind = " ";
  for(let i = 0; i< index; i++){
    ind += "\t";
  }
  return ind;
}

function prettyJSON(index, topic, text){
  let js = [];
  js.push(index + ":\t [" + topic + "] JSON");
  let line = " ";
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
  let line = index + ":\t [" + topic + "] ";
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
  if(typeof msg != "string" || !ENABLE_LOGER)
    msg += '';
    
  if(logs.length > LOG_BUFFER){
    ++skippedLogs;
    return;
  }
  let log = {msg: prettyLog(printedLogs++, topic, msg)};
  logs.push(log);
}
