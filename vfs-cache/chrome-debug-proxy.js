!function(){if(!global.define){var fs=require("fs"),path=require("path"),Module=require("module"),fp=Module._findPath


Module._findPath=function(request,paths){if(Module._cache[request])return request
var id=path.resolve(paths[0],request)
return Module._cache[id]?id:fp(request,paths)}
var moduleStack=[],defaultCompile=module.constructor.prototype._compile
module.constructor.prototype._compile=function(content,filename){moduleStack.push(this)
try{return defaultCompile.call(this,content,filename)}finally{moduleStack.pop()}},global.define=function(id,injects,factory){
var DEFAULT_INJECTS=["require","exports","module"],currentModule=moduleStack[moduleStack.length-1],mod=currentModule||module.parent||require.main


if(1===arguments.length?(factory=id,injects=DEFAULT_INJECTS,id=null):2===arguments.length&&(factory=injects,
injects=id,id=null),0==injects.length&&(injects=DEFAULT_INJECTS),"string"==typeof id&&id!==mod.id){var fullId=path.resolve(__filename,id)


mod=new Module(fullId,mod),mod.filename=fullId,Module._cache[id]=Module._cache[fullId]=mod}var req=function(module,relativeId,callback){
if(Array.isArray(relativeId))return callback.apply(this,relativeId.map(req))
var prefix,chunks=relativeId.split("!")
chunks.length>=2&&(prefix=chunks[0],relativeId=chunks.slice(1).join("!"))
var fileName=Module._resolveFilename(relativeId,module)
return Array.isArray(fileName)&&(fileName=fileName[0]),prefix&&prefix.indexOf("text")!==-1?fs.readFileSync(fileName,"utf8"):require(fileName)

}.bind(this,mod)
if(id=mod.id,"function"!=typeof factory)return mod.exports=factory
var returned=factory.apply(mod.exports,injects.map(function(injection){switch(injection){case"require":
return req
case"exports":return mod.exports
case"module":return mod
default:return req(injection)}}))
returned&&(mod.exports=returned)}}}()


define("ultron",[],function(require,exports,module){"use strict"
function Ultron(ee){return this instanceof Ultron?(this.id=id++,void(this.ee=ee)):new Ultron(ee)}var has=Object.prototype.hasOwnProperty,id=0


Ultron.prototype.on=function(event,fn,context){return fn.__ultron=this.id,this.ee.on(event,fn,context),
this},Ultron.prototype.once=function(event,fn,context){return fn.__ultron=this.id,this.ee.once(event,fn,context),
this},Ultron.prototype.remove=function(){var event,args=arguments
if(1===args.length&&"string"==typeof args[0])args=args[0].split(/[, ]+/)
else if(!args.length){args=[]
for(event in this.ee._events)has.call(this.ee._events,event)&&args.push(event)}for(var i=0;i<args.length;i++)for(var listeners=this.ee.listeners(args[i]),j=0;j<listeners.length;j++){
if(event=listeners[j],event.listener){if(event.listener.__ultron!==this.id)continue
delete event.listener.__ultron}else{if(event.__ultron!==this.id)continue
delete event.__ultron}this.ee.removeListener(args[i],event)}return this},Ultron.prototype.destroy=function(){
return!!this.ee&&(this.remove(),this.ee=null,!0)},module.exports=Ultron})


define("options",[],function(require,exports,module){function Options(defaults){var internalValues={},values=this.value={}


Object.keys(defaults).forEach(function(key){internalValues[key]=defaults[key],Object.defineProperty(values,key,{
get:function(){return internalValues[key]},configurable:!1,enumerable:!0})}),this.reset=function(){return Object.keys(defaults).forEach(function(key){
internalValues[key]=defaults[key]}),this},this.merge=function(options,required){if(options=options||{},
"[object Array]"===Object.prototype.toString.call(required)){for(var missing=[],i=0,l=required.length;i<l;++i){
var key=required[i]
key in options||missing.push(key)}if(missing.length>0)throw missing.length>1?new Error("options "+missing.slice(0,missing.length-1).join(", ")+" and "+missing[missing.length-1]+" must be defined"):new Error("option "+missing[0]+" must be defined")

}return Object.keys(options).forEach(function(key){key in internalValues&&(internalValues[key]=options[key])

}),this},this.copy=function(keys){var obj={}
return Object.keys(defaults).forEach(function(key){keys.indexOf(key)!==-1&&(obj[key]=values[key])}),obj

},this.read=function(filename,cb){if("function"==typeof cb){var self=this
fs.readFile(filename,function(error,data){if(error)return cb(error)
var conf=JSON.parse(data)
self.merge(conf),cb()})}else{var conf=JSON.parse(fs.readFileSync(filename))
this.merge(conf)}return this},this.isDefined=function(key){return"undefined"!=typeof values[key]},this.isDefinedAndNonNull=function(key){
return"undefined"!=typeof values[key]&&null!==values[key]},Object.freeze(values),Object.freeze(this)}
var fs=require("fs")
module.exports=Options})


define("ws/lib/ErrorCodes",[],function(require,exports,module){module.exports={isValidErrorCode:function(code){
return code>=1e3&&code<=1011&&1004!=code&&1005!=code&&1006!=code||code>=3e3&&code<=4999},1e3:"normal",
1001:"going away",1002:"protocol error",1003:"unsupported data",1004:"reserved",1005:"reserved for extensions",
1006:"reserved for extensions",1007:"inconsistent or invalid data",1008:"policy violation",1009:"message too big",
1010:"extension handshake missing",1011:"an unexpected condition prevented the request from being fulfilled"
}})


define("ws/lib/BufferUtil.fallback",[],function(require,exports,module){module.exports.BufferUtil={merge:function(mergedBuffer,buffers){
for(var offset=0,i=0,l=buffers.length;i<l;++i){var buf=buffers[i]
buf.copy(mergedBuffer,offset),offset+=buf.length}},mask:function(source,mask,output,offset,length){for(var maskNum=mask.readUInt32LE(0,!0),i=0;i<length-3;i+=4){
var num=maskNum^source.readUInt32LE(i,!0)
num<0&&(num=4294967296+num),output.writeUInt32LE(num,offset+i,!0)}switch(length%4){case 3:output[offset+i+2]=source[i+2]^mask[2]


case 2:output[offset+i+1]=source[i+1]^mask[1]
case 1:output[offset+i]=source[i]^mask[0]
case 0:}},unmask:function(data,mask){for(var maskNum=mask.readUInt32LE(0,!0),length=data.length,i=0;i<length-3;i+=4){
var num=maskNum^data.readUInt32LE(i,!0)
num<0&&(num=4294967296+num),data.writeUInt32LE(num,i,!0)}switch(length%4){case 3:data[i+2]=data[i+2]^mask[2]


case 2:data[i+1]=data[i+1]^mask[1]
case 1:data[i]=data[i]^mask[0]
case 0:}}}})


define("ws/lib/BufferUtil",[],function(require,exports,module){"use strict"
try{module.exports=require("bufferutil")}catch(e){module.exports=require("./BufferUtil.fallback")}})


