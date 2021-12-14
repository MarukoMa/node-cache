
var http = require('http');
var fs = require('fs');
var url = require('url');
var crypto = require('crypto')
http.createServer( function (request, response) {  
   // 解析请求，包括文件名
   var urls = url.parse(request.url,true);
   // 从文件系统中读取请求的文件内容
   if(urls.pathname == '/'){
        fs.readFile('./index.html',function(err,data){
            if(!err){
                response.writeHead(200,{             //HTML设置强缓存
                    'Cache-Control':'max-age=300',
                    'Expirse':new Date(Date.now() + 300000)
                }) 
        
                response.end(data);
            }else{
                console.log(err)
            }
        })
   }else{
        let statsName = fs.statSync('.' + request.url);
        let ifModifiedSince = request.headers['if-modified-since']        //last-modified就是资源的修改时间:(1s以内的频繁修改不适用)
        // if(ifModifiedSince === statsName.mtime.toGMTString()){
        //         response.writeHead(304) 
        //     response.end()    //直接返回，从缓存中取值
        // }else{
        //     fs.readFile('.' + request.url,function(err,data){
        //         if(!err){
        //             response.writeHead(200,{
        //                 'Cache-Control':'no-cache',
        //                 'Last-Modified':statsName.mtime.toGMTString()
        //             }) 
        //             response.end(data);
        //         }else{
        //             console.log(err)
        //         }
        //     })  
        // }


        //使用nodejs内置的crypto模块来计算文件的hash值，并用十六进制的字符串表示
        // fs.readFile('.' + request.url,(err,data)=>{
        //     let hash = crypto.createHash('md5').update(data).digest('base64')
        //     let ifNoneMatch = request.headers['if-none-match']
        //     if(ifNoneMatch === hash){
        //         response.writeHead(304) 
        //         response.end()
        //     }else{
        //         response.writeHead(200,{
        //             'Cache-Control':'no-cache',
        //             'Etag':hash
        //         }) 
        //         response.end(data)
        //     }
        // })
        
        
        fs.readFile('.' + request.url,(err,data)=>{
            let hash = crypto.createHash('md5').update(data).digest('base64')
            let ifNoneMatch = request.headers['if-none-match']
            if(ifNoneMatch === hash || ifModifiedSince === statsName.mtime.toGMTString()){
                response.writeHead(304) 
                response.end()
            }else{
                response.writeHead(200,{
                    'Cache-Control':'no-cache',
                    'Etag':hash,
                    'Last-Modified':statsName.mtime.toGMTString()
                }) 
                response.end(data)
            }
        })  
   } 
}).listen(8080);
// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:8080/');