define("ws/lib/PerMessageDeflate",[],function(require,exports,module){function PerMessageDeflate(options,isServer){
if(this instanceof PerMessageDeflate==!1)throw new TypeError("Classes can't be function-called")
this._options=options||{},this._isServer=!!isServer,this._inflate=null,this._deflate=null,this.params=null

}var zlib=require("zlib"),AVAILABLE_WINDOW_BITS=[8,9,10,11,12,13,14,15],DEFAULT_WINDOW_BITS=15,DEFAULT_MEM_LEVEL=8


PerMessageDeflate.extensionName="permessage-deflate",PerMessageDeflate.prototype.offer=function(){var params={}


return this._options.serverNoContextTakeover&&(params.server_no_context_takeover=!0),this._options.clientNoContextTakeover&&(params.client_no_context_takeover=!0),
this._options.serverMaxWindowBits&&(params.server_max_window_bits=this._options.serverMaxWindowBits),
this._options.clientMaxWindowBits?params.client_max_window_bits=this._options.clientMaxWindowBits:null==this._options.clientMaxWindowBits&&(params.client_max_window_bits=!0),
params},PerMessageDeflate.prototype.accept=function(paramsList){paramsList=this.normalizeParams(paramsList)


var params
return params=this._isServer?this.acceptAsServer(paramsList):this.acceptAsClient(paramsList),this.params=params,
params},PerMessageDeflate.prototype.cleanup=function(){this._inflate&&(this._inflate.writeInProgress?this._inflate.pendingClose=!0:(this._inflate.close&&this._inflate.close(),
this._inflate=null)),this._deflate&&(this._deflate.writeInProgress?this._deflate.pendingClose=!0:(this._deflate.close&&this._deflate.close(),
this._deflate=null))},PerMessageDeflate.prototype.acceptAsServer=function(paramsList){var accepted={},result=paramsList.some(function(params){
if(accepted={},(this._options.serverNoContextTakeover!==!1||!params.server_no_context_takeover)&&(this._options.serverMaxWindowBits!==!1||!params.server_max_window_bits)&&!("number"==typeof this._options.serverMaxWindowBits&&"number"==typeof params.server_max_window_bits&&this._options.serverMaxWindowBits>params.server_max_window_bits)&&("number"!=typeof this._options.clientMaxWindowBits||params.client_max_window_bits))return(this._options.serverNoContextTakeover||params.server_no_context_takeover)&&(accepted.server_no_context_takeover=!0),
this._options.clientNoContextTakeover&&(accepted.client_no_context_takeover=!0),this._options.clientNoContextTakeover!==!1&&params.client_no_context_takeover&&(accepted.client_no_context_takeover=!0),
"number"==typeof this._options.serverMaxWindowBits?accepted.server_max_window_bits=this._options.serverMaxWindowBits:"number"==typeof params.server_max_window_bits&&(accepted.server_max_window_bits=params.server_max_window_bits),
"number"==typeof this._options.clientMaxWindowBits?accepted.client_max_window_bits=this._options.clientMaxWindowBits:this._options.clientMaxWindowBits!==!1&&"number"==typeof params.client_max_window_bits&&(accepted.client_max_window_bits=params.client_max_window_bits),
!0},this)
if(!result)throw new Error("Doesn't support the offered configuration")
return accepted},PerMessageDeflate.prototype.acceptAsClient=function(paramsList){var params=paramsList[0]


if(null!=this._options.clientNoContextTakeover&&this._options.clientNoContextTakeover===!1&&params.client_no_context_takeover)throw new Error('Invalid value for "client_no_context_takeover"')


if(null!=this._options.clientMaxWindowBits){if(this._options.clientMaxWindowBits===!1&&params.client_max_window_bits)throw new Error('Invalid value for "client_max_window_bits"')


if("number"==typeof this._options.clientMaxWindowBits&&(!params.client_max_window_bits||params.client_max_window_bits>this._options.clientMaxWindowBits))throw new Error('Invalid value for "client_max_window_bits"')

}return params},PerMessageDeflate.prototype.normalizeParams=function(paramsList){return paramsList.map(function(params){
return Object.keys(params).forEach(function(key){var value=params[key]
if(value.length>1)throw new Error("Multiple extension parameters for "+key)
switch(value=value[0],key){case"server_no_context_takeover":case"client_no_context_takeover":if(value!==!0)throw new Error("invalid extension parameter value for "+key+" ("+value+")")


params[key]=!0
break
case"server_max_window_bits":case"client_max_window_bits":if("string"==typeof value&&(value=parseInt(value,10),
!~AVAILABLE_WINDOW_BITS.indexOf(value)))throw new Error("invalid extension parameter value for "+key+" ("+value+")")


if(!this._isServer&&value===!0)throw new Error("Missing extension parameter value for "+key)
params[key]=value
break
default:throw new Error("Not defined extension parameter ("+key+")")}},this),params},this)},PerMessageDeflate.prototype.decompress=function(data,fin,callback){
function onError(err){cleanup(),callback(err)}function onData(data){buffers.push(data)}function cleanup(){
self._inflate&&(self._inflate.removeListener("error",onError),self._inflate.removeListener("data",onData),
self._inflate.writeInProgress=!1,(fin&&self.params[endpoint+"_no_context_takeover"]||self._inflate.pendingClose)&&(self._inflate.close&&self._inflate.close(),
self._inflate=null))}var endpoint=this._isServer?"client":"server"
if(!this._inflate){var maxWindowBits=this.params[endpoint+"_max_window_bits"]
this._inflate=zlib.createInflateRaw({windowBits:"number"==typeof maxWindowBits?maxWindowBits:DEFAULT_WINDOW_BITS
})}this._inflate.writeInProgress=!0
var self=this,buffers=[]
this._inflate.on("error",onError).on("data",onData),this._inflate.write(data),fin&&this._inflate.write(new Buffer([0,0,255,255])),
this._inflate.flush(function(){cleanup(),callback(null,Buffer.concat(buffers))})},PerMessageDeflate.prototype.compress=function(data,fin,callback){
function onError(err){cleanup(),callback(err)}function onData(data){buffers.push(data)}function cleanup(){
self._deflate&&(self._deflate.removeListener("error",onError),self._deflate.removeListener("data",onData),
self._deflate.writeInProgress=!1,(fin&&self.params[endpoint+"_no_context_takeover"]||self._deflate.pendingClose)&&(self._deflate.close&&self._deflate.close(),
self._deflate=null))}var endpoint=this._isServer?"server":"client"
if(!this._deflate){var maxWindowBits=this.params[endpoint+"_max_window_bits"]
this._deflate=zlib.createDeflateRaw({flush:zlib.Z_SYNC_FLUSH,windowBits:"number"==typeof maxWindowBits?maxWindowBits:DEFAULT_WINDOW_BITS,
memLevel:this._options.memLevel||DEFAULT_MEM_LEVEL})}this._deflate.writeInProgress=!0
var self=this,buffers=[]
this._deflate.on("error",onError).on("data",onData),this._deflate.write(data),this._deflate.flush(function(){
cleanup()
var data=Buffer.concat(buffers)
fin&&(data=data.slice(0,data.length-4)),callback(null,data)})},module.exports=PerMessageDeflate})


define("ws/lib/Sender",[],function(require,exports,module){function Sender(socket,extensions){if(this instanceof Sender==!1)throw new TypeError("Classes can't be function-called")


events.EventEmitter.call(this),this._socket=socket,this.extensions=extensions||{},this.firstFragment=!0,
this.compress=!1,this.messageHandlers=[],this.processing=!1}function writeUInt16BE(value,offset){this[offset]=(65280&value)>>8,
this[offset+1]=255&value}function writeUInt32BE(value,offset){this[offset]=(4278190080&value)>>24,this[offset+1]=(16711680&value)>>16,
this[offset+2]=(65280&value)>>8,this[offset+3]=255&value}function getArrayBuffer(data){for(var array=new Uint8Array(data.buffer||data),l=data.byteLength||data.length,o=data.byteOffset||0,buffer=new Buffer(l),i=0;i<l;++i)buffer[i]=array[o+i]


return buffer}function getRandomMask(){return new Buffer([~~(255*Math.random()),~~(255*Math.random()),~~(255*Math.random()),~~(255*Math.random())])

}var events=require("events"),util=require("util"),ErrorCodes=(events.EventEmitter,require("./ErrorCodes")),bufferUtil=require("./BufferUtil").BufferUtil,PerMessageDeflate=require("./PerMessageDeflate")


util.inherits(Sender,events.EventEmitter),Sender.prototype.close=function(code,data,mask,cb){if("undefined"!=typeof code&&("number"!=typeof code||!ErrorCodes.isValidErrorCode(code)))throw new Error("first argument must be a valid error code number")


code=code||1e3
var dataBuffer=new Buffer(2+(data?Buffer.byteLength(data):0))
writeUInt16BE.call(dataBuffer,code,0),dataBuffer.length>2&&dataBuffer.write(data,2)
var self=this
this.messageHandlers.push(function(callback){self.frameAndSend(8,dataBuffer,!0,mask),callback(),"function"==typeof cb&&cb()

}),this.flush()},Sender.prototype.ping=function(data,options){var mask=options&&options.mask,self=this


this.messageHandlers.push(function(callback){self.frameAndSend(9,data||"",!0,mask),callback()}),this.flush()

},Sender.prototype.pong=function(data,options){var mask=options&&options.mask,self=this
this.messageHandlers.push(function(callback){self.frameAndSend(10,data||"",!0,mask),callback()}),this.flush()

},Sender.prototype.send=function(data,options,cb){var finalFragment=!options||options.fin!==!1,mask=options&&options.mask,compress=options&&options.compress,opcode=options&&options.binary?2:1


this.firstFragment===!1?(opcode=0,compress=!1):(this.firstFragment=!1,this.compress=compress),finalFragment&&(this.firstFragment=!0)


var compressFragment=this.compress,self=this
this.messageHandlers.push(function(callback){self.applyExtensions(data,finalFragment,compressFragment,function(err,data){
return err?void("function"==typeof cb?cb(err):self.emit("error",err)):(self.frameAndSend(opcode,data,finalFragment,mask,compress,cb),
void callback())})}),this.flush()},Sender.prototype.frameAndSend=function(opcode,data,finalFragment,maskData,compressed,cb){
var canModifyData=!1
if(data){Buffer.isBuffer(data)||(canModifyData=!0,!data||"undefined"==typeof data.byteLength&&"undefined"==typeof data.buffer?("number"==typeof data&&(data=data.toString()),
data=new Buffer(data)):data=getArrayBuffer(data))
var dataLength=data.length,dataOffset=maskData?6:2,secondByte=dataLength
dataLength>=65536?(dataOffset+=8,secondByte=127):dataLength>125&&(dataOffset+=2,secondByte=126)
var mergeBuffers=dataLength<32768||maskData&&!canModifyData,totalLength=mergeBuffers?dataLength+dataOffset:dataOffset,outputBuffer=new Buffer(totalLength)


switch(outputBuffer[0]=finalFragment?128|opcode:opcode,compressed&&(outputBuffer[0]|=64),secondByte){
case 126:writeUInt16BE.call(outputBuffer,dataLength,2)
break
case 127:writeUInt32BE.call(outputBuffer,0,2),writeUInt32BE.call(outputBuffer,dataLength,6)}if(maskData){
outputBuffer[1]=128|secondByte
var mask=this._randomMask||(this._randomMask=getRandomMask())
if(outputBuffer[dataOffset-4]=mask[0],outputBuffer[dataOffset-3]=mask[1],outputBuffer[dataOffset-2]=mask[2],
outputBuffer[dataOffset-1]=mask[3],mergeBuffers){bufferUtil.mask(data,mask,outputBuffer,dataOffset,dataLength)


try{this._socket.write(outputBuffer,"binary",cb)}catch(e){"function"==typeof cb?cb(e):this.emit("error",e)

}}else{bufferUtil.mask(data,mask,data,0,dataLength)
try{this._socket.write(outputBuffer,"binary"),this._socket.write(data,"binary",cb)}catch(e){"function"==typeof cb?cb(e):this.emit("error",e)

}}}else if(outputBuffer[1]=secondByte,mergeBuffers){data.copy(outputBuffer,dataOffset)
try{this._socket.write(outputBuffer,"binary",cb)}catch(e){"function"==typeof cb?cb(e):this.emit("error",e)

}}else try{this._socket.write(outputBuffer,"binary"),this._socket.write(data,"binary",cb)}catch(e){"function"==typeof cb?cb(e):this.emit("error",e)

}}else try{this._socket.write(new Buffer([opcode|(finalFragment?128:0),0|(maskData?128:0)].concat(maskData?[0,0,0,0]:[])),"binary",cb)

}catch(e){"function"==typeof cb?cb(e):this.emit("error",e)}},Sender.prototype.flush=function(){if(!this.processing){
var handler=this.messageHandlers.shift()
if(handler){this.processing=!0
var self=this
handler(function(){self.processing=!1,process.nextTick(function(){self.flush()})})}}},Sender.prototype.applyExtensions=function(data,fin,compress,callback){
compress&&data?((data.buffer||data)instanceof ArrayBuffer&&(data=getArrayBuffer(data)),this.extensions[PerMessageDeflate.extensionName].compress(data,fin,callback)):callback(null,data)

},module.exports=Sender})


define("ws/lib/Validation.fallback",[],function(require,exports,module){module.exports.Validation={isValidUTF8:function(buffer){
return!0}}})


define("ws/lib/Validation",[],function(require,exports,module){"use strict"
try{module.exports=require("utf-8-validate")}catch(e){module.exports=require("./Validation.fallback")

}})


define("ws/lib/BufferPool",[],function(require,exports,module){function BufferPool(initialSize,growStrategy,shrinkStrategy){
if(this instanceof BufferPool==!1)throw new TypeError("Classes can't be function-called")
"function"==typeof initialSize?(shrinkStrategy=growStrategy,growStrategy=initialSize,initialSize=0):"undefined"==typeof initialSize&&(initialSize=0),
this._growStrategy=(growStrategy||function(db,size){return db.used+size}).bind(null,this),this._shrinkStrategy=(shrinkStrategy||function(db){
return initialSize}).bind(null,this),this._buffer=initialSize?new Buffer(initialSize):null,this._offset=0,
this._used=0,this._changeFactor=0,this.__defineGetter__("size",function(){return null==this._buffer?0:this._buffer.length

}),this.__defineGetter__("used",function(){return this._used})}require("util")
BufferPool.prototype.get=function(length){if(null==this._buffer||this._offset+length>this._buffer.length){
var newBuf=new Buffer(this._growStrategy(length))
this._buffer=newBuf,this._offset=0}this._used+=length
var buf=this._buffer.slice(this._offset,this._offset+length)
return this._offset+=length,buf},BufferPool.prototype.reset=function(forceNewBuffer){var len=this._shrinkStrategy()


len<this.size&&(this._changeFactor-=1),(forceNewBuffer||this._changeFactor<-2)&&(this._changeFactor=0,
this._buffer=len?new Buffer(len):null),this._offset=0,this._used=0},module.exports=BufferPool})


define("ws/lib/Receiver",[],function(require,exports,module){function Receiver(extensions){if(this instanceof Receiver==!1)throw new TypeError("Classes can't be function-called")


var fragmentedPoolPrevUsed=-1
this.fragmentedBufferPool=new BufferPool(1024,function(db,length){return db.used+length},function(db){
return fragmentedPoolPrevUsed=fragmentedPoolPrevUsed>=0?Math.ceil((fragmentedPoolPrevUsed+db.used)/2):db.used

})
var unfragmentedPoolPrevUsed=-1
this.unfragmentedBufferPool=new BufferPool(1024,function(db,length){return db.used+length},function(db){
return unfragmentedPoolPrevUsed=unfragmentedPoolPrevUsed>=0?Math.ceil((unfragmentedPoolPrevUsed+db.used)/2):db.used

}),this.extensions=extensions||{},this.state={activeFragmentedOperation:null,lastFragment:!1,masked:!1,
opcode:0,fragmentedOperation:!1},this.overflow=[],this.headerBuffer=new Buffer(10),this.expectOffset=0,
this.expectBuffer=null,this.expectHandler=null,this.currentMessage=[],this.messageHandlers=[],this.expectHeader(2,this.processPacket),
this.dead=!1,this.processing=!1,this.onerror=function(){},this.ontext=function(){},this.onbinary=function(){},
this.onclose=function(){},this.onping=function(){},this.onpong=function(){}}function readUInt16BE(start){
return(this[start]<<8)+this[start+1]}function readUInt32BE(start){return(this[start]<<24)+(this[start+1]<<16)+(this[start+2]<<8)+this[start+3]

}function fastCopy(length,srcBuffer,dstBuffer,dstOffset){switch(length){default:srcBuffer.copy(dstBuffer,dstOffset,0,length)


break
case 16:dstBuffer[dstOffset+15]=srcBuffer[15]
case 15:dstBuffer[dstOffset+14]=srcBuffer[14]
case 14:dstBuffer[dstOffset+13]=srcBuffer[13]
case 13:dstBuffer[dstOffset+12]=srcBuffer[12]
case 12:dstBuffer[dstOffset+11]=srcBuffer[11]
case 11:dstBuffer[dstOffset+10]=srcBuffer[10]
case 10:dstBuffer[dstOffset+9]=srcBuffer[9]
case 9:dstBuffer[dstOffset+8]=srcBuffer[8]
case 8:dstBuffer[dstOffset+7]=srcBuffer[7]
case 7:dstBuffer[dstOffset+6]=srcBuffer[6]
case 6:dstBuffer[dstOffset+5]=srcBuffer[5]
case 5:dstBuffer[dstOffset+4]=srcBuffer[4]
case 4:dstBuffer[dstOffset+3]=srcBuffer[3]
case 3:dstBuffer[dstOffset+2]=srcBuffer[2]
case 2:dstBuffer[dstOffset+1]=srcBuffer[1]
case 1:dstBuffer[dstOffset]=srcBuffer[0]}}function clone(obj){var cloned={}
for(var k in obj)obj.hasOwnProperty(k)&&(cloned[k]=obj[k])
return cloned}var Validation=(require("util"),require("./Validation").Validation),ErrorCodes=require("./ErrorCodes"),BufferPool=require("./BufferPool"),bufferUtil=require("./BufferUtil").BufferUtil,PerMessageDeflate=require("./PerMessageDeflate")


module.exports=Receiver,Receiver.prototype.add=function(data){var dataLength=data.length
if(0!=dataLength){if(null==this.expectBuffer)return void this.overflow.push(data)
var toRead=Math.min(dataLength,this.expectBuffer.length-this.expectOffset)
for(fastCopy(toRead,data,this.expectBuffer,this.expectOffset),this.expectOffset+=toRead,toRead<dataLength&&this.overflow.push(data.slice(toRead));this.expectBuffer&&this.expectOffset==this.expectBuffer.length;){
var bufferForHandler=this.expectBuffer
this.expectBuffer=null,this.expectOffset=0,this.expectHandler.call(this,bufferForHandler)}}},Receiver.prototype.cleanup=function(){
this.dead=!0,this.overflow=null,this.headerBuffer=null,this.expectBuffer=null,this.expectHandler=null,
this.unfragmentedBufferPool=null,this.fragmentedBufferPool=null,this.state=null,this.currentMessage=null,
this.onerror=null,this.ontext=null,this.onbinary=null,this.onclose=null,this.onping=null,this.onpong=null

},Receiver.prototype.expectHeader=function(length,handler){if(0==length)return void handler(null)
this.expectBuffer=this.headerBuffer.slice(this.expectOffset,this.expectOffset+length),this.expectHandler=handler


for(var toRead=length;toRead>0&&this.overflow.length>0;){var fromOverflow=this.overflow.pop()
toRead<fromOverflow.length&&this.overflow.push(fromOverflow.slice(toRead))
var read=Math.min(fromOverflow.length,toRead)
fastCopy(read,fromOverflow,this.expectBuffer,this.expectOffset),this.expectOffset+=read,toRead-=read}
},Receiver.prototype.expectData=function(length,handler){if(0==length)return void handler(null)
this.expectBuffer=this.allocateFromPool(length,this.state.fragmentedOperation),this.expectHandler=handler


for(var toRead=length;toRead>0&&this.overflow.length>0;){var fromOverflow=this.overflow.pop()
toRead<fromOverflow.length&&this.overflow.push(fromOverflow.slice(toRead))
var read=Math.min(fromOverflow.length,toRead)
fastCopy(read,fromOverflow,this.expectBuffer,this.expectOffset),this.expectOffset+=read,toRead-=read}
},Receiver.prototype.allocateFromPool=function(length,isFragmented){return(isFragmented?this.fragmentedBufferPool:this.unfragmentedBufferPool).get(length)

},Receiver.prototype.processPacket=function(data){if(this.extensions[PerMessageDeflate.extensionName]){
if(0!=(48&data[0]))return void this.error("reserved fields (2, 3) must be empty",1002)}else if(0!=(112&data[0]))return void this.error("reserved fields must be empty",1002)


this.state.lastFragment=128==(128&data[0]),this.state.masked=128==(128&data[1])
var compressed=64==(64&data[0]),opcode=15&data[0]
if(0===opcode){if(compressed)return void this.error("continuation frame cannot have the Per-message Compressed bits",1002)


if(this.state.fragmentedOperation=!0,this.state.opcode=this.state.activeFragmentedOperation,1!=this.state.opcode&&2!=this.state.opcode)return void this.error("continuation frame cannot follow current opcode",1002)

}else{if(opcode<3&&null!=this.state.activeFragmentedOperation)return void this.error("data frames after the initial data frame must have opcode 0",1002)


if(opcode>=8&&compressed)return void this.error("control frames cannot have the Per-message Compressed bits",1002)


this.state.compressed=compressed,this.state.opcode=opcode,this.state.lastFragment===!1?(this.state.fragmentedOperation=!0,
this.state.activeFragmentedOperation=opcode):this.state.fragmentedOperation=!1}var handler=opcodes[this.state.opcode]


"undefined"==typeof handler?this.error("no handler for opcode "+this.state.opcode,1002):handler.start.call(this,data)

},Receiver.prototype.endPacket=function(){this.state.fragmentedOperation?this.state.lastFragment&&this.fragmentedBufferPool.reset(!0):this.unfragmentedBufferPool.reset(!0),
this.expectOffset=0,this.expectBuffer=null,this.expectHandler=null,this.state.lastFragment&&this.state.opcode===this.state.activeFragmentedOperation&&(this.state.activeFragmentedOperation=null),
this.state.lastFragment=!1,this.state.opcode=null!=this.state.activeFragmentedOperation?this.state.activeFragmentedOperation:0,
this.state.masked=!1,this.expectHeader(2,this.processPacket)},Receiver.prototype.reset=function(){this.dead||(this.state={
activeFragmentedOperation:null,lastFragment:!1,masked:!1,opcode:0,fragmentedOperation:!1},this.fragmentedBufferPool.reset(!0),
this.unfragmentedBufferPool.reset(!0),this.expectOffset=0,this.expectBuffer=null,this.expectHandler=null,
this.overflow=[],this.currentMessage=[],this.messageHandlers=[])},Receiver.prototype.unmask=function(mask,buf,binary){
return null!=mask&&null!=buf&&bufferUtil.unmask(buf,mask),binary?buf:null!=buf?buf.toString("utf8"):""

},Receiver.prototype.concatBuffers=function(buffers){for(var length=0,i=0,l=buffers.length;i<l;++i)length+=buffers[i].length


var mergedBuffer=new Buffer(length)
return bufferUtil.merge(mergedBuffer,buffers),mergedBuffer},Receiver.prototype.error=function(reason,protocolErrorCode){
return this.reset(),this.onerror(reason,protocolErrorCode),this},Receiver.prototype.flush=function(){
if(!this.processing&&!this.dead){var handler=this.messageHandlers.shift()
if(handler){this.processing=!0
var self=this
handler(function(){self.processing=!1,self.flush()})}}},Receiver.prototype.applyExtensions=function(messageBuffer,fin,compressed,callback){
var self=this
compressed?this.extensions[PerMessageDeflate.extensionName].decompress(messageBuffer,fin,function(err,buffer){
if(!self.dead)return err?void callback(new Error("invalid compressed data")):void callback(null,buffer)

}):callback(null,messageBuffer)}
var opcodes={1:{start:function(data){var self=this,firstLength=127&data[1]
firstLength<126?opcodes[1].getData.call(self,firstLength):126==firstLength?self.expectHeader(2,function(data){
opcodes[1].getData.call(self,readUInt16BE.call(data,0))}):127==firstLength&&self.expectHeader(8,function(data){
return 0!=readUInt32BE.call(data,0)?void self.error("packets with length spanning more than 32 bit is currently not supported",1008):void opcodes[1].getData.call(self,readUInt32BE.call(data,4))

})},getData:function(length){var self=this
self.state.masked?self.expectHeader(4,function(data){var mask=data
self.expectData(length,function(data){opcodes[1].finish.call(self,mask,data)})}):self.expectData(length,function(data){
opcodes[1].finish.call(self,null,data)})},finish:function(mask,data){var self=this,packet=this.unmask(mask,data,!0)||new Buffer(0),state=clone(this.state)


this.messageHandlers.push(function(callback){self.applyExtensions(packet,state.lastFragment,state.compressed,function(err,buffer){
if(err)return self.error(err.message,1007)
if(null!=buffer&&self.currentMessage.push(buffer),state.lastFragment){var messageBuffer=self.concatBuffers(self.currentMessage)


if(self.currentMessage=[],!Validation.isValidUTF8(messageBuffer))return void self.error("invalid utf8 sequence",1007)


self.ontext(messageBuffer.toString("utf8"),{masked:state.masked,buffer:messageBuffer})}callback()})}),
this.flush(),this.endPacket()}},2:{start:function(data){var self=this,firstLength=127&data[1]
firstLength<126?opcodes[2].getData.call(self,firstLength):126==firstLength?self.expectHeader(2,function(data){
opcodes[2].getData.call(self,readUInt16BE.call(data,0))}):127==firstLength&&self.expectHeader(8,function(data){
return 0!=readUInt32BE.call(data,0)?void self.error("packets with length spanning more than 32 bit is currently not supported",1008):void opcodes[2].getData.call(self,readUInt32BE.call(data,4,!0))

})},getData:function(length){var self=this
self.state.masked?self.expectHeader(4,function(data){var mask=data
self.expectData(length,function(data){opcodes[2].finish.call(self,mask,data)})}):self.expectData(length,function(data){
opcodes[2].finish.call(self,null,data)})},finish:function(mask,data){var self=this,packet=this.unmask(mask,data,!0)||new Buffer(0),state=clone(this.state)


this.messageHandlers.push(function(callback){self.applyExtensions(packet,state.lastFragment,state.compressed,function(err,buffer){
if(err)return self.error(err.message,1007)
if(null!=buffer&&self.currentMessage.push(buffer),state.lastFragment){var messageBuffer=self.concatBuffers(self.currentMessage)


self.currentMessage=[],self.onbinary(messageBuffer,{masked:state.masked,buffer:messageBuffer})}callback()

})}),this.flush(),this.endPacket()}},8:{start:function(data){var self=this
if(0==self.state.lastFragment)return void self.error("fragmented close is not supported",1002)
var firstLength=127&data[1]
firstLength<126?opcodes[8].getData.call(self,firstLength):self.error("control frames cannot have more than 125 bytes of data",1002)

},getData:function(length){var self=this
self.state.masked?self.expectHeader(4,function(data){var mask=data
self.expectData(length,function(data){opcodes[8].finish.call(self,mask,data)})}):self.expectData(length,function(data){
opcodes[8].finish.call(self,null,data)})},finish:function(mask,data){var self=this
data=self.unmask(mask,data,!0)
var state=clone(this.state)
this.messageHandlers.push(function(){if(data&&1==data.length)return void self.error("close packets with data must be at least two bytes long",1002)


var code=data&&data.length>1?readUInt16BE.call(data,0):1e3
if(!ErrorCodes.isValidErrorCode(code))return void self.error("invalid error code",1002)
var message=""
if(data&&data.length>2){var messageBuffer=data.slice(2)
if(!Validation.isValidUTF8(messageBuffer))return void self.error("invalid utf8 sequence",1007)
message=messageBuffer.toString("utf8")}self.onclose(code,message,{masked:state.masked}),self.reset()}),
this.flush()}},9:{start:function(data){var self=this
if(0==self.state.lastFragment)return void self.error("fragmented ping is not supported",1002)
var firstLength=127&data[1]
firstLength<126?opcodes[9].getData.call(self,firstLength):self.error("control frames cannot have more than 125 bytes of data",1002)

},getData:function(length){var self=this
self.state.masked?self.expectHeader(4,function(data){var mask=data
self.expectData(length,function(data){opcodes[9].finish.call(self,mask,data)})}):self.expectData(length,function(data){
opcodes[9].finish.call(self,null,data)})},finish:function(mask,data){var self=this
data=this.unmask(mask,data,!0)
var state=clone(this.state)
this.messageHandlers.push(function(callback){self.onping(data,{masked:state.masked,binary:!0}),callback()

}),this.flush(),this.endPacket()}},10:{start:function(data){var self=this
if(0==self.state.lastFragment)return void self.error("fragmented pong is not supported",1002)
var firstLength=127&data[1]
firstLength<126?opcodes[10].getData.call(self,firstLength):self.error("control frames cannot have more than 125 bytes of data",1002)

},getData:function(length){var self=this
this.state.masked?this.expectHeader(4,function(data){var mask=data
self.expectData(length,function(data){opcodes[10].finish.call(self,mask,data)})}):this.expectData(length,function(data){
opcodes[10].finish.call(self,null,data)})},finish:function(mask,data){var self=this
data=self.unmask(mask,data,!0)
var state=clone(this.state)
this.messageHandlers.push(function(callback){self.onpong(data,{masked:state.masked,binary:!0}),callback()

}),this.flush(),this.endPacket()}}}})


define("ws/lib/Sender.hixie",[],function(require,exports,module){function Sender(socket){if(this instanceof Sender==!1)throw new TypeError("Classes can't be function-called")


events.EventEmitter.call(this),this.socket=socket,this.continuationFrame=!1,this.isClosed=!1}var events=require("events"),util=require("util")


events.EventEmitter
module.exports=Sender,util.inherits(Sender,events.EventEmitter),Sender.prototype.send=function(data,options,cb){
if(!this.isClosed){var isString="string"==typeof data,length=isString?Buffer.byteLength(data):data.length,lengthbytes=length>127?2:1,writeStartMarker=0==this.continuationFrame,writeEndMarker=!options||!("undefined"!=typeof options.fin&&!options.fin),buffer=new Buffer((writeStartMarker?options&&options.binary?1+lengthbytes:1:0)+length+(!writeEndMarker||options&&options.binary?0:1)),offset=writeStartMarker?1:0


writeStartMarker&&(options&&options.binary?(buffer.write("\x80","binary"),lengthbytes>1&&buffer.write(String.fromCharCode(128+length/128),offset++,"binary"),
buffer.write(String.fromCharCode(127&length),offset++,"binary")):buffer.write("\0","binary")),isString?buffer.write(data,offset,"utf8"):data.copy(buffer,offset,0),
writeEndMarker?(options&&options.binary||buffer.write("\xff",offset+length,"binary"),this.continuationFrame=!1):this.continuationFrame=!0


try{this.socket.write(buffer,"binary",cb)}catch(e){this.error(e.toString())}}},Sender.prototype.close=function(code,data,mask,cb){
if(!this.isClosed){this.isClosed=!0
try{this.continuationFrame&&this.socket.write(new Buffer([255],"binary")),this.socket.write(new Buffer([255,0]),"binary",cb)

}catch(e){this.error(e.toString())}}},Sender.prototype.ping=function(data,options){},Sender.prototype.pong=function(data,options){},
Sender.prototype.error=function(reason){return this.emit("error",reason),this}})


define("ws/lib/Receiver.hixie",[],function(require,exports,module){function Receiver(){if(this instanceof Receiver==!1)throw new TypeError("Classes can't be function-called")


this.state=EMPTY,this.buffers=[],this.messageEnd=-1,this.spanLength=0,this.dead=!1,this.onerror=function(){},
this.ontext=function(){},this.onbinary=function(){},this.onclose=function(){},this.onping=function(){},
this.onpong=function(){}}function bufferIndex(buffer,byte){for(var i=0,l=buffer.length;i<l;++i)if(buffer[i]===byte)return i


return-1}var EMPTY=(require("util"),0),BODY=1,BINARYLENGTH=2,BINARYBODY=3
module.exports=Receiver,Receiver.prototype.add=function(data){function doAdd(){if(self.state===EMPTY){
if(2==data.length&&255==data[0]&&0==data[1])return self.reset(),void self.onclose()
if(128===data[0])self.messageEnd=0,self.state=BINARYLENGTH,data=data.slice(1)
else{if(0!==data[0])return void self.error("payload must start with 0x00 byte",!0)
data=data.slice(1),self.state=BODY}}if(self.state===BINARYLENGTH){for(var i=0;i<data.length&&128&data[i];)self.messageEnd=128*self.messageEnd+(127&data[i]),
++i
i<data.length&&(self.messageEnd=128*self.messageEnd+(127&data[i]),self.state=BINARYBODY,++i),i>0&&(data=data.slice(i))

}if(self.state===BINARYBODY){var dataleft=self.messageEnd-self.spanLength
return data.length>=dataleft?(self.buffers.push(data),self.spanLength+=dataleft,self.messageEnd=dataleft,
self.parse()):(self.buffers.push(data),void(self.spanLength+=data.length))}return self.buffers.push(data),
(self.messageEnd=bufferIndex(data,255))!=-1?(self.spanLength+=self.messageEnd,self.parse()):void(self.spanLength+=data.length)

}for(var self=this;data;)data=doAdd()},Receiver.prototype.cleanup=function(){this.dead=!0,this.state=EMPTY,
this.buffers=[]},Receiver.prototype.parse=function(){for(var output=new Buffer(this.spanLength),outputIndex=0,bi=0,bl=this.buffers.length;bi<bl-1;++bi){
var buffer=this.buffers[bi]
buffer.copy(output,outputIndex),outputIndex+=buffer.length}var lastBuffer=this.buffers[this.buffers.length-1]


this.messageEnd>0&&lastBuffer.copy(output,outputIndex,0,this.messageEnd),this.state!==BODY&&--this.messageEnd


var tail=null
return this.messageEnd<lastBuffer.length-1&&(tail=lastBuffer.slice(this.messageEnd+1)),this.reset(),this.ontext(output.toString("utf8")),
tail},Receiver.prototype.error=function(reason,terminate){return this.reset(),this.onerror(reason,terminate),
this},Receiver.prototype.reset=function(reason){this.dead||(this.state=EMPTY,this.buffers=[],this.messageEnd=-1,
this.spanLength=0)}})


define("ws/lib/Extensions",[],function(require,exports,module){function parse(value){value=value||""
var extensions={}
return value.split(",").forEach(function(v){var params=v.split(";"),token=params.shift().trim(),paramsList=extensions[token]=extensions[token]||[],parsedParams={}


params.forEach(function(param){var parts=param.trim().split("="),key=parts[0],value=parts[1]
"undefined"==typeof value?value=!0:('"'===value[0]&&(value=value.slice(1)),'"'===value[value.length-1]&&(value=value.slice(0,value.length-1))),
(parsedParams[key]=parsedParams[key]||[]).push(value)}),paramsList.push(parsedParams)}),extensions}function format(value){
return Object.keys(value).map(function(token){var paramsList=value[token]
return util.isArray(paramsList)||(paramsList=[paramsList]),paramsList.map(function(params){return[token].concat(Object.keys(params).map(function(k){
var p=params[k]
return util.isArray(p)||(p=[p]),p.map(function(v){return v===!0?k:k+"="+v}).join("; ")})).join("; ")}).join(", ")

}).join(", ")}var util=require("util")
exports.parse=parse,exports.format=format})


define("ws/lib/WebSocket",[],function(require,exports,module){"use strict"
function WebSocket(address,protocols,options){return this instanceof WebSocket==!1?new WebSocket(address,protocols,options):(EventEmitter.call(this),
protocols&&!Array.isArray(protocols)&&"object"==typeof protocols&&(options=protocols,protocols=null),
"string"==typeof protocols&&(protocols=[protocols]),Array.isArray(protocols)||(protocols=[]),this._socket=null,
this._ultron=null,this._closeReceived=!1,this.bytesReceived=0,this.readyState=null,this.supports={},this.extensions={},
void(Array.isArray(address)?initAsServerClient.apply(this,address.concat(options)):initAsClient.apply(this,[address,protocols,options])))

}function MessageEvent(dataArg,isBinary,target){this.type="message",this.data=dataArg,this.target=target,
this.binary=isBinary}function CloseEvent(code,reason,target){this.type="close",this.wasClean="undefined"==typeof code||1e3===code,
this.code=code,this.reason=reason,this.target=target}function OpenEvent(target){this.type="open",this.target=target

}function buildHostHeader(isSecure,hostname,port){var headerHost=hostname
return hostname&&(isSecure&&443!=port||!isSecure&&80!=port)&&(headerHost=headerHost+":"+port),headerHost

}function initAsServerClient(req,socket,upgradeHead,options){options=new Options({protocolVersion:protocolVersion,
protocol:null,extensions:{}}).merge(options),this.protocol=options.value.protocol,this.protocolVersion=options.value.protocolVersion,
this.extensions=options.value.extensions,this.supports.binary="hixie-76"!==this.protocolVersion,this.upgradeReq=req,
this.readyState=WebSocket.CONNECTING,this._isServer=!0,"hixie-76"===options.value.protocolVersion?establishConnection.call(this,ReceiverHixie,SenderHixie,socket,upgradeHead):establishConnection.call(this,Receiver,Sender,socket,upgradeHead)

}function initAsClient(address,protocols,options){if(options=new Options({origin:null,protocolVersion:protocolVersion,
host:null,headers:null,protocol:protocols.join(","),agent:null,pfx:null,key:null,passphrase:null,cert:null,
ca:null,ciphers:null,rejectUnauthorized:null,perMessageDeflate:!0,localAddress:null}).merge(options),
8!==options.value.protocolVersion&&13!==options.value.protocolVersion)throw new Error("unsupported protocol version")


var serverUrl=url.parse(address),isUnixSocket="ws+unix:"===serverUrl.protocol
if(!serverUrl.host&&!isUnixSocket)throw new Error("invalid url")
var perMessageDeflate,isSecure="wss:"===serverUrl.protocol||"https:"===serverUrl.protocol,httpObj=isSecure?https:http,port=serverUrl.port||(isSecure?443:80),auth=serverUrl.auth,extensionsOffer={}


options.value.perMessageDeflate&&(perMessageDeflate=new PerMessageDeflate(typeof options.value.perMessageDeflate!==!0?options.value.perMessageDeflate:{},(!1)),
extensionsOffer[PerMessageDeflate.extensionName]=perMessageDeflate.offer()),this._isServer=!1,this.url=address,
this.protocolVersion=options.value.protocolVersion,this.supports.binary="hixie-76"!==this.protocolVersion


var key=new Buffer(options.value.protocolVersion+"-"+Date.now()).toString("base64"),shasum=crypto.createHash("sha1")


shasum.update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
var expectedServerKey=shasum.digest("base64"),agent=options.value.agent,headerHost=buildHostHeader(isSecure,serverUrl.hostname,port),requestOptions={
port:port,host:serverUrl.hostname,headers:{Connection:"Upgrade",Upgrade:"websocket",Host:headerHost,"Sec-WebSocket-Version":options.value.protocolVersion,
"Sec-WebSocket-Key":key}}
if(auth&&(requestOptions.headers.Authorization="Basic "+new Buffer(auth).toString("base64")),options.value.protocol&&(requestOptions.headers["Sec-WebSocket-Protocol"]=options.value.protocol),
options.value.host&&(requestOptions.headers.Host=options.value.host),options.value.headers)for(var header in options.value.headers)options.value.headers.hasOwnProperty(header)&&(requestOptions.headers[header]=options.value.headers[header])


Object.keys(extensionsOffer).length&&(requestOptions.headers["Sec-WebSocket-Extensions"]=Extensions.format(extensionsOffer)),
(options.isDefinedAndNonNull("pfx")||options.isDefinedAndNonNull("key")||options.isDefinedAndNonNull("passphrase")||options.isDefinedAndNonNull("cert")||options.isDefinedAndNonNull("ca")||options.isDefinedAndNonNull("ciphers")||options.isDefinedAndNonNull("rejectUnauthorized"))&&(options.isDefinedAndNonNull("pfx")&&(requestOptions.pfx=options.value.pfx),
options.isDefinedAndNonNull("key")&&(requestOptions.key=options.value.key),options.isDefinedAndNonNull("passphrase")&&(requestOptions.passphrase=options.value.passphrase),
options.isDefinedAndNonNull("cert")&&(requestOptions.cert=options.value.cert),options.isDefinedAndNonNull("ca")&&(requestOptions.ca=options.value.ca),
options.isDefinedAndNonNull("ciphers")&&(requestOptions.ciphers=options.value.ciphers),options.isDefinedAndNonNull("rejectUnauthorized")&&(requestOptions.rejectUnauthorized=options.value.rejectUnauthorized),
agent||(agent=new httpObj.Agent(requestOptions))),requestOptions.path=serverUrl.path||"/",agent&&(requestOptions.agent=agent),
isUnixSocket&&(requestOptions.socketPath=serverUrl.pathname),options.value.localAddress&&(requestOptions.localAddress=options.value.localAddress),
options.value.origin&&(options.value.protocolVersion<13?requestOptions.headers["Sec-WebSocket-Origin"]=options.value.origin:requestOptions.headers.Origin=options.value.origin)


var self=this,req=httpObj.request(requestOptions)
req.on("error",function(error){self.emit("error",error),cleanupWebsocketResources.call(self,error)}),
req.once("response",function(res){var error
self.emit("unexpected-response",req,res)||(error=new Error("unexpected server response ("+res.statusCode+")"),
req.abort(),self.emit("error",error)),cleanupWebsocketResources.call(self,error)}),req.once("upgrade",function(res,socket,upgradeHead){
if(self.readyState===WebSocket.CLOSED)return self.emit("close"),self.removeAllListeners(),void socket.end()


var serverKey=res.headers["sec-websocket-accept"]
if("undefined"==typeof serverKey||serverKey!==expectedServerKey)return self.emit("error","invalid server key"),
self.removeAllListeners(),void socket.end()
var serverProt=res.headers["sec-websocket-protocol"],protList=(options.value.protocol||"").split(/, */),protError=null


if(!options.value.protocol&&serverProt?protError="server sent a subprotocol even though none requested":options.value.protocol&&!serverProt?protError="server sent no subprotocol even though requested":serverProt&&protList.indexOf(serverProt)===-1&&(protError="server responded with an invalid protocol"),
protError)return self.emit("error",protError),self.removeAllListeners(),void socket.end()
serverProt&&(self.protocol=serverProt)
var serverExtensions=Extensions.parse(res.headers["sec-websocket-extensions"])
if(perMessageDeflate&&serverExtensions[PerMessageDeflate.extensionName]){try{perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName])

}catch(err){return self.emit("error","invalid extension parameter"),self.removeAllListeners(),void socket.end()

}self.extensions[PerMessageDeflate.extensionName]=perMessageDeflate}establishConnection.call(self,Receiver,Sender,socket,upgradeHead),
req.removeAllListeners(),req=null,agent=null}),req.end(),this.readyState=WebSocket.CONNECTING}function establishConnection(ReceiverClass,SenderClass,socket,upgradeHead){
function firstHandler(data){called||self.readyState===WebSocket.CLOSED||(called=!0,socket.removeListener("data",firstHandler),
ultron.on("data",realHandler),upgradeHead&&upgradeHead.length>0&&(realHandler(upgradeHead),upgradeHead=null),
data&&realHandler(data))}function realHandler(data){self.bytesReceived+=data.length,self._receiver.add(data)

}var ultron=this._ultron=new Ultron(socket),called=!1,self=this
socket.setTimeout(0),socket.setNoDelay(!0),this._receiver=new ReceiverClass(this.extensions),this._socket=socket,
ultron.on("end",cleanupWebsocketResources.bind(this)),ultron.on("close",cleanupWebsocketResources.bind(this)),
ultron.on("error",cleanupWebsocketResources.bind(this)),ultron.on("data",firstHandler),process.nextTick(firstHandler),
self._receiver.ontext=function(data,flags){flags=flags||{},self.emit("message",data,flags)},self._receiver.onbinary=function(data,flags){
flags=flags||{},flags.binary=!0,self.emit("message",data,flags)},self._receiver.onping=function(data,flags){
flags=flags||{},self.pong(data,{mask:!self._isServer,binary:flags.binary===!0},!0),self.emit("ping",data,flags)

},self._receiver.onpong=function(data,flags){self.emit("pong",data,flags||{})},self._receiver.onclose=function(code,data,flags){
flags=flags||{},self._closeReceived=!0,self.close(code,data)},self._receiver.onerror=function(reason,errorCode){
self.close("undefined"!=typeof errorCode?errorCode:1002,""),self.emit("error",reason,errorCode)},this._sender=new SenderClass(socket,this.extensions),
this._sender.on("error",function(error){self.close(1002,""),self.emit("error",error)}),this.readyState=WebSocket.OPEN,
this.emit("open")}function startQueue(instance){instance._queue=instance._queue||[]}function executeQueueSends(instance){
var queue=instance._queue
if("undefined"!=typeof queue){delete instance._queue
for(var i=0,l=queue.length;i<l;++i)queue[i]()}}function sendStream(instance,stream,options,cb){stream.on("data",function(data){
return instance.readyState!==WebSocket.OPEN?void("function"==typeof cb?cb(new Error("not opened")):(delete instance._queue,
instance.emit("error",new Error("not opened")))):(options.fin=!1,void instance._sender.send(data,options))

}),stream.on("end",function(){return instance.readyState!==WebSocket.OPEN?void("function"==typeof cb?cb(new Error("not opened")):(delete instance._queue,
instance.emit("error",new Error("not opened")))):(options.fin=!0,instance._sender.send(null,options),
void("function"==typeof cb&&cb(null)))})}function cleanupWebsocketResources(error){if(this.readyState!==WebSocket.CLOSED){
var emitClose=this.readyState!==WebSocket.CONNECTING
if(this.readyState=WebSocket.CLOSED,clearTimeout(this._closeTimer),this._closeTimer=null,emitClose&&(!error&&this._closeReceived||(this._closeCode=1006),
this.emit("close",this._closeCode||1e3,this._closeMessage||"")),this._socket){this._ultron&&this._ultron.destroy(),
this._socket.on("error",function(){try{this.destroy()}catch(e){}})
try{error?this._socket.destroy():this._socket.end()}catch(e){}this._socket=null,this._ultron=null}this._sender&&(this._sender.removeAllListeners(),
this._sender=null),this._receiver&&(this._receiver.cleanup(),this._receiver=null),this.extensions[PerMessageDeflate.extensionName]&&this.extensions[PerMessageDeflate.extensionName].cleanup(),
this.extensions=null,this.removeAllListeners(),this.on("error",function(){}),delete this._queue}}var url=require("url"),util=require("util"),http=require("http"),https=require("https"),crypto=require("crypto"),stream=require("stream"),Ultron=require("ultron"),Options=require("options"),Sender=require("./Sender"),Receiver=require("./Receiver"),SenderHixie=require("./Sender.hixie"),ReceiverHixie=require("./Receiver.hixie"),Extensions=require("./Extensions"),PerMessageDeflate=require("./PerMessageDeflate"),EventEmitter=require("events").EventEmitter,protocolVersion=13,closeTimeout=3e4


util.inherits(WebSocket,EventEmitter),["CONNECTING","OPEN","CLOSING","CLOSED"].forEach(function(state,index){
WebSocket.prototype[state]=WebSocket[state]=index}),WebSocket.prototype.close=function(code,data){if(this.readyState!==WebSocket.CLOSED){
if(this.readyState===WebSocket.CONNECTING)return void(this.readyState=WebSocket.CLOSED)
if(this.readyState===WebSocket.CLOSING)return void(this._closeReceived&&this._isServer&&this.terminate())


var self=this
try{this.readyState=WebSocket.CLOSING,this._closeCode=code,this._closeMessage=data
var mask=!this._isServer
this._sender.close(code,data,mask,function(err){err&&self.emit("error",err),self._closeReceived&&self._isServer?self.terminate():(clearTimeout(self._closeTimer),
self._closeTimer=setTimeout(cleanupWebsocketResources.bind(self,!0),closeTimeout))})}catch(e){this.emit("error",e)

}}},WebSocket.prototype.pause=function(){if(this.readyState!==WebSocket.OPEN)throw new Error("not opened")


return this._socket.pause()},WebSocket.prototype.ping=function(data,options,dontFailWhenClosed){if(this.readyState!==WebSocket.OPEN){
if(dontFailWhenClosed===!0)return
throw new Error("not opened")}options=options||{},"undefined"==typeof options.mask&&(options.mask=!this._isServer),
this._sender.ping(data,options)},WebSocket.prototype.pong=function(data,options,dontFailWhenClosed){if(this.readyState!==WebSocket.OPEN){
if(dontFailWhenClosed===!0)return
throw new Error("not opened")}options=options||{},"undefined"==typeof options.mask&&(options.mask=!this._isServer),
this._sender.pong(data,options)},WebSocket.prototype.resume=function(){if(this.readyState!==WebSocket.OPEN)throw new Error("not opened")


return this._socket.resume()},WebSocket.prototype.send=function(data,options,cb){if("function"==typeof options&&(cb=options,
options={}),this.readyState!==WebSocket.OPEN){if("function"!=typeof cb)throw new Error("not opened")
return void cb(new Error("not opened"))}if(data||(data=""),this._queue){var self=this
return void this._queue.push(function(){self.send(data,options,cb)})}options=options||{},options.fin=!0,
"undefined"==typeof options.binary&&(options.binary=data instanceof ArrayBuffer||data instanceof Buffer||data instanceof Uint8Array||data instanceof Uint16Array||data instanceof Uint32Array||data instanceof Int8Array||data instanceof Int16Array||data instanceof Int32Array||data instanceof Float32Array||data instanceof Float64Array),
"undefined"==typeof options.mask&&(options.mask=!this._isServer),"undefined"==typeof options.compress&&(options.compress=!0),
this.extensions[PerMessageDeflate.extensionName]||(options.compress=!1)
var readable="function"==typeof stream.Readable?stream.Readable:stream.Stream
if(data instanceof readable){startQueue(this)
var self=this
sendStream(this,data,options,function(error){process.nextTick(function(){executeQueueSends(self)}),"function"==typeof cb&&cb(error)

})}else this._sender.send(data,options,cb)},WebSocket.prototype.stream=function(options,cb){function send(data,final){
try{if(self.readyState!==WebSocket.OPEN)throw new Error("not opened")
options.fin=final===!0,self._sender.send(data,options),final?executeQueueSends(self):process.nextTick(cb.bind(null,null,send))

}catch(e){"function"==typeof cb?cb(e):(delete self._queue,self.emit("error",e))}}"function"==typeof options&&(cb=options,
options={})
var self=this
if("function"!=typeof cb)throw new Error("callback must be provided")
if(this.readyState!==WebSocket.OPEN){if("function"!=typeof cb)throw new Error("not opened")
return void cb(new Error("not opened"))}return this._queue?void this._queue.push(function(){self.stream(options,cb)

}):(options=options||{},"undefined"==typeof options.mask&&(options.mask=!this._isServer),"undefined"==typeof options.compress&&(options.compress=!0),
this.extensions[PerMessageDeflate.extensionName]||(options.compress=!1),startQueue(this),void process.nextTick(cb.bind(null,null,send)))

},WebSocket.prototype.terminate=function(){if(this.readyState!==WebSocket.CLOSED)if(this._socket){this.readyState=WebSocket.CLOSING


try{this._socket.end()}catch(e){return void cleanupWebsocketResources.call(this,!0)}this._closeTimer&&clearTimeout(this._closeTimer),
this._closeTimer=setTimeout(cleanupWebsocketResources.bind(this,!0),closeTimeout)}else this.readyState===WebSocket.CONNECTING&&cleanupWebsocketResources.call(this,!0)

},Object.defineProperty(WebSocket.prototype,"bufferedAmount",{get:function(){var amount=0
return this._socket&&(amount=this._socket.bufferSize||0),amount}}),["open","error","close","message"].forEach(function(method){
Object.defineProperty(WebSocket.prototype,"on"+method,{get:function(){var listener=this.listeners(method)[0]


return listener?listener._listener?listener._listener:listener:void 0},set:function(listener){this.removeAllListeners(method),
this.addEventListener(method,listener)}})}),WebSocket.prototype.addEventListener=function(method,listener){
function onMessage(data,flags){listener.call(target,new MessageEvent(data,(!!flags.binary),target))}function onClose(code,message){
listener.call(target,new CloseEvent(code,message,target))}function onError(event){event.type="error",
event.target=target,listener.call(target,event)}function onOpen(){listener.call(target,new OpenEvent(target))

}var target=this
"function"==typeof listener&&("message"===method?(onMessage._listener=listener,this.on(method,onMessage)):"close"===method?(onClose._listener=listener,
this.on(method,onClose)):"error"===method?(onError._listener=listener,this.on(method,onError)):"open"===method?(onOpen._listener=listener,
this.on(method,onOpen)):this.on(method,listener))},module.exports=WebSocket,module.exports.buildHostHeader=buildHostHeader

})


define("ws/lib/WebSocketServer",[],function(require,exports,module){function WebSocketServer(options,callback){
if(this instanceof WebSocketServer==!1)return new WebSocketServer(options,callback)
if(events.EventEmitter.call(this),options=new Options({host:"0.0.0.0",port:null,server:null,verifyClient:null,
handleProtocols:null,path:null,noServer:!1,disableHixie:!1,clientTracking:!0,perMessageDeflate:!0}).merge(options),
!options.isDefinedAndNonNull("port")&&!options.isDefinedAndNonNull("server")&&!options.value.noServer)throw new TypeError("`port` or a `server` must be provided")


var self=this
if(options.isDefinedAndNonNull("port"))this._server=http.createServer(function(req,res){var body=http.STATUS_CODES[426]


res.writeHead(426,{"Content-Length":body.length,"Content-Type":"text/plain"}),res.end(body)}),this._server.allowHalfOpen=!1,
this._server.listen(options.value.port,options.value.host,callback),this._closeServer=function(){self._server&&self._server.close()

}
else if(options.value.server&&(this._server=options.value.server,options.value.path)){if(this._server._webSocketPaths&&options.value.server._webSocketPaths[options.value.path])throw new Error("two instances of WebSocketServer cannot listen on the same http server path")


"object"!=typeof this._server._webSocketPaths&&(this._server._webSocketPaths={}),this._server._webSocketPaths[options.value.path]=1

}this._server&&this._server.once("listening",function(){self.emit("listening")}),"undefined"!=typeof this._server&&(this._server.on("error",function(error){
self.emit("error",error)}),this._server.on("upgrade",function(req,socket,upgradeHead){var head=new Buffer(upgradeHead.length)


upgradeHead.copy(head),self.handleUpgrade(req,socket,head,function(client){self.emit("connection"+req.url,client),
self.emit("connection",client)})})),this.options=options.value,this.path=options.value.path,this.clients=[]

}function handleHybiUpgrade(req,socket,upgradeHead,cb){var errorHandler=function(){try{socket.destroy()

}catch(e){}}
if(socket.on("error",errorHandler),!req.headers["sec-websocket-key"])return void abortConnection(socket,400,"Bad Request")


var version=parseInt(req.headers["sec-websocket-version"])
if([8,13].indexOf(version)===-1)return void abortConnection(socket,400,"Bad Request")
var protocols=req.headers["sec-websocket-protocol"],origin=version<13?req.headers["sec-websocket-origin"]:req.headers.origin,extensionsOffer=Extensions.parse(req.headers["sec-websocket-extensions"]),self=this,completeHybiUpgrade2=function(protocol){
var key=req.headers["sec-websocket-key"],shasum=crypto.createHash("sha1")
shasum.update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"),key=shasum.digest("base64")
var headers=["HTTP/1.1 101 Switching Protocols","Upgrade: websocket","Connection: Upgrade","Sec-WebSocket-Accept: "+key]


"undefined"!=typeof protocol&&headers.push("Sec-WebSocket-Protocol: "+protocol)
var extensions={}
try{extensions=acceptExtensions.call(self,extensionsOffer)}catch(err){return void abortConnection(socket,400,"Bad Request")

}if(Object.keys(extensions).length){var serverExtensions={}
Object.keys(extensions).forEach(function(token){serverExtensions[token]=[extensions[token].params]}),
headers.push("Sec-WebSocket-Extensions: "+Extensions.format(serverExtensions))}self.emit("headers",headers),
socket.setTimeout(0),socket.setNoDelay(!0)
try{socket.write(headers.concat("","").join("\r\n"))}catch(e){try{socket.destroy()}catch(e){}return}var client=new WebSocket([req,socket,upgradeHead],{
protocolVersion:version,protocol:protocol,extensions:extensions})
self.options.clientTracking&&(self.clients.push(client),client.on("close",function(){var index=self.clients.indexOf(client)


index!=-1&&self.clients.splice(index,1)})),socket.removeListener("error",errorHandler),cb(client)},completeHybiUpgrade1=function(){
if("function"==typeof self.options.handleProtocols){var protList=(protocols||"").split(/, */),callbackCalled=!1


self.options.handleProtocols(protList,function(result,protocol){callbackCalled=!0,result?completeHybiUpgrade2(protocol):abortConnection(socket,401,"Unauthorized")

})
return void(callbackCalled||abortConnection(socket,501,"Could not process protocols"))}"undefined"!=typeof protocols?completeHybiUpgrade2(protocols.split(/, */)[0]):completeHybiUpgrade2()

}
if("function"==typeof this.options.verifyClient){var info={origin:origin,secure:"undefined"!=typeof req.connection.authorized||"undefined"!=typeof req.connection.encrypted,
req:req}
if(2==this.options.verifyClient.length)return void this.options.verifyClient(info,function(result,code,name){
"undefined"==typeof code&&(code=401),"undefined"==typeof name&&(name=http.STATUS_CODES[code]),result?completeHybiUpgrade1():abortConnection(socket,code,name)

})
if(!this.options.verifyClient(info))return void abortConnection(socket,401,"Unauthorized")}completeHybiUpgrade1()

}function handleHixieUpgrade(req,socket,upgradeHead,cb){var errorHandler=function(){try{socket.destroy()

}catch(e){}}
if(socket.on("error",errorHandler),this.options.disableHixie)return void abortConnection(socket,401,"Hixie support disabled")


if(!req.headers["sec-websocket-key2"])return void abortConnection(socket,400,"Bad Request")
var origin=req.headers.origin,self=this,onClientVerified=function(){var wshost
wshost=req.headers["x-forwarded-host"]?req.headers["x-forwarded-host"]:req.headers.host
var location=("https"===req.headers["x-forwarded-proto"]||socket.encrypted?"wss":"ws")+"://"+wshost+req.url,protocol=req.headers["sec-websocket-protocol"],completeHandshake=function(nonce,rest){
var k1=req.headers["sec-websocket-key1"],k2=req.headers["sec-websocket-key2"],md5=crypto.createHash("md5")

;[k1,k2].forEach(function(k){var n=parseInt(k.replace(/[^\d]/g,"")),spaces=k.replace(/[^ ]/g,"").length


return 0===spaces||n%spaces!==0?void abortConnection(socket,400,"Bad Request"):(n/=spaces,void md5.update(String.fromCharCode(n>>24&255,n>>16&255,n>>8&255,255&n)))

}),md5.update(nonce.toString("binary"))
var headers=["HTTP/1.1 101 Switching Protocols","Upgrade: WebSocket","Connection: Upgrade","Sec-WebSocket-Location: "+location]


"undefined"!=typeof protocol&&headers.push("Sec-WebSocket-Protocol: "+protocol),"undefined"!=typeof origin&&headers.push("Sec-WebSocket-Origin: "+origin),
socket.setTimeout(0),socket.setNoDelay(!0)
try{var headerBuffer=new Buffer(headers.concat("","").join("\r\n")),hashBuffer=new Buffer(md5.digest("binary"),"binary"),handshakeBuffer=new Buffer(headerBuffer.length+hashBuffer.length)


headerBuffer.copy(handshakeBuffer,0),hashBuffer.copy(handshakeBuffer,headerBuffer.length),socket.write(handshakeBuffer,"binary",function(err){
if(!err){var client=new WebSocket([req,socket,rest],{protocolVersion:"hixie-76",protocol:protocol})
self.options.clientTracking&&(self.clients.push(client),client.on("close",function(){var index=self.clients.indexOf(client)


index!=-1&&self.clients.splice(index,1)})),socket.removeListener("error",errorHandler),cb(client)}})}catch(e){
try{socket.destroy()}catch(e){}return}},nonceLength=8
if(upgradeHead&&upgradeHead.length>=nonceLength){var nonce=upgradeHead.slice(0,nonceLength),rest=upgradeHead.length>nonceLength?upgradeHead.slice(nonceLength):null


completeHandshake.call(self,nonce,rest)}else{var nonce=new Buffer(nonceLength)
upgradeHead.copy(nonce,0)
var received=upgradeHead.length,rest=null,handler=function(data){var toRead=Math.min(data.length,nonceLength-received)


0!==toRead&&(data.copy(nonce,received,0,toRead),received+=toRead,received==nonceLength&&(socket.removeListener("data",handler),
toRead<data.length&&(rest=data.slice(toRead)),completeHandshake.call(self,nonce,rest)))}
socket.on("data",handler)}}
if("function"==typeof this.options.verifyClient){var info={origin:origin,secure:"undefined"!=typeof req.connection.authorized||"undefined"!=typeof req.connection.encrypted,
req:req}
if(2==this.options.verifyClient.length){var self=this
return void this.options.verifyClient(info,function(result,code,name){"undefined"==typeof code&&(code=401),
"undefined"==typeof name&&(name=http.STATUS_CODES[code]),result?onClientVerified.apply(self):abortConnection(socket,code,name)

})}if(!this.options.verifyClient(info))return void abortConnection(socket,401,"Unauthorized")}onClientVerified()

}function acceptExtensions(offer){var extensions={},options=this.options.perMessageDeflate
if(options&&offer[PerMessageDeflate.extensionName]){var perMessageDeflate=new PerMessageDeflate(options!==!0?options:{},(!0))


perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]),extensions[PerMessageDeflate.extensionName]=perMessageDeflate

}return extensions}function abortConnection(socket,code,name){try{var response=["HTTP/1.1 "+code+" "+name,"Content-type: text/html"]


socket.write(response.concat("","").join("\r\n"))}catch(e){}finally{try{socket.destroy()}catch(e){}}}
var util=require("util"),events=require("events"),http=require("http"),crypto=require("crypto"),Options=require("options"),WebSocket=require("./WebSocket"),Extensions=require("./Extensions"),PerMessageDeflate=require("./PerMessageDeflate"),url=(require("tls"),
require("url"))
util.inherits(WebSocketServer,events.EventEmitter),WebSocketServer.prototype.close=function(callback){
var error=null
try{for(var i=0,l=this.clients.length;i<l;++i)this.clients[i].terminate()}catch(e){error=e}this.path&&this._server._webSocketPaths&&(delete this._server._webSocketPaths[this.path],
0==Object.keys(this._server._webSocketPaths).length&&delete this._server._webSocketPaths)
try{"undefined"!=typeof this._closeServer&&this._closeServer()}finally{delete this._server}if(callback)callback(error)
else if(error)throw error},WebSocketServer.prototype.handleUpgrade=function(req,socket,upgradeHead,cb){
if(this.options.path){var u=url.parse(req.url)
if(u&&u.pathname!==this.options.path)return}return"undefined"==typeof req.headers.upgrade||"websocket"!==req.headers.upgrade.toLowerCase()?void abortConnection(socket,400,"Bad Request"):void(req.headers["sec-websocket-key1"]?handleHixieUpgrade.apply(this,arguments):handleHybiUpgrade.apply(this,arguments))

},module.exports=WebSocketServer})


define("ws/index",[],function(require,exports,module){"use strict"
var WS=module.exports=require("./lib/WebSocket")
WS.Server=require("./lib/WebSocketServer"),WS.Sender=require("./lib/Sender"),WS.Receiver=require("./lib/Receiver"),
WS.createServer=function(options,fn){var server=new WS.Server(options)
return"function"==typeof fn&&server.on("connection",fn),server},WS.connect=WS.createConnection=function(address,fn){
var client=new WS(address)
return"function"==typeof fn&&client.on("open",fn),client}})


define("plugins/c9.ide.run.debug/debuggers/chrome/MessageReader",[],function(require,exports,module){
function readBytes(str,start,bytes){for(var consumed=0,i=start;i<str.length;i++){var code=str.charCodeAt(i)


if(code<127?consumed++:code>127&&code<=2047?consumed+=2:code>2047&&code<=65535&&(consumed+=3),code>=55296&&code<=56319&&i++,
consumed>=bytes){i++
break}}return{bytes:consumed,length:i-start}}var MessageReader=function(socket,callback){this.$socket=socket,
this.$callback=callback,this.$received="",this.$expectedBytes=0,this.$offset=0,this.$cbReceive=this.$onreceive.bind(this),
socket.on("data",this.$cbReceive)};(function(){this.$onreceive=function(data){this.$received+=data
for(var fullResponse;(fullResponse=this.$checkForWholeMessage())!==!1;)this.$callback(fullResponse)},
this.$checkForWholeMessage=function(){var fullResponse=!1,received=this.$received
if(!this.$expectedBytes){var i=received.indexOf("\r\n\r\n")
if(i!==-1){var c=received.lastIndexOf("Content-Length:",i)
if(c!=-1){var l=received.indexOf("\r\n",c),len=parseInt(received.substring(c+15,l),10)
this.$expectedBytes=len}this.headerOffset=this.$offset=i+4}}if(this.$expectedBytes){var result=readBytes(received,this.$offset,this.$expectedBytes)


this.$expectedBytes-=result.bytes,this.$offset+=result.length}return this.$offset&&this.$expectedBytes<=0&&(fullResponse=received.substring(this.headerOffset||0,this.$offset),
this.$received=received.substr(this.$offset),this.$offset=this.$expectedBytes=0),fullResponse},this.destroy=function(){
this.$socket&&this.$socket.removeListener("data",this.$cbReceive),delete this.$socket,delete this.$callback,
this.$received=""}}).call(MessageReader.prototype),module.exports=MessageReader})


define("plugins/c9.ide.run.debug/debuggers/chrome/Debugger",[],function(require,exports,module){function Debugger(options){
var clients=this.clients=[]
this.broadcast=function(message){"string"!=typeof message&&(message=JSON.stringify(message)),clients.forEach(function(c){
c.write(message+"\0")})}}function getDebuggerData(port,callback,retries){console.log("Connecting to port",port,retries),
null==retries&&(retries=MAX_RETRIES),request({host:"127.0.0.1",port:port,path:"/json/list"},function(err,res){
return err&&retries>0?setTimeout(function(){getDebuggerData(port,callback,retries-1)},RETRY_INTERVAL):(console.log(res),
void callback(err,res))})}function request(options,callback){var socket=new net.Socket
new MessageReader(socket,function(response){if(console.log("Initial connection response:",response),socket.end(),
response)try{response=JSON.parse(response)}catch(e){}callback(null,response)}),socket.on("error",function(e){
console.log("Initial connection error",options,e),socket.end(),callback(e)}),socket.connect(options.port,options.host),
socket.on("connect",function(){socket.write("GET "+options.path+" HTTP/1.1\r\nConnection: close\r\n\r\n")

})}var net=require("net"),WebSocket=require("ws/index"),MessageReader=require("./MessageReader"),EventEmitter=require("events").EventEmitter,RETRY_INTERVAL=300,MAX_RETRIES=100

;(function(){this.__proto__=EventEmitter.prototype,this.addClient=function(client){this.clients.push(client),
client["debugger"]=this},this.removeClient=function(client){var i=this.clients.indexOf(client)
i!=-1&&this.clients.splice(i,1),client["debugger"]=null},this.handleMessage=function(message){this.ws?this.ws.send(JSON.stringify(message)):this.v8Socket?this.v8Socket.send(message):console.error("recieved message when debugger is not ready",message)

},this.connect=function(options){getDebuggerData(options.port,function(err,res){if(err)return this.broadcast({
$:"error",message:err.message}),this.disconnect(),console.log(err)
var tabs=res
return tabs?(tabs.length>1&&console.log("connecting to first tab from "+tabs.length),void(tabs[0]&&tabs[0].webSocketDebuggerUrl&&this.connectToWebsocket(tabs[0].webSocketDebuggerUrl))):void this.connectToV8(options)

}.bind(this))},this.connectToWebsocket=function(url){var broadcast=this.broadcast,self=this,ws=new WebSocket(url)


ws.on("open",function(){console.log("connected"),broadcast({$:"connected"})}),ws.on("close",function(){
console.log("disconnected"),self.disconnect()}),ws.on("message",function(data){try{var parsed=JSON.parse(data)

}catch(e){}parsed&&"Runtime.consoleAPICalled"==parsed.method||broadcast(data)}),ws.on("error",function(e){
console.log("error",e),broadcast({$:"error",err:e}),self.disconnect()}),this.ws=ws},this.connectToV8=function(options){
var broadcast=this.broadcast,self=this,connection=net.connect(options.port,options.host)
connection.on("connect",function(){console.log("netproxy connected to debugger"),broadcast({$:"connected",
mode:"v8"})}),connection.on("error",function(e){console.log("error in v8 connection",e),self.disconnect()

}),connection.on("close",function(e){console.log("v8 connection closed",e),self.disconnect()}),new MessageReader(connection,function(response){
broadcast(response.toString("utf8"))}),connection.send=function(msg){msg.arguments&&!msg.arguments.maxStringLength&&(msg.arguments.maxStringLength=1e4)


var data=new Buffer(JSON.stringify(msg))
connection.write(new Buffer("Content-Length:"+data.length+"\r\n\r\n")),connection.write(data)},this.v8Socket=connection

},this.disconnect=function(){this.emit("disconnect"),this.clients.forEach(function(client){client.end()

}),this.ws&&this.ws.close(),this.v8Socket&&this.v8Socket.destroy()}}).call(Debugger.prototype),module.exports=Debugger

})


define("plugins/c9.ide.run.debug/debuggers/chrome/chrome-debug-proxy",[],function(require,exports,module){
function checkServer(id){var client=net.connect(socketPath,function(){if(!id)if(force){console.log("trying to replace existing process")


var strMsg=JSON.stringify({$:"exit"})
client.write(strMsg+"\0")}else console.log("process already exists"),process.exit(0)})
client.on("data",function(data){if(force)return console.log("old pid"+data)
try{var msg=JSON.parse(data.toString().slice(0,-1))}catch(e){}msg&&msg.ping!=id&&process.exit(1),client.destroy()

}),client.on("error",function(err){if(!id&&err){var code=err.code
if("ECONNREFUSED"==code||"ENOENT"===code||"EAGAIN"===code)return createServer()}process.exit(1)}),force&&client.once("close",function(){
server||createServer()})}function createServer(){server=net.createServer(function(client){function onData(data){
data=data.toString()
for(var idx;;){if(idx=data.indexOf("\0"),idx===-1)return data&&buff.push(data)
buff.push(data.substring(0,idx))
var clientMsg=buff.join("")
if(data=data.substring(idx+1),buff=[],"{"==clientMsg[0])try{var msg=JSON.parse(clientMsg)}catch(e){return console.log("error parsing message",clientMsg),
client.close()}else msg=clientMsg
client.emit("message",msg)}}function onClose(){isClosed||(isClosed=!0,delete ideClients[client.id],client["debugger"]&&client["debugger"].removeClient(client),
client.emit("disconnect"))}var isClosed=!1
client.id=$id++,ideClients[client.id]=client,client.send=function(msg){if(!isClosed){var strMsg=JSON.stringify(msg)


client.write(strMsg+"\0")}},client.on("data",onData)
var buff=[]
client.on("close",onClose),client.on("end",onClose),client.on("message",function(message){actions[message.$]?actions[message.$](message,client):client["debugger"]&&client["debugger"].handleMessage(message)

}),client.on("error",function(err){console.log(err),onClose(),client.destroy()}),client.send({ping:process.pid
})}),server.on("error",function(err){throw console.error("server error",err),err}),server.on("close",function(e){
console.log("server closed",e),process.exit(1)}),removeStaleSocket(),server.listen(socketPath,function(){
console.log("server listening on ",socketPath),checkServer(process.pid)})}function removeStaleSocket(){
if(!IS_WINDOWS)try{fs.unlinkSync(socketPath)}catch(e){"ENOENT"!=e.code&&console.error(e)}}var fs=require("fs"),net=require("net"),Debugger=require("./Debugger"),IS_WINDOWS=(require("./MessageReader"),
Date.now(),"win32"==process.platform),socketPath=process.env.HOME+"/.c9/chrome.sock"
IS_WINDOWS&&(socketPath="\\\\.\\pipe\\"+socketPath.replace(/\//g,"\\"))
var force=process.argv.indexOf("--force")!=-1
console.log("Using socket",socketPath)
var server,$id=0,ideClients={},debuggers={},actions={exit:function(message,client){process.exit(1)},ping:function(message,client){
message.$="pong",message.t=Date.now(),client.send(message)},connect:function(message,client,callback){
if(!debuggers[message.port]){var dbg=debuggers[message.port]=new Debugger
debuggers[message.port].connect(message),debuggers[message.port].on("disconnect",function(){debuggers[message.port]==dbg&&delete debuggers[message.port]

})}debuggers[message.port].addClient(client)},detach:function(message,client,callback){client["debugger"]&&client["debugger"].disconnect()

}},idle=0
setInterval(function(){console.log(Object.keys(ideClients),Object.keys(debuggers)),Object.keys(ideClients).length||Object.keys(debuggers).length?idle=0:idle++,
idle>2&&(console.log("No open connections, exiting"),process.exit(0))},3e4),checkServer()})